import { describe, it, expect, vi, beforeEach } from 'vitest';

const {
  mockExecute,
  mockReturning,
  mockWhere,
  mockLimit,
  mockOrderBy,
  mockFrom,
  mockSelect,
  mockSet,
  mockUpdate,
  mockValues,
  mockInsert,
  mockDb,
} = vi.hoisted(() => {
  const mockExecute = vi.fn();
  const mockReturning = vi.fn(() => ({ execute: mockExecute }));
  const mockLimit = vi.fn(() => ({ execute: mockExecute }));
  const mockOrderBy = vi.fn(() => ({ execute: mockExecute }));
  const mockWhere = vi.fn(() => ({
    execute: mockExecute,
    returning: mockReturning,
    limit: mockLimit,
    orderBy: mockOrderBy,
  }));
  const mockFrom = vi.fn(() => ({ where: mockWhere }));
  const mockSelect = vi.fn(() => ({ from: mockFrom }));
  const mockSet = vi.fn(() => ({ where: mockWhere }));
  const mockUpdate = vi.fn(() => ({ set: mockSet }));
  const mockValues = vi.fn(() => ({ returning: mockReturning }));
  const mockInsert = vi.fn(() => ({ values: mockValues }));
  const mockDb = { select: mockSelect, update: mockUpdate, insert: mockInsert };
  return {
    mockExecute,
    mockReturning,
    mockWhere,
    mockLimit,
    mockOrderBy,
    mockFrom,
    mockSelect,
    mockSet,
    mockUpdate,
    mockValues,
    mockInsert,
    mockDb,
  };
});

vi.mock('../../../src/db/connection', () => ({
  getDbConnection: vi.fn(() => mockDb),
}));

vi.unmock('../../../src/modules/sales/sale.service');

import {
  findSaleByUid,
  findSalesByUserId,
  createSale,
  updateSaleStatus,
  updateSale,
} from '../../../src/modules/sales/sale.service';
import type { Sale } from '../../../src/modules/sales/sale.model';

const mockSale: Sale = {
  id: 1,
  user_id: 1,
  uid: 'abc-123',
  identification: 'Test Company',
  cpf_cnpj: '12345678000190',
  address: '123 Test St',
  address_number: null,
  address_complement: null,
  address_neighborhood: null,
  address_city: 'São Paulo',
  address_state: 'SP',
  address_zip_code: '01310-100',
  phone_number: '11999999999',
  email: 'test@test.com',
  amount: 10050,
  description: 'Test service',
  status: 'PROCESSING',
  xml_data: null,
  protocol: null,
  error_message: null,
  processed_at: null,
  process_response: null,
};

describe('sale.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.mockReturnValue({ where: mockWhere });
    mockWhere.mockReturnValue({
      execute: mockExecute,
      returning: mockReturning,
      limit: mockLimit,
      orderBy: mockOrderBy,
    });
    mockLimit.mockReturnValue({ execute: mockExecute });
    mockOrderBy.mockReturnValue({ execute: mockExecute });
    mockReturning.mockReturnValue({ execute: mockExecute });
    mockSet.mockReturnValue({ where: mockWhere });
  });

  describe('findSaleByUid', () => {
    it('returns sale if found', async () => {
      mockExecute.mockResolvedValueOnce([mockSale]);
      const result = await findSaleByUid('abc-123');
      expect(result).toEqual(mockSale);
    });

    it('returns null if not found', async () => {
      mockExecute.mockResolvedValueOnce([]);
      const result = await findSaleByUid('nonexistent');
      expect(result).toBeNull();
    });

    it('queries with the correct uid', async () => {
      mockExecute.mockResolvedValueOnce([mockSale]);
      await findSaleByUid('abc-123');
      expect(mockSelect).toHaveBeenCalled();
      expect(mockFrom).toHaveBeenCalled();
      expect(mockWhere).toHaveBeenCalled();
      expect(mockLimit).toHaveBeenCalledWith(1);
    });
  });

  describe('findSalesByUserId', () => {
    it('returns list of sales for a user', async () => {
      mockExecute.mockResolvedValueOnce([mockSale]);
      const result = await findSalesByUserId(1);
      expect(result).toEqual([mockSale]);
    });

    it('returns empty array if no sales found', async () => {
      mockExecute.mockResolvedValueOnce([]);
      const result = await findSalesByUserId(99);
      expect(result).toEqual([]);
    });

    it('applies orderBy when querying', async () => {
      mockExecute.mockResolvedValueOnce([mockSale]);
      await findSalesByUserId(1);
      expect(mockOrderBy).toHaveBeenCalled();
    });
  });

  describe('createSale', () => {
    const newSale: Omit<Sale, 'id'> = {
      user_id: 1,
      uid: 'new-uid-456',
      identification: 'New Company',
      cpf_cnpj: '98765432000100',
      address: '456 New St',
      address_number: null,
      address_complement: null,
      address_neighborhood: null,
      address_city: 'Rio de Janeiro',
      address_state: 'RJ',
      address_zip_code: '20040-020',
      phone_number: '21988888888',
      email: 'new@test.com',
      amount: 5000,
      description: 'New service',
      status: 'PROCESSING',
      xml_data: null,
      protocol: null,
      error_message: null,
      processed_at: null,
      process_response: null,
    };

    it('inserts a new sale and returns it', async () => {
      const created = { id: 2, ...newSale };
      mockExecute.mockResolvedValueOnce([created]);
      const result = await createSale(newSale);
      expect(mockInsert).toHaveBeenCalled();
      expect(mockValues).toHaveBeenCalledWith(newSale);
      expect(result).toEqual(created);
    });

    it('uses provided transaction instead of default db', async () => {
      const txExecute = vi.fn().mockResolvedValueOnce([{ id: 3, ...newSale }]);
      const txReturning = vi.fn(() => ({ execute: txExecute }));
      const txValues = vi.fn(() => ({ returning: txReturning }));
      const txInsert = vi.fn(() => ({ values: txValues }));
      const mockTx = { insert: txInsert } as any;

      const result = await createSale(newSale, mockTx);
      expect(txInsert).toHaveBeenCalled();
      expect(mockInsert).not.toHaveBeenCalled();
      expect(result).toMatchObject({ user_id: 1 });
    });
  });

  describe('updateSaleStatus', () => {
    it('updates the status of a sale by uid', async () => {
      mockExecute.mockResolvedValueOnce([]);
      await updateSaleStatus('abc-123', 'SUCCESS');
      expect(mockUpdate).toHaveBeenCalled();
      expect(mockSet).toHaveBeenCalledWith({ status: 'SUCCESS' });
      expect(mockWhere).toHaveBeenCalled();
    });

    it('uses provided transaction instead of default db', async () => {
      const txExecute = vi.fn().mockResolvedValueOnce([]);
      const txWhere = vi.fn(() => ({ execute: txExecute }));
      const txSet = vi.fn(() => ({ where: txWhere }));
      const txUpdate = vi.fn(() => ({ set: txSet }));
      const mockTx = { update: txUpdate } as any;

      await updateSaleStatus('abc-123', 'ERROR', mockTx);
      expect(txUpdate).toHaveBeenCalled();
      expect(mockUpdate).not.toHaveBeenCalled();
    });
  });

  describe('updateSale', () => {
    it('updates sale fields by uid', async () => {
      mockExecute.mockResolvedValueOnce([]);
      await updateSale('abc-123', { protocol: 'PROT-001', status: 'SUCCESS' });
      expect(mockUpdate).toHaveBeenCalled();
      expect(mockSet).toHaveBeenCalledWith({ protocol: 'PROT-001', status: 'SUCCESS' });
      expect(mockWhere).toHaveBeenCalled();
    });

    it('uses provided transaction instead of default db', async () => {
      const txExecute = vi.fn().mockResolvedValueOnce([]);
      const txWhere = vi.fn(() => ({ execute: txExecute }));
      const txSet = vi.fn(() => ({ where: txWhere }));
      const txUpdate = vi.fn(() => ({ set: txSet }));
      const mockTx = { update: txUpdate } as any;

      await updateSale('abc-123', { error_message: 'Failed' }, mockTx);
      expect(txUpdate).toHaveBeenCalled();
      expect(mockUpdate).not.toHaveBeenCalled();
    });
  });
});
