import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, ArrowRight, Loader2, UserPlus, CheckCircle2, Phone } from 'lucide-react';

export const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    if (phone.length < 10) {
      setError('Informe um telefone válido.');
      return;
    }

    setIsSubmitting(true);
    
    const result = await register(email, password, name, phone);
    
    if (result.success) {
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } else {
      setError(result.error || 'Erro ao criar conta. Tente novamente.');
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center animate-in fade-in zoom-in-95">
        <div className="w-24 h-24 bg-emerald-500 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-2xl shadow-emerald-500/20">
          <CheckCircle2 size={48} className="text-white" />
        </div>
        <h2 className="text-3xl font-black text-gray-900 mb-4">Conta Criada!</h2>
        <p className="text-gray-500 max-w-xs mx-auto mb-8">
          Sua conta foi criada com sucesso. Verifique seu e-mail para confirmar o cadastro (se necessário) ou faça login agora.
        </p>
        <Link 
          to="/login" 
          className="bg-emerald-600 text-white font-bold px-10 py-4 rounded-2xl shadow-xl shadow-emerald-100 active:scale-95 transition-all"
        >
          Ir para Login
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col px-6 pt-10 pb-20">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/login" className="inline-flex items-center text-gray-400 font-bold text-xs uppercase tracking-widest hover:text-emerald-600 transition-colors mb-8">
          Voltar para entrar
        </Link>
        
        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
          <UserPlus size={32} />
        </div>
        
        <h2 className="text-3xl font-black text-gray-900 tracking-tight">
          Crie sua conta
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          Junte-se à comunidade do Economiza Pay e comece a poupar.
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Nome Completo</label>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-gray-300" />
                </div>
                <input
                  type="text"
                  required
                  disabled={isSubmitting}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3.5 border-none rounded-2xl bg-gray-50 text-gray-900 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all shadow-inner disabled:opacity-50"
                  placeholder="Seu nome"
                />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">E-mail</label>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-gray-300" />
                </div>
                <input
                  type="email"
                  required
                  disabled={isSubmitting}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3.5 border-none rounded-2xl bg-gray-50 text-gray-900 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all shadow-inner disabled:opacity-50"
                  placeholder="seu@email.com"
                />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Telefone / WhatsApp</label>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Phone className="h-4 w-4 text-gray-300" />
                </div>
                <input
                  type="tel"
                  required
                  disabled={isSubmitting}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3.5 border-none rounded-2xl bg-gray-50 text-gray-900 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all shadow-inner disabled:opacity-50"
                  placeholder="(11) 99999-9999"
                />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Senha</label>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-gray-300" />
                </div>
                <input
                  type="password"
                  required
                  disabled={isSubmitting}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3.5 border-none rounded-2xl bg-gray-50 text-gray-900 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all shadow-inner disabled:opacity-50"
                  placeholder="Mínimo 6 caracteres"
                />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Confirmar Senha</label>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-gray-300" />
                </div>
                <input
                  type="password"
                  required
                  disabled={isSubmitting}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3.5 border-none rounded-2xl bg-gray-50 text-gray-900 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all shadow-inner disabled:opacity-50"
                  placeholder="Repita a senha"
                />
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-[10px] text-center bg-red-50 py-3 px-4 rounded-xl font-bold uppercase tracking-wider animate-shake">
              {error}
            </div>
          )}

          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full flex justify-center items-center py-4 px-4 border border-transparent text-base font-bold rounded-2xl text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 shadow-xl shadow-emerald-100 transition-all active:scale-95 disabled:opacity-70"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin h-6 w-6" />
              ) : (
                <>
                  Criar Conta Grátis
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>
        </form>

        <p className="mt-8 text-center text-sm text-gray-500">
          Já tem uma conta? <Link to="/login" className="font-bold text-emerald-600 hover:underline">Entre aqui</Link>
        </p>
      </div>
    </div>
  );
};