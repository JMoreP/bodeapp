import React, { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { db } from '../../firebase';
import toast from 'react-hot-toast';

interface GlobalUser {
  id: string;
  email: string;
  status: 'active' | 'suspended';
  createdAt?: any;
}

export const AdminPanel: React.FC = () => {

  const [users, setUsers] = useState<GlobalUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    // Escuchar la colección global de usuarios
    const unsub = onSnapshot(collection(db, 'global', 'users', 'list'), (snap) => {
      const data: GlobalUser[] = [];
      snap.forEach(doc => {
        data.push({ id: doc.id, ...doc.data() } as GlobalUser);
      });
      setUsers(data);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const toggleStatus = async (uid: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    setProcessingId(uid);
    try {
      const functions = getFunctions();
      const toggleFn = httpsCallable(functions, 'toggleUserStatus');
      await toggleFn({ targetUid: uid, newStatus });
      toast.success(`Usuario ${newStatus === 'active' ? 'activado' : 'suspendido'} correctamente`);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Error al cambiar estado');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) return <div className="p-8 text-white">Cargando panel de admin...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-black text-white">Panel de Super Admin</h2>
        <p className="text-text-secondary-dark text-sm">Gestión de Tenants (Usuarios)</p>
      </div>

      <div className="bg-surface-dark rounded-xl border border-border-dark overflow-hidden">
        <table className="w-full text-left text-sm text-white">
          <thead className="bg-background-dark text-xs uppercase text-text-secondary-dark font-black">
            <tr>
              <th className="px-6 py-4">Tenant / Email</th>
              <th className="px-6 py-4">UID</th>
              <th className="px-6 py-4">Estado</th>
              <th className="px-6 py-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-dark">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-slate-800/50 transition-colors">
                <td className="px-6 py-4 font-bold">{user.email}</td>
                <td className="px-6 py-4 text-xs font-mono text-slate-400">{user.id}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${user.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => toggleStatus(user.id, user.status)}
                    disabled={processingId === user.id}
                    className={`px-3 py-1.5 rounded-lg text-xs font-black transition-colors ${user.status === 'active'
                        ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
                        : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20'
                      } disabled:opacity-50`}
                  >
                    {processingId === user.id ? '...' : (user.status === 'active' ? 'Suspender' : 'Activar')}
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                  No hay tenants registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
