import 'dotenv/config';
import Fastify, { type FastifyReply, type FastifyRequest } from 'fastify';
import generateRandomProtocol from '../util/protocol.js';

const APP_HOST = process.env.HOST ?? '0.0.0.0';
const APP_PORT = Number(process.env.MOCK_PORT ?? 3001);
const RESPONSE_DELAY = Number(process.env.MOCK_RESPONSE_DELAY ?? 2000);

const app = Fastify({
  logger: true,
});

app.addContentTypeParser(
  ['application/xml', 'text/xml'],
  { parseAs: 'string' },
  (req: FastifyRequest, body: string, done: (err: Error | null, body?: string) => void) => {
    done(null, body);
  }
);

app.post('/nfse', async (request: FastifyRequest, response: FastifyReply) => {
  console.log(`[mock] Received NFSe request.`);

  if (RESPONSE_DELAY > 0) {
    await new Promise<void>(resolve => setTimeout(resolve, RESPONSE_DELAY));
  }

  const isSuccess: boolean = Math.random() < 0.75;

  console.log(`[mock] Responding to NFSe request with status: ${isSuccess ? 'success' : 'error'}`);

  if (!isSuccess) {
    response.code(422);
    return {
      status: 'error',
      message: 'Não foi possível processar a NFS-e. Tente novamente mais tarde.',
      protocolo: generateRandomProtocol(),
    };
  }

  return {
    status: 'ok',
    message: 'NFS-e processada com sucesso.',
    protocolo: generateRandomProtocol(),
  };
});

app.listen({ host: APP_HOST, port: APP_PORT }, (err: Error | null, address: string) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
  app.log.info(`Server listening at ${address}`);
});
