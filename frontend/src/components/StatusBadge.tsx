import type { SaleStatus } from '../types/sale';

const statusStyles: Record<SaleStatus, string> = {
  PROCESSING: 'bg-yellow-100 text-yellow-800',
  SUCCESS: 'bg-green-100 text-green-800',
  ERROR: 'bg-red-100 text-red-800',
};

export const StatusBadge = ({ status }: { status: SaleStatus }): React.ReactElement => (
  <span
    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[status]}`}
  >
    {status}
  </span>
);
