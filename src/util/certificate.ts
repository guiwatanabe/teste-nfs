import { readFileSync } from 'fs';
import forge from 'node-forge';
import { SignedXml } from 'xml-crypto';

type CertificateData = {
  privateKey: string;
  certificate: string;
};

export function extractCertificateData(pfxPath: string, password: string): CertificateData {
  const pfxBuffer = readFileSync(pfxPath);
  const pfxBase64 = pfxBuffer.toString('base64');

  const pfxDer = forge.util.decode64(pfxBase64);
  const pfxAsn1 = forge.asn1.fromDer(pfxDer);
  const pfx = forge.pkcs12.pkcs12FromAsn1(pfxAsn1, false, password);

  const keyBagId = forge.pki.oids.pkcs8ShroudedKeyBag!;
  const keyBags = pfx.getBags({ bagType: keyBagId })[keyBagId];

  if (!keyBags || keyBags.length === 0) {
    throw new Error('No private key found in certificate');
  }

  const keyBag = keyBags[0];
  if (!keyBag) {
    throw new Error('Key bag is undefined');
  }

  const key = keyBag.key;
  if (!key) {
    throw new Error('Private key is undefined in certificate bag');
  }

  const privateKey = forge.pki.privateKeyToPem(key);

  const certBagId = forge.pki.oids.certBag!;
  const certBag = pfx.getBags({ bagType: certBagId })[certBagId];

  if (!certBag || certBag.length === 0) {
    throw new Error('No certificate found in certificate bag');
  }

  const certBagItem = certBag[0];
  if (!certBagItem || !certBagItem.cert) {
    throw new Error('Certificate is undefined in certificate bag');
  }

  const certificate = forge.pki.certificateToPem(certBagItem.cert);

  return { privateKey, certificate };
}

export function signXml(xml: string, certData: CertificateData): string {
  const signedXml = new SignedXml({
    privateKey: certData.privateKey,
    publicCert: certData.certificate,
  });

  signedXml.addReference({
    xpath: "//*[local-name(.)='NFe']",
    digestAlgorithm: 'http://www.w3.org/2000/09/xmldsig#sha1',
    transforms: ['http://www.w3.org/2001/10/xml-exc-c14n#'],
  });

  signedXml.canonicalizationAlgorithm = 'http://www.w3.org/2001/10/xml-exc-c14n#';
  signedXml.signatureAlgorithm = 'http://www.w3.org/2000/09/xmldsig#rsa-sha1';
  signedXml.computeSignature(xml);

  return signedXml.getSignedXml();
}
