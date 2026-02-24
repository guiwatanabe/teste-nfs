import { useEffect, useState, useCallback } from 'react';
import api from '../utils/api';
import type { Sale } from '../types/sale';
import { Navbar } from '../components/Navbar';
import { SaleDetails } from '../components/SaleDetails';
import { StatusBadge } from '../components/StatusBadge';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { Plus, RefreshCcw } from 'lucide-react';
import { useExampleSale } from '../hooks/useExampleSale';

export const DashboardPage = (): React.ReactNode => {
  useDocumentTitle('My Certificate');

  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  const fetchSales = useCallback(async (): Promise<void> => {
    try {
      const res = await api.get('/sales');
      const data = res.data as Sale[];
      setSales(data);
    } catch {
      setError('Could not load sales.');
    } finally {
      setLoading(false);
    }
  }, []);

  const { creating, createError, handleExampleSale } = useExampleSale(fetchSales);

  useEffect(() => {
    void fetchSales();
    const interval = setInterval(() => void fetchSales(), 60000);
    return () => clearInterval(interval);
  }, [fetchSales]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-medium text-gray-900">Sales</h2>
          <div className="flex gap-4 items-center">
            <button
              onClick={handleExampleSale}
              disabled={creating}
              className="inline-flex items-center gap-2 border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium px-4 py-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus size={16} />
              {creating ? 'Creating...' : 'Create Example Sale'}
            </button>
            <button
              onClick={() => void fetchSales()}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-md transition-colors"
            >
              <RefreshCcw size={16} />
              Refresh
            </button>
          </div>
        </div>

        {loading && <p className="text-center text-gray-500 py-12">Loading invoices...</p>}

        {error !== null && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-md px-4 py-3 mb-6 text-sm">
            {error}
          </div>
        )}

        {createError !== null && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-md px-4 py-3 mb-6 text-sm">
            {createError}
          </div>
        )}

        {!loading && sales.length === 0 && (
          <p className="text-center text-gray-400 py-12">No invoices issued yet.</p>
        )}

        {!loading && sales.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {['Sale ID', 'Customer', 'Service', 'Status', 'Processed At', 'Details'].map(
                      col => (
                        <th
                          key={col}
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {col}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sales.map(sale => (
                    <tr key={sale.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-mono text-gray-600">{sale.uid}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{sale.identification}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{sale.description}</td>
                      <td className="px-6 py-4">
                        <StatusBadge status={sale.status} />
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {sale.processed_at !== null ? (
                          new Date(sale.processed_at).toLocaleString()
                        ) : (
                          <span className="text-gray-300">N/A</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          className="rounded-md border border-blue-600 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
                          onClick={() => setSelectedSale(sale)}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {selectedSale !== null && (
        <SaleDetails selectedSale={selectedSale} setSelectedSale={setSelectedSale} />
      )}
    </div>
  );
};
