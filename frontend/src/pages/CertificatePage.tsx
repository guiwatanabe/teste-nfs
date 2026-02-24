import { useEffect, useRef, useState } from 'react';
import { Navbar } from '../components/Navbar';
import type { Certificate } from '../types/certificate';
import api from '../utils/api';
import type { AxiosError } from 'axios';
import useDocumentTitle from '../hooks/useDocumentTitle';

export const CertificatePage = (): React.ReactNode => {
  useDocumentTitle('My Certificate');

  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [password, setPassword] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchCertificate = async (): Promise<void> => {
    try {
      const res = await api.get('/certificate');
      const data = res.data as Certificate;
      setCertificate(data);
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error('Error fetching certificate:', err);
      }

      const axiosError = err as AxiosError<{ message?: string }>;
      const backendMessage =
        axiosError?.response?.data?.message || axiosError?.message || 'Could not load certificate.';

      setError(backendMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchCertificate();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.pfx')) {
        setUploadError('Only .pfx files are allowed.');
        return;
      }

      setSelectedFile(file);
      setUploadError(null);
    }
  };

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    if (!selectedFile) {
      setUploadError('Please select a file.');
      return;
    }

    setUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append('certificate', selectedFile);
      formData.append('certificate_password', password);

      await api.post('/certificate', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      await fetchCertificate();
      setSelectedFile(null);
      setPassword('');
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error('Error uploading certificate:', err);
      }

      const axiosError = err as AxiosError<{ message?: string }>;
      const backendMessage =
        axiosError?.response?.data?.message ||
        axiosError?.message ||
        'Failed to upload certificate.';

      setUploadError(`Upload failed: ${backendMessage}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-8">
        <h2 className="text-lg font-medium text-gray-900 mb-6">Certificate Management</h2>

        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <h3 className="text-base font-medium text-gray-900 mb-4">Upload Certificate</h3>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="certificate" className="block text-sm font-medium text-gray-700 mb-2">
                Certificate File (.pfx)
              </label>
              <input
                type="file"
                id="certificate"
                accept=".pfx"
                onChange={handleFileChange}
                disabled={uploading}
                ref={fileInputRef}
                className="block w-full text-sm text-gray-900 border border-gray-300 rounded-md cursor-pointer bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {selectedFile && (
                <p className="mt-2 text-sm text-gray-500">
                  Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
                </p>
              )}
            </div>

            <div className="mb-4">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Certificate Password
              </label>
              <input
                type="password"
                id="password"
                name="certificate_password"
                required
                disabled={uploading}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="block w-full text-sm text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed px-3 py-2"
              />
            </div>

            {uploadError && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-md px-4 py-3 text-sm">
                {uploadError}
              </div>
            )}

            {uploadSuccess && (
              <div className="mb-4 bg-green-50 border border-green-200 text-green-700 rounded-md px-4 py-3 text-sm">
                Certificate uploaded successfully!
              </div>
            )}

            <button
              type="submit"
              disabled={uploading || !selectedFile || !password}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? 'Uploading...' : 'Upload Certificate'}
            </button>
          </form>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-base font-medium text-gray-900 mb-4">Current Certificate</h3>

          {loading ? (
            <p className="text-gray-500">Loading certificate information...</p>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-md px-4 py-3 text-sm">
              {error}
            </div>
          ) : certificate ? (
            <dl className="space-y-3">
              <div className="flex justify-between items-start gap-4">
                <dt className="text-sm font-medium text-gray-500 shrink-0">Certificate ID</dt>
                <dd className="text-sm text-gray-900 text-right font-mono">{certificate.id}</dd>
              </div>
              <div className="flex justify-between items-start gap-4">
                <dt className="text-sm font-medium text-gray-500 shrink-0">File Path</dt>
                <dd className="text-sm text-gray-900 text-right break-all">
                  {certificate.certificate_path}
                </dd>
              </div>
              <div className="flex justify-between items-start gap-4">
                <dt className="text-sm font-medium text-gray-500 shrink-0">Uploaded At</dt>
                <dd className="text-sm text-gray-900 text-right">
                  {new Date(certificate.created_at).toLocaleString()}
                </dd>
              </div>
            </dl>
          ) : (
            <p className="text-gray-400">No certificate uploaded yet.</p>
          )}
        </div>
      </main>
    </div>
  );
};
