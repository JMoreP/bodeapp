import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../../firebase';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  logout: () => Promise<void>;
  isSuperAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  loading: true,
  logout: async () => {},
  isSuperAdmin: false,
});

export const useAuth = () => useContext(AuthContext);

export const SUPER_ADMIN_UID = 'gDsYzOxufdV3KpoD3dwivVu5sM03';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const logout = async () => {
    await signOut(auth);
  };

  const isSuperAdmin = currentUser?.uid === SUPER_ADMIN_UID;

  return (
    <AuthContext.Provider value={{ currentUser, loading, logout, isSuperAdmin }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
