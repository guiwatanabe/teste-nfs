import {
  type FastifyInstance,
  type FastifyReply,
  type FastifyRequest,
  type onRequestHookHandler,
} from 'fastify';
import { createCertificate, findCertificateByUserId } from './certificate.service.js';
import type { Certificate } from './certificate.model.js';
import { certificatesDir } from '../../util/create-paths.js';
import { writeFile } from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';
import { encryptText } from '../../util/encryption.js';
import type { User } from '../users/user.model.js';

export async function registerCertificateRoutes(app: FastifyInstance) {
  app.route({
    method: 'GET',
    url: '/certificate',
    onRequest: [app.getDecorator('authenticate') as onRequestHookHandler],
    handler: async (request: FastifyRequest, response: FastifyReply) => {
      const user = request.user as Partial<User>;
      const certificate = await findCertificateByUserId(user.id!);
      if (!certificate) {
        return response.status(404).send({ message: 'Certificate not found.' });
      }

      response.send(certificate);
    },
  });

  app.route({
    method: 'POST',
    url: '/certificate',
    onRequest: [app.getDecorator('authenticate') as onRequestHookHandler],
    handler: async (request: FastifyRequest, response: FastifyReply) => {
      const user = request.user as Partial<User>;

      let fileBuffer: Buffer | null = null;
      let originalFilename: string | null = null;
      let password: string | null = null;

      for await (const part of request.parts()) {
        if (part.type === 'file') {
          const mimetype = part.mimetype;
          if (
            mimetype !== 'application/x-pkcs12' &&
            mimetype !== 'application/octet-stream' &&
            !part.filename.endsWith('.pfx')
          ) {
            response
              .status(400)
              .send({ message: 'Invalid file type. Only .pfx files are allowed.' });
            return;
          }

          originalFilename = part.filename;
          fileBuffer = await part.toBuffer();
        } else if (part.type === 'field') {
          if (part.fieldname === 'certificate_password') {
            password = part.value as string;
          }
        }
      }

      if (!fileBuffer || !password) {
        return response.status(400).send({ message: 'Missing file or password.' });
      }

      const storedFilename = `${randomUUID()}.pfx`;
      const filepath = path.join(certificatesDir, storedFilename);

      await writeFile(filepath, fileBuffer);

      const certificate: Omit<Certificate, 'id'> = {
        user_id: user.id!,
        certificate_path: filepath,
        certificate_password: encryptText(password),
        created_at: new Date(),
      };

      await createCertificate(certificate);

      response.send({
        message: 'Certificate uploaded successfully.',
        filename: originalFilename,
        mimetype: 'application/x-pkcs12',
        encoding: 'binary',
        path: filepath,
      });
    },
  });
}
