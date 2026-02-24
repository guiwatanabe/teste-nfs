import { FileDown } from 'lucide-react';
import type { Sale } from '../types/sale';
import { StatusBadge } from './StatusBadge';

export const SaleDetails = (props: {
  selectedSale: Sale;
  setSelectedSale: (sale: Sale | null) => void;
}): React.ReactNode => {
  const { selectedSale, setSelectedSale } = props;

  const formatAddress = (sale: Sale): string => {
    const parts = [
      sale.address,
      sale.address_number,
      sale.address_complement,
      sale.address_neighborhood,
      `${sale.address_city} - ${sale.address_state}`,
      sale.address_zip_code,
    ].filter(Boolean);
    return parts.join(', ');
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={() => setSelectedSale(null)}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6"
        onClick={e => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Sale Details</h3>

        <div className="space-y-6">
          <section>
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              General
            </h4>
            <dl className="space-y-3">
              <Row
                label="Sale ID"
                value={<span className="font-mono text-sm">{selectedSale.uid}</span>}
              />
              <Row label="Status" value={<StatusBadge status={selectedSale.status} />} />
              <Row
                label="Amount"
                value={new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(selectedSale.amount / 100)}
              />
              <Row label="Description" value={selectedSale.description} />
            </dl>
          </section>

          <hr className="my-4 border-t border-gray-200" />

          <section>
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Customer
            </h4>
            <dl className="space-y-3">
              <Row label="Name" value={selectedSale.identification} />
              <Row
                label="CPF/CNPJ"
                value={<span className="font-mono">{selectedSale.cpf_cnpj}</span>}
              />
              <Row label="Email" value={selectedSale.email} />
              <Row label="Phone" value={selectedSale.phone_number} />
              <Row label="Address" value={formatAddress(selectedSale)} />
            </dl>
          </section>

          <hr className="my-4 border-t border-gray-200" />

          <section>
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Processing
            </h4>
            <dl className="space-y-3">
              <Row
                label="Processed At"
                value={
                  selectedSale.processed_at !== null ? (
                    new Date(selectedSale.processed_at).toLocaleString()
                  ) : (
                    <span className="text-gray-300">N/A</span>
                  )
                }
              />

              {selectedSale.protocol !== null && (
                <Row
                  label="Protocol"
                  value={<span className="font-mono">{selectedSale.protocol}</span>}
                />
              )}

              {selectedSale.error_message !== null && (
                <Row
                  label="Error"
                  value={<span className="text-red-600">{selectedSale.error_message}</span>}
                />
              )}

              {selectedSale.process_response !== null && (
                <div className="flex flex-col gap-1">
                  <dt className="text-sm font-medium text-gray-500">Process Response</dt>
                  <dd className="text-sm text-gray-900 bg-gray-50 rounded p-2 font-mono break-all whitespace-pre-wrap">
                    {selectedSale.process_response}
                  </dd>
                </div>
              )}

              <hr className="my-4 border-t border-gray-200" />

              {selectedSale.xml_data !== null && (
                <Row
                  label="XML Data"
                  value={
                    <button
                      className="border rounded-md px-3 py-1.5 text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 transition-colors"
                      onClick={() => {
                        const blob = new Blob([selectedSale.xml_data!], {
                          type: 'application/xml',
                        });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `${selectedSale.uid}.xml`;
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                    >
                      <FileDown size={16} /> Download XML
                    </button>
                  }
                />
              )}
            </dl>
          </section>
        </div>

        <button
          className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-md transition-colors"
          onClick={() => setSelectedSale(null)}
        >
          Close
        </button>
      </div>
    </div>
  );
};

const Row = (props: { label: string; value: React.ReactNode }): React.ReactNode => (
  <div className="flex justify-between items-start gap-4">
    <dt className="text-sm font-medium text-gray-500 shrink-0">{props.label}</dt>
    <dd className="text-sm text-gray-900 text-right">{props.value}</dd>
  </div>
);
