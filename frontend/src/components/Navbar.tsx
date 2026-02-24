import { useNavigate, useLocation } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, LogOut, ShieldCheck } from 'lucide-react';

export const Navbar = (): React.ReactNode => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async (): Promise<void> => {
    await logout();
    navigate('/login');
  };

  const navLinkClass = (path: string): string => {
    const isActive = location.pathname === path;
    return `inline-flex items-center gap-2 text-sm font-medium px-1 py-4 border-b-2 transition-colors ${
      isActive
        ? 'border-blue-600 text-blue-600'
        : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
    }`;
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-6">
          <h1 className="text-xl font-semibold text-gray-900 py-4">Teste NFS</h1>
          <nav className="flex items-center gap-1">
            <button onClick={() => navigate('/dashboard')} className={navLinkClass('/dashboard')}>
              <LayoutDashboard size={16} />
              Dashboard
            </button>
            <button
              onClick={() => navigate('/certificate')}
              className={navLinkClass('/certificate')}
            >
              <ShieldCheck size={16} />
              My Certificate
            </button>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">{user?.username}</span>
          <button
            onClick={() => void handleLogout()}
            className="inline-flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900 border border-gray-300 rounded-md px-3 py-1.5 hover:bg-gray-50 transition-colors"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};
