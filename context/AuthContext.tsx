import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import dataProvider from '../services/provider';
import { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (data: any) => Promise<void>; // Accepts arbitrary data for register or login params
  logout: () => Promise<void>;
  register: (data: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Initial Check
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await dataProvider.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error("Auth check failed", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = async (credentials: any) => {
    // Determine if we are using credentials or just role mock login
    let loggedUser: User;
    if (credentials.username && credentials.password) {
       loggedUser = await dataProvider.loginWithCredentials(credentials.username, credentials.password);
    } else if (credentials.role) {
       // Fallback for mock role-based login
       loggedUser = await dataProvider.login(credentials.role);
    } else {
       throw new Error("Invalid login parameters");
    }
    setUser(loggedUser);
  };

  const register = async (data: any) => {
    const newUser = await dataProvider.register(data);
    setUser(newUser);
  };

  const logout = async () => {
    setLoading(true);
    try {
      await dataProvider.logout();
      setUser(null);
      navigate('/'); // Use react-router navigate instead of window.location
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
