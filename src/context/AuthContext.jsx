import { createContext, useState, useContext } from 'react';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const login = (username, password) => {
    setLoading(true);
    setError('');
    
    // Simulación simple de autenticación
    // En un caso real, aquí iría una llamada a API
    setTimeout(() => {
      if (username === 'admin' && password === 'admin123') {
        setUser({ username });
        setLoading(false);
      } else {
        setError('Usuario o contraseña incorrectos');
        setLoading(false);
      }
    }, 500);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      error, 
      login, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};