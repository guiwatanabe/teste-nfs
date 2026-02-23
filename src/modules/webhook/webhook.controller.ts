import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
export async function registerWebhookRoute(app: FastifyInstance) {
  app.route({
    method: 'POST',
    url: '/webhook',
    handler: async (request: FastifyRequest, response: FastifyReply) => {
      // exemplo - endpoint webhook
      console.log('[webhook] Received webhook with body:', request.body);
      response.send({ message: 'Webhook received.' });
    },
  });
}
