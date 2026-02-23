import { XMLBuilder } from 'fast-xml-parser';

export type NFSData = {
  InscricaoPrestador: string;
  NumeroNFe: string;
  CodigoVerificacao: string;
  DataEmissaoNFe: string;
  DataFatoGeradorNFe: string;
  NumeroLote: string;
  CNPJPrestador: string;
  RazaoSocialPrestador: string;
  Logradouro: string;
  NumeroEndereco: string;
  Cidade: string;
  CodigoMunicipio: string;
  UF: string;
  CEP: string;
  StatusNFe: string;
  TributacaoNFe: string;
  OpcaoSimples: string;
  ValorServicos: string;
  CodigoServico: string;
  AliquotaServicos: string;
  ValorISS: string;
  ValorCredito: string;
  ISSRetido: string;
  CPFTomador: string;
  RazaoSocialTomador: string;
  TomadorLogradouro: string;
  TomadorNumeroEndereco: string;
  TomadorBairro: string;
  TomadorCidade: string;
  TomadorUF: string;
  TomadorCEP: string;
  EmailTomador: string;
  Discriminacao: string;
  FonteCargaTributaria: string | null;
};

export function buildInvoiceXml(data: NFSData): string {
  const builder = new XMLBuilder({
    ignoreAttributes: false,
    format: true,
    indentBy: '  ',
    suppressEmptyNode: true,
  });

  const json = {
    NFe: data,
  };

  return builder.build(json);
}
