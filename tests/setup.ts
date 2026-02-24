import { vi } from 'vitest';

vi.mock('../src/db/connection', () => ({
  getDbConnection: vi.fn(() => ({})),
}));

vi.mock('../src/queue/sale-queue', () => ({
  saleQueue: {
    add: vi.fn().mockResolvedValue({ id: 'mock-job-id' }),
    close: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock('../src/modules/certificates/certificate.service', () => ({
  findCertificateByUserId: vi.fn().mockResolvedValue(null),
  createCertificate: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../src/modules/users/user.service', () => ({
  findUserByEmail: vi.fn().mockResolvedValue(null),
  createUser: vi.fn().mockResolvedValue(undefined),
  findUserById: vi.fn().mockResolvedValue(null),
}));

vi.mock('../src/modules/sales/sale.service', () => ({
  createSale: vi.fn().mockResolvedValue(undefined),
  findSalesByUserId: vi.fn().mockResolvedValue([]),
  findSaleById: vi.fn().mockResolvedValue(null),
  updateSale: vi.fn().mockResolvedValue(undefined),
}));
