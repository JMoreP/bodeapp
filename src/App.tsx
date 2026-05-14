import React, { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import { useTenant } from './contexts/TenantContext';
import { AuthScreen } from './components/AuthScreen';
import { Dashboard } from './components/Dashboard';
import { AdminPanel } from './components/AdminPanel';

const AppContent = () => {
  const { currentUser, isSuperAdmin, logout } = useAuth();
  const { status } = useTenant();
  const [showAdmin, setShowAdmin] = useState(false);

  if (!currentUser) {
    return <AuthScreen />;
  }

  return (
    <div className="relative h-screen overflow-hidden bg-slate-50">
      {/* Navbar minimalista superior para el admin o para cerrar sesión */}
      <div className="absolute top-0 right-0 z-50 p-2 flex gap-2">
        {isSuperAdmin && (
          <button 
            onClick={() => setShowAdmin(!showAdmin)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-black shadow-lg"
          >
            {showAdmin ? 'Volver a POS' : 'Panel Admin'}
          </button>
        )}
        <button 
          onClick={logout}
          className="bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-lg text-xs font-black shadow-lg"
        >
          Cerrar Sesión
        </button>
      </div>

      {showAdmin && isSuperAdmin ? (
        <div className="pt-12 h-full overflow-y-auto">
          <AdminPanel />
        </div>
      ) : (
        <Dashboard />
      )}
    </div>
  );
};

export default AppContent;
