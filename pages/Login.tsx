import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserCircle, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    
    const result = await login(email, password);
    
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error || 'Erro ao entrar. Verifique suas credenciais.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col px-6 pt-12 pb-24 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm shadow-emerald-100">
          <UserCircle size={48} strokeWidth={1.5} />
        </div>
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          Bem-vindo de volta!
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          Entre para salvar seus produtos favoritos e acompanhar preços.
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md">
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">E-mail</label>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-300" />
                </div>
                <input
                  type="email"
                  required
                  disabled={isSubmitting}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-12 pr-4 py-4 border-none rounded-2xl bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all shadow-inner disabled:opacity-50"
                  placeholder="exemplo@email.com"
                />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2 ml-1">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">Senha</label>
                <button type="button" className="text-xs font-bold text-emerald-600 hover:text-emerald-700">Esqueceu?</button>
            </div>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-300" />
                </div>
                <input
                  type="password"
                  required
                  disabled={isSubmitting}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-12 pr-4 py-4 border-none rounded-2xl bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all shadow-inner disabled:opacity-50"
                  placeholder="••••••••"
                />
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-xs text-center bg-red-50 py-3 px-4 rounded-xl font-medium animate-shake">
              {error}
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full flex justify-center items-center py-4 px-4 border border-transparent text-base font-bold rounded-2xl text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 shadow-xl shadow-emerald-100 transition-all active:scale-95 disabled:opacity-70 disabled:active:scale-100"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin h-6 w-6" />
              ) : (
                <>
                  Entrar na conta
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>
        </form>

        <p className="mt-10 text-center text-sm text-gray-500">
          Ainda não tem conta? <Link to="/register" className="font-bold text-emerald-600 hover:underline">Crie uma agora</Link>
        </p>
      </div>
    </div>
  );
};