import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Shield, MessageSquare } from 'lucide-react';

const Layout = ({ children }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#0B0F19]">
      {/* Sidebar */}
      <aside className="w-64 bg-[#111827] border-r border-gray-800 flex flex-col hidden md:flex">
        <div className="p-6">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent flex items-center gap-2">
            <Shield className="w-6 h-6 text-indigo-500" />
            SOP AI Agent
          </h1>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <Link to="/chat" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-800 transition-colors text-gray-300 hover:text-white">
            <MessageSquare className="w-5 h-5" />
            Chat
          </Link>
          {user?.role === 'admin' && (
            <Link to="/admin" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-800 transition-colors text-gray-300 hover:text-white">
              <Shield className="w-5 h-5" />
              Admin Dashboard
            </Link>
          )}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-sm font-bold">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 truncate">
              <p className="text-sm font-medium text-white">{user?.name}</p>
              <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="mt-2 w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden bg-[#111827] border-b border-gray-800 p-4 flex justify-between items-center z-10">
          <h1 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-500" />
            SOP AI Agent
          </h1>
          <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-white">
            <LogOut className="w-5 h-5" />
          </button>
        </header>

        {/* Dynamic Content */}
        <div className="flex-1 overflow-y-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
