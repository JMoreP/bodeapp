import React, { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { writeBatch, doc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import toast from 'react-hot-toast';

export const AuthScreen: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return toast.error('Ingresa correo y contraseña');

    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        toast.success('¡Bienvenido!');
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        const batch = writeBatch(db);

        const tenantData = {
          email: user.email,
          status: 'active',
          createdAt: serverTimestamp()
        };

        batch.set(doc(db, 'tenants', user.uid), tenantData);
        batch.set(doc(db, 'global', 'users', 'list', user.uid), tenantData);
        batch.set(doc(db, 'tenants', user.uid, 'config', 'global'), { exchangeRate: 36.5 });

        await batch.commit();

        toast.success('Cuenta y espacio de trabajo creados exitosamente');
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Error de autenticación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 p-8 rounded-2xl w-full max-w-md shadow-lg">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center text-white font-black text-xl mx-auto mb-4 shadow-md">
            B
          </div>
          <h1 className="text-2xl font-black text-slate-800 mb-2">Bodeapp</h1>
          <p className="text-slate-500 text-sm">
            {isLogin ? 'Inicia sesión en tu cuenta' : 'Crea tu espacio de trabajo'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white border border-slate-200 text-slate-800 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="tu@email.com"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-1">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white border border-slate-200 text-slate-800 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-3 rounded-xl transition-all disabled:opacity-50 mt-4 shadow-sm"
          >
            {loading ? 'Cargando...' : (isLogin ? 'Entrar' : 'Registrarse')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-slate-500 text-sm hover:text-slate-800 transition-colors font-medium"
          >
            {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
          </button>
        </div>
      </div>
    </div>
  );
};