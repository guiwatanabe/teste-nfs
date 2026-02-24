import 'dotenv/config';
import { Job } from 'bullmq';
import { findSaleByUid, updateSale } from '../../modules/sales/sale.service.js';
import { decryptText } from '../../util/encryption.js';
import { extractCertificateData, signXml } from '../../util/certificate.js';
import { findCertificateByUserId } from '../../modules/certificates/certificate.service.js';
import { buildInvoiceXml, type NFSData } from '../../util/xml-builder.js';
import { findUserById } from '../../modules/users/user.service.js';
import axios, { AxiosError } from 'axios';
import type { Sale } from '../../modules/sales/sale.model.js';

interface MockResponse {
  status: 'ok' | 'error';
  message: string;
  protocolo: string;
}

if (!process.env.MOCK_HOST) {
  throw new Error('MOCK_HOST is not defined.');
}

if (!process.env.MOCK_PORT) {
  throw new Error('MOCK_PORT is not defined.');
}

export async function processSaleJob(job: Job) {
  const { saleId } = job.data;
  let sale: Sale | null = null;
  try {
    sale = await findSaleByUid(saleId);
    if (!sale) {
      throw new Error(`Sale with ID ${saleId} not found.`);
    }

    const user = await findUserById(sale.user_id);
    if (!user) {
      throw new Error(`User with ID ${sale.user_id} not found.`);
    }

    const nfsData: NFSData = {
      InscricaoPrestador: user.municipal_state_registration!,
      NumeroNFe: '1234',
      CodigoVerificacao: sale.protocol ?? '',
      DataEmissaoNFe: new Date().toISOString(),
      DataFatoGeradorNFe: new Date().toISOString(),
      NumeroLote: '123',
      CNPJPrestador: user.cpf_cnpj,
      RazaoSocialPrestador: user.identification,
      Logradouro: user.address,
      NumeroEndereco: user.address_number ?? 'S/N',
      Cidade: user.address_city,
      CodigoMunicipio: user.address_municipal_code,
      UF: user.address_state,
      CEP: user.address_zip_code,
      StatusNFe: 'N',
      TributacaoNFe: 'T',
      OpcaoSimples: '4',
      ValorServicos: Number((sale.amount / 100).toFixed(2)).toString(),
      CodigoServico: '1234',
      AliquotaServicos: '0',
      ValorISS: '0',
      ValorCredito: '0',
      ISSRetido: 'false',
      CPFTomador: sale.cpf_cnpj,
      RazaoSocialTomador: sale.identification,
      TomadorLogradouro: sale.address,
      TomadorNumeroEndereco: sale.address_number ?? 'S/N',
      TomadorBairro: sale.address_neighborhood!,
      TomadorCidade: sale.address_city,
      TomadorUF: sale.address_state,
      TomadorCEP: sale.address_zip_code,
      EmailTomador: sale.email,
      Discriminacao: sale.description,
      FonteCargaTributaria: null,
    };

    const xmlData = buildInvoiceXml(nfsData);

    const userCertificate = await findCertificateByUserId(user.id);
    if (!userCertificate) {
      throw new Error(`Certificate for user ID ${user.id} not found.`);
    }

    const certData = extractCertificateData(
      userCertificate.certificate_path,
      decryptText(userCertificate.certificate_password)
    );

    const signedXml = signXml(xmlData, certData);

    await updateSale(saleId, { xml_data: signedXml });

    const mockUrl = `http://${process.env.MOCK_HOST}:${process.env.MOCK_PORT}/nfse`;

    try {
      const response = await axios.post<MockResponse>(mockUrl, signedXml, {
        headers: {
          'Content-Type': 'application/xml',
        },
        timeout: 10000,
        family: 4,
      });

      await updateSale(saleId, {
        protocol: response.data.protocolo,
        process_response: JSON.stringify(response.data),
        error_message: null,
        processed_at: new Date(),
        status: 'SUCCESS',
      });

      const updatedSale = await findSaleByUid(saleId);
      await fireWebhook(updatedSale!);
    } catch (error) {
      const errorData = axios.isAxiosError(error)
        ? (error.response?.data as Partial<MockResponse> | string) || error.message
        : String(error);

      await updateSale(saleId, {
        protocol: (errorData as Partial<MockResponse>).protocolo || null,
        process_response: JSON.stringify(errorData),
        error_message: typeof errorData === 'string' ? errorData : (errorData.message ?? null),
        processed_at: new Date(),
        status: 'ERROR',
      });
    }
  } catch (error) {
    if (sale) {
      await updateSale(saleId, {
        status: 'ERROR',
        error_message: error instanceof Error ? error.message : String(error),
        processed_at: new Date(),
      });
    }
    throw error;
  }
}

const fireWebhook = async (sale: Sale) => {
  const webhookUrl = process.env.WEBHOOK_URL ?? '';

  if (webhookUrl === '') {
    console.warn('[process-sale::fireWebhook] WEBHOOK_URL is empty, skipping webhook call.');
    return;
  }

  try {
    await axios.post(
      webhookUrl,
      {
        uid: sale.uid,
        status: sale.status,
        protocol: sale.protocol,
        amount: sale.amount,
        description: sale.description,
        userName: sale.identification,
        processedAt: sale.processed_at,
      },
      { family: 4 }
    );
    console.log(
      `[process-sale::fireWebhook] Successfully fired webhook for sale ${sale.uid}, status: ${sale.status}`
    );
  } catch (error: any) {
    if (error instanceof AxiosError) {
      console.error(
        `[process-sale::fireWebhook] Failed to fire webhook for sale ${sale.uid}:`,
        error.message,
        'Response data:',
        error.response?.data
      );
    } else {
      console.error(
        `[process-sale::fireWebhook] Failed to fire webhook for sale ${sale.uid}:`,
        error.message ?? error
      );
    }
  }
};
