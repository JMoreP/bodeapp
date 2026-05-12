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
        
        // Plan B: Crear los documentos de Tenant y Global User directamente desde el Frontend
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
    <div className="min-h-screen bg-background-dark flex items-center justify-center p-4">
      <div className="bg-surface-dark border border-border-dark p-8 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-white mb-2">Bodeapp SaaS</h1>
          <p className="text-text-secondary-dark text-sm">
            {isLogin ? 'Inicia sesión en tu cuenta' : 'Crea tu espacio de trabajo'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-black text-text-secondary-dark uppercase tracking-wider mb-1">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-background-dark border border-border-dark text-white px-4 py-3 rounded-xl focus:outline-none focus:border-primary transition-colors"
              placeholder="tu@email.com"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-black text-text-secondary-dark uppercase tracking-wider mb-1">Contraseña</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-background-dark border border-border-dark text-white px-4 py-3 rounded-xl focus:outline-none focus:border-primary transition-colors"
              placeholder="••••••••"
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-primary text-primary-content font-black py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 mt-4"
          >
            {loading ? 'Cargando...' : (isLogin ? 'Entrar' : 'Registrarse')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button 
            type="button" 
            onClick={() => setIsLogin(!isLogin)}
            className="text-text-secondary-dark text-sm hover:text-white transition-colors"
          >
            {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
          </button>
        </div>
      </div>
    </div>
  );
};
