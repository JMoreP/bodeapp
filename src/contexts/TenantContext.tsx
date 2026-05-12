import React, { createContext, useContext, useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from './AuthContext';

interface TenantContextType {
  tenantId: string | null;
  status: 'active' | 'suspended' | null;
  loading: boolean;
}

const TenantContext = createContext<TenantContextType>({
  tenantId: null,
  status: null,
  loading: true,
});

export const useTenant = () => useContext(TenantContext);

export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, isSuperAdmin } = useAuth();
  
  // By default, a normal user's tenantId is their own UID.
  // We can let the SuperAdmin view their own tenant or override this via some UI later,
  // but for now, everyone gets their own UID as their primary tenant.
  const [tenantId, setTenantId] = useState<string | null>(currentUser?.uid || null);
  const [status, setStatus] = useState<'active' | 'suspended' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      setTenantId(null);
      setStatus(null);
      setLoading(false);
      return;
    }

    setTenantId(currentUser.uid);

    // Subscribe to tenant metadata to get status
    const unsubscribe = onSnapshot(
      doc(db, 'tenants', currentUser.uid),
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setStatus(data.status || 'active');
        } else {
          // If doc doesn't exist yet (e.g. just registered), assume active while function runs
          setStatus('active');
        }
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching tenant status:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  // If normal user is suspended, we can block them here
  if (!loading && status === 'suspended' && !isSuperAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-black text-red-500">Cuenta Suspendida</h1>
          <p className="text-slate-400">Tu acceso ha sido revocado. Contacta al administrador.</p>
        </div>
      </div>
    );
  }

  return (
    <TenantContext.Provider value={{ tenantId, status, loading }}>
      {!loading && children}
    </TenantContext.Provider>
  );
};
