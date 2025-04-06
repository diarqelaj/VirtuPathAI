import { useEffect, useState } from 'react';

export const useAuth = () => {
  const [user, setUser] = useState<{ email: string; role: string } | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const isLoggedIn = () => !!user;

  const getUserRole = () => user?.role || null;

  return { user, isLoggedIn, getUserRole };
};