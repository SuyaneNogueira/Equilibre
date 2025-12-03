import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './CadastroUsuario.css';

const CadastroUsuario = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    aceitarTermos: false,
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Função de registro
  const register = (nome, email, senha) => {
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
      senha, // ATENÇÃO: Em produção, use bcrypt para hash!
      createdAt: new Date().toISOString()
    };

    // Salvar usuário na lista
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    // Logar automaticamente (remover senha do estado)
    const userToSave = { ...newUser, senha: undefined };
    localStorage.setItem('currentUser', JSON.stringify(userToSave));
    
    return { success: true, user: newUser };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Limpar erros anteriores
    setErrors({});
    
    // Validação
    const newErrors = {};
    if (!formData.nome.trim()) newErrors.nome = 'Nome é obrigatório';
    if (!formData.email.trim()) newErrors.email = 'Email é obrigatório';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email inválido';
    if (!formData.senha) newErrors.senha = 'Senha é obrigatória';
    else if (formData.senha.length < 6) newErrors.senha = 'Senha deve ter no mínimo 6 caracteres';
    if (formData.senha !== formData.confirmarSenha) newErrors.confirmarSenha = 'Senhas não conferem';
    if (!formData.aceitarTermos) newErrors.aceitarTermos = 'Você deve aceitar os termos';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setIsLoading(true);
    
    try {
      const result = register(formData.nome, formData.email, formData.senha);
      
      if (result.success) {
        navigate('/dashboard');
      } else {
        setErrors({ geral: result.error });
      }
    } catch (error) {
      setErrors({ geral: 'Erro ao criar conta' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="cadastro-container">
      <h1>Criar Conta</h1>
      
      {errors.geral && (
        <div className="error-message">{errors.geral}</div>
      )}
      
      <form onSubmit={handleSubmit} className="cadastro-form">
        <div className="form-group">
          <label>Nome Completo</label>
          <input
            type="text"
            name="nome"
            value={formData.nome}
            onChange={handleChange}
            placeholder="Digite seu nome"
            className={errors.nome ? 'error' : ''}
          />
          {errors.nome && <span className="error-text">{errors.nome}</span>}
        </div>
        
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="seu@email.com"
            className={errors.email ? 'error' : ''}
          />
          {errors.email && <span className="error-text">{errors.email}</span>}
        </div>
        
        <div className="form-group">
          <label>Senha</label>
          <input
            type="password"
            name="senha"
            value={formData.senha}
            onChange={handleChange}
            placeholder="Mínimo 6 caracteres"
            className={errors.senha ? 'error' : ''}
          />
          {errors.senha && <span className="error-text">{errors.senha}</span>}
        </div>
        
        <div className="form-group">
          <label>Confirmar Senha</label>
          <input
            type="password"
            name="confirmarSenha"
            value={formData.confirmarSenha}
            onChange={handleChange}
            placeholder="Digite novamente"
            className={errors.confirmarSenha ? 'error' : ''}
          />
          {errors.confirmarSenha && <span className="error-text">{errors.confirmarSenha}</span>}
        </div>
        
        <div className="form-group checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="aceitarTermos"
              checked={formData.aceitarTermos}
              onChange={handleChange}
              className={errors.aceitarTermos ? 'error' : ''}
            />
            <span>Eu concordo com os Termos de Serviço e Política de Privacidade</span>
          </label>
          {errors.aceitarTermos && <span className="error-text">{errors.aceitarTermos}</span>}
        </div>
        
        <button type="submit" disabled={isLoading} className="btn-submit">
          {isLoading ? 'Criando conta...' : 'Criar Conta'}
        </button>
      </form>
      
      <p className="login-link">
        Já tem uma conta? <Link to="/LoginUsuario">Faça login</Link>
      </p>
    </div>
  );
};

export default CadastroUsuario;