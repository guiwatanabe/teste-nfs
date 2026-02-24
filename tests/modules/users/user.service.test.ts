import { describe, it, expect, vi, beforeEach } from 'vitest';

const {
  mockExecute,
  mockLimit,
  mockWhere,
  mockFrom,
  mockSelect,
  mockDb,
} = vi.hoisted(() => {
  const mockExecute = vi.fn();
  const mockLimit = vi.fn(() => ({ execute: mockExecute }));
  const mockWhere = vi.fn(() => ({ execute: mockExecute, limit: mockLimit }));
  const mockFrom = vi.fn(() => ({ where: mockWhere }));
  const mockSelect = vi.fn(() => ({ from: mockFrom }));
  const mockDb = { select: mockSelect };
  return { mockExecute, mockLimit, mockWhere, mockFrom, mockSelect, mockDb };
});

vi.mock('../../../src/db/connection', () => ({
  getDbConnection: vi.fn(() => mockDb),
}));

vi.unmock('../../../src/modules/users/user.service');

import { findUserByUsername, findUserById } from '../../../src/modules/users/user.service';
import type { User } from '../../../src/modules/users/user.model';

const mockUser: User = {
  id: 1,
  identification: 'Test User',
  cpf_cnpj: '12345678000190',
  municipal_state_registration: null,
  address: '123 Test St',
  address_number: null,
  address_complement: null,
  address_neighborhood: null,
  address_municipal_code: '3550308',
  address_city: 'São Paulo',
  address_state: 'SP',
  address_zip_code: '01310-100',
  phone_number: '11999999999',
  email: 'test@test.com',
  username: 'testuser',
  password_hash: 'hashed-password',
};

describe('user.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.mockReturnValue({ where: mockWhere });
    mockWhere.mockReturnValue({ execute: mockExecute, limit: mockLimit });
    mockLimit.mockReturnValue({ execute: mockExecute });
  });

  describe('findUserByUsername', () => {
    it('returns user if found', async () => {
      mockExecute.mockResolvedValueOnce([mockUser]);
      const result = await findUserByUsername('testuser');
      expect(result).toEqual(mockUser);
    });

    it('returns null if not found', async () => {
      mockExecute.mockResolvedValueOnce([]);
      const result = await findUserByUsername('nonexistent');
      expect(result).toBeNull();
    });

    it('queries with limit(1)', async () => {
      mockExecute.mockResolvedValueOnce([mockUser]);
      await findUserByUsername('testuser');
      expect(mockSelect).toHaveBeenCalled();
      expect(mockFrom).toHaveBeenCalled();
      expect(mockWhere).toHaveBeenCalled();
      expect(mockLimit).toHaveBeenCalledWith(1);
    });
  });

  describe('findUserById', () => {
    it('returns user if found', async () => {
      mockExecute.mockResolvedValueOnce([mockUser]);
      const result = await findUserById(1);
      expect(result).toEqual(mockUser);
    });

    it('returns null if not found', async () => {
      mockExecute.mockResolvedValueOnce([]);
      const result = await findUserById(99);
      expect(result).toBeNull();
    });

    it('queries with limit(1)', async () => {
      mockExecute.mockResolvedValueOnce([mockUser]);
      await findUserById(1);
      expect(mockLimit).toHaveBeenCalledWith(1);
    });
  });
});
