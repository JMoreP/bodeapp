import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, writeBatch, doc } from 'firebase/firestore';
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
      snap.forEach(document => {
        data.push({ id: document.id, ...document.data() } as GlobalUser);
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
      // Plan B: Ejecutar la actualización directamente desde el Frontend (Solo el Super Admin puede hacer esto según las reglas)
      const batch = writeBatch(db);

      const tenantRef = doc(db, 'tenants', uid);
      const globalUserRef = doc(db, 'global', 'users', 'list', uid);

      batch.update(tenantRef, { status: newStatus });
      batch.update(globalUserRef, { status: newStatus });

      await batch.commit();

      toast.success(`Usuario ${newStatus === 'active' ? 'activado' : 'suspendido'} correctamente`);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Error al cambiar estado');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) return <div className="p-8 text-slate-500 font-medium">Cargando panel de admin...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-black text-slate-800">Panel de Super Admin</h2>
        <p className="text-slate-500 text-sm mt-1">Gestión de Tenants (Usuarios)</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-black">
            <tr>
              <th className="px-6 py-4">Tenant / Email</th>
              <th className="px-6 py-4">UID</th>
              <th className="px-6 py-4">Estado</th>
              <th className="px-6 py-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-bold text-slate-800">{user.email}</td>
                <td className="px-6 py-4 text-xs font-mono text-slate-400">{user.id}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${user.status === 'active' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
                    }`}>
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => toggleStatus(user.id, user.status)}
                    disabled={processingId === user.id}
                    className={`px-3 py-1.5 rounded-lg text-xs font-black transition-colors ${user.status === 'active'
                      ? 'bg-red-50 text-red-600 hover:bg-red-100'
                      : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
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
