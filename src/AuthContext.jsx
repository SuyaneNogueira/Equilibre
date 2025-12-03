import React, { createContext, useState, useContext, useEffect } from 'react';

// Criar o contexto
const AuthContext = createContext();

// Hook personalizado para usar o contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

// Provider
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Carregar usuário do localStorage
    const loadUser = () => {
      try {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
      } catch (error) {
        console.error('Erro ao carregar usuário:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const register = async (nome, email, senha) => {
    setIsLoading(true);
    try {
      // Verificar se o email já está cadastrado
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const existingUser = users.find(u => u.email === email);
      
      if (existingUser) {
        return { success: false, error: 'Email já cadastrado' };
      }

      // Criar novo usuário
      const newUser = {
        id: Date.now().toString(),
        nome,
        email,
        senha, // ATENÇÃO: Em produção, use bcrypt!
        createdAt: new Date().toISOString()
      };

      // Salvar usuário na lista
      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));
      
      // Logar automaticamente (remover senha do estado)
      const userToSave = { ...newUser, senha: undefined };
      localStorage.setItem('user', JSON.stringify(userToSave));
      setUser(userToSave);
      
      return { success: true, user: newUser };
    } catch (error) {
      console.error('Erro no registro:', error);
      return { success: false, error: 'Erro ao criar conta' };
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email, senha) => {
    setIsLoading(true);
    try {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const foundUser = users.find(u => u.email === email && u.senha === senha);
      
      if (foundUser) {
        // Remover senha antes de salvar no estado
        const userToSave = { ...foundUser, senha: undefined };
        localStorage.setItem('user', JSON.stringify(userToSave));
        setUser(userToSave);
        return { success: true, user: foundUser };
      } else {
        return { success: false, error: 'Email ou senha incorretos' };
      }
    } catch (error) {
      console.error('Erro no login:', error);
      return { success: false, error: 'Erro ao fazer login' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  const value = {
    user,
    isLoading,
    register,
    login,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;