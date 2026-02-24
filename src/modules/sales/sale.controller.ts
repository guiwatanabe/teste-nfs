import {
  type FastifyInstance,
  type FastifyReply,
  type FastifyRequest,
  type onRequestHookHandler,
} from 'fastify';
import saleSchema from './sale.schema.js';
import { randomUUID } from 'crypto';
import { createSale, findSalesByUserId } from './sale.service.js';
import type { Sale } from './sale.model.js';
import { saleQueue } from '../../queue/sale-queue.js';
import type { User } from '../users/user.model.js';
import { getDbConnection } from '../../db/connection.js';

const db = getDbConnection();

export async function registerSaleRoutes(app: FastifyInstance) {
  app.route({
    method: 'GET',
    url: '/sales',
    onRequest: [app.getDecorator('authenticate') as onRequestHookHandler],
    handler: async (request: FastifyRequest, response: FastifyReply) => {
      const user = request.user as Partial<User>;
      const sales = await findSalesByUserId(user.id!);
      response.send(sales);
    },
  });

  app.route({
    method: 'POST',
    url: '/sales',
    onRequest: [app.getDecorator('authenticate') as onRequestHookHandler],
    schema: { body: saleSchema },
    handler: async (request: FastifyRequest, response: FastifyReply) => {
      const uuid = randomUUID();
      const user = request.user as Partial<User>;

      const saleData = request.body as Omit<Sale, 'id'>;
      const sale = { ...saleData, uid: uuid, user_id: user.id!, status: 'PROCESSING' };

      sale.amount = Math.round(sale.amount * 100);

      await db.transaction(async tx => {
        await createSale(sale, tx);
        try {
          await saleQueue.add(saleQueue.name, { saleId: uuid }, { jobId: uuid });
        } catch (err) {
          app.log.error(err);
          throw err;
        }
      });

      response
        .status(202)
        .send({ message: 'Sale created successfully.', saleId: uuid, status: 'PROCESSING' });
    },
  });
}
