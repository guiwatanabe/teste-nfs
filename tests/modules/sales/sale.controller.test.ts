import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { buildApi } from '../../../src/main/build-api';
import type { FastifyInstance } from 'fastify';
import { findSalesByUserId, createSale } from '../../../src/modules/sales/sale.service';
import { saleQueue } from '../../../src/queue/sale-queue';

const mockTransaction = vi.hoisted(() => vi.fn(async (fn: (tx: unknown) => Promise<unknown>) => fn({})));

vi.mock('../../../src/db/connection', () => ({
  getDbConnection: vi.fn(() => ({ transaction: mockTransaction })),
}));

const validSaleBody = {
  identification: 'Test Company',
  cpf_cnpj: '12.345.678/0001-90',
  municipal_state_registration: '123456',
  address: '123 Test St',
  phone_number: '(11) 99999-9999',
  email: 'test@test.com',
  amount: 100.5,
  description: 'Test service',
};

describe('sale.controller', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApi();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /sales', () => {
    it('returns 401 without token', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/sales',
      });
      expect(response.statusCode).toBe(401);
    });

    it('returns 200 with an empty array when user has no sales', async () => {
      vi.mocked(findSalesByUserId).mockResolvedValueOnce([]);
      const token = app.jwt.sign({ id: 1, email: 'test@test.com' });
      const response = await app.inject({
        method: 'GET',
        url: '/sales',
        cookies: { authToken: token },
      });
      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual([]);
    });

    it('returns 200 with sale list when user has sales', async () => {
      const mockSales = [
        {
          id: 1,
          uid: 'sale-uid-1',
          user_id: 1,
          identification: 'Company A',
          cpf_cnpj: '12345678000190',
          address: '1 Main St',
          address_number: null,
          address_complement: null,
          address_neighborhood: null,
          address_city: 'City',
          address_state: 'SP',
          address_zip_code: '00000-000',
          phone_number: '11999999999',
          email: 'a@test.com',
          amount: 5000,
          description: 'Service A',
          status: 'SUCCESS',
          xml_data: null,
          protocol: 'PROT-001',
          error_message: null,
          processed_at: null,
          process_response: null,
        },
      ];
      vi.mocked(findSalesByUserId).mockResolvedValueOnce(mockSales as any);
      const token = app.jwt.sign({ id: 1, email: 'test@test.com' });
      const response = await app.inject({
        method: 'GET',
        url: '/sales',
        cookies: { authToken: token },
      });
      expect(response.statusCode).toBe(200);
      expect(response.json()).toHaveLength(1);
      expect(response.json()[0].uid).toBe('sale-uid-1');
    });
  });

  describe('POST /sales', () => {
    it('returns 401 without token', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/sales',
        payload: validSaleBody,
      });
      expect(response.statusCode).toBe(401);
    });

    it('returns 422 when body is missing required fields', async () => {
      const token = app.jwt.sign({ id: 1, email: 'test@test.com' });
      const response = await app.inject({
        method: 'POST',
        url: '/sales',
        cookies: { authToken: token },
        payload: { identification: 'Only this field' },
      });
      expect(response.statusCode).toBe(422);
    });

    it('returns 202 with saleId and PROCESSING status on success', async () => {
      vi.mocked(createSale).mockResolvedValueOnce({} as any);
      const token = app.jwt.sign({ id: 1, email: 'test@test.com' });
      const response = await app.inject({
        method: 'POST',
        url: '/sales',
        cookies: { authToken: token },
        payload: validSaleBody,
      });
      expect(response.statusCode).toBe(202);
      const body = response.json();
      expect(body.status).toBe('PROCESSING');
      expect(body.saleId).toBeDefined();
      expect(typeof body.saleId).toBe('string');
    });

    it('enqueues a job with the saleId on success', async () => {
      vi.mocked(createSale).mockResolvedValueOnce({} as any);
      const token = app.jwt.sign({ id: 1, email: 'test@test.com' });
      await app.inject({
        method: 'POST',
        url: '/sales',
        cookies: { authToken: token },
        payload: validSaleBody,
      });
      expect(saleQueue.add).toHaveBeenCalled();
    });

    it('converts amount to integer cents before saving', async () => {
      let capturedSale: any;
      vi.mocked(createSale).mockImplementationOnce(async (sale) => {
        capturedSale = sale;
        return {} as any;
      });
      const token = app.jwt.sign({ id: 1, email: 'test@test.com' });
      await app.inject({
        method: 'POST',
        url: '/sales',
        cookies: { authToken: token },
        payload: { ...validSaleBody, amount: 99.99 },
      });
      expect(capturedSale.amount).toBe(9999);
    });

    it('returns 500 when the queue fails', async () => {
      vi.mocked(createSale).mockResolvedValueOnce({} as any);
      vi.mocked(saleQueue.add).mockRejectedValueOnce(new Error('Queue error'));
      const token = app.jwt.sign({ id: 1, email: 'test@test.com' });
      const response = await app.inject({
        method: 'POST',
        url: '/sales',
        cookies: { authToken: token },
        payload: validSaleBody,
      });
      expect(response.statusCode).toBe(500);
    });
  });
});
