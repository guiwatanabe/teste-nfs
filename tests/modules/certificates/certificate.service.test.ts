import { describe, it, expect, vi, beforeEach } from 'vitest';

const {
  mockExecute,
  mockReturning,
  mockWhere,
  mockLimit,
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
  const mockWhere = vi.fn(() => ({ execute: mockExecute, returning: mockReturning, limit: mockLimit }));
  const mockFrom = vi.fn(() => ({ where: mockWhere }));
  const mockSelect = vi.fn(() => ({ from: mockFrom }));
  const mockSet = vi.fn(() => ({ where: mockWhere }));
  const mockUpdate = vi.fn(() => ({ set: mockSet }));
  const mockValues = vi.fn(() => ({ returning: mockReturning }));
  const mockInsert = vi.fn(() => ({ values: mockValues }));
  const mockDb = { select: mockSelect, update: mockUpdate, insert: mockInsert };
  return { mockExecute, mockReturning, mockWhere, mockLimit, mockFrom, mockSelect, mockSet, mockUpdate, mockValues, mockInsert, mockDb };
});

vi.mock('../../../src/db/connection', () => ({
  getDbConnection: vi.fn(() => mockDb),
}));

vi.unmock('../../../src/modules/certificates/certificate.service');

import {
  findCertificateById,
  findCertificateByUserId,
  createCertificate,
} from '../../../src/modules/certificates/certificate.service';
import type { Certificate } from '../../../src/modules/certificates/certificate.model';

const mockCertificate: Certificate = {
  id: 1,
  user_id: 1,
  certificate_path: '/path/to/cert.pfx',
  certificate_password: 'encrypted-pass',
  created_at: new Date(),
};

describe('certificate.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.mockReturnValue({ where: mockWhere });
    mockWhere.mockReturnValue({ execute: mockExecute, returning: mockReturning, limit: mockLimit });
    mockLimit.mockReturnValue({ execute: mockExecute });
    mockReturning.mockReturnValue({ execute: mockExecute });
    mockSet.mockReturnValue({ where: mockWhere });
  });

  describe('findCertificateById', () => {
    it('returns certificate if found', async () => {
      mockExecute.mockResolvedValueOnce([mockCertificate]);
      const result = await findCertificateById(1);
      expect(result).toEqual(mockCertificate);
    });

    it('returns null if not found', async () => {
      mockExecute.mockResolvedValueOnce([]);
      const result = await findCertificateById(99);
      expect(result).toBeNull();
    });
  });

  describe('findCertificateByUserId', () => {
    it('returns certificate if found', async () => {
      mockExecute.mockResolvedValueOnce([mockCertificate]);
      const result = await findCertificateByUserId(1);
      expect(result).toEqual(mockCertificate);
    });

    it('returns null if not found', async () => {
      mockExecute.mockResolvedValueOnce([]);
      const result = await findCertificateByUserId(99);
      expect(result).toBeNull();
    });
  });

  describe('createCertificate', () => {
    const newCertificate: Omit<Certificate, 'id'> = {
      user_id: 1,
      certificate_path: '/path/to/new.pfx',
      certificate_password: 'encrypted-pass',
      created_at: new Date(),
    };

    it('inserts a new certificate if one does not exist for the user', async () => {
      // findCertificateByUserId returns null (no existing)
      mockExecute.mockResolvedValueOnce([]);
      // insert returning
      mockExecute.mockResolvedValueOnce([{ id: 2, ...newCertificate }]);

      const result = await createCertificate(newCertificate);

      expect(mockInsert).toHaveBeenCalled();
      expect(mockUpdate).not.toHaveBeenCalled();
      expect(result).toMatchObject({ user_id: 1 });
    });

    it('updates existing certificate if one already exists for the user', async () => {
      // findCertificateByUserId returns existing
      mockExecute.mockResolvedValueOnce([mockCertificate]);
      // update returning
      mockExecute.mockResolvedValueOnce([{ ...mockCertificate, certificate_path: '/path/to/new.pfx' }]);

      const result = await createCertificate(newCertificate);

      expect(mockUpdate).toHaveBeenCalled();
      expect(mockInsert).not.toHaveBeenCalled();
      expect(result).toMatchObject({ user_id: 1 });
    });
  });
});
