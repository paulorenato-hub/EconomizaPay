
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { supabase } from '../services/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, pass: string, name: string, phone: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Auth Session Logic
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        mapSupabaseUser(session.user);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        mapSupabaseUser(session.user);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Presence Logic (Online Status)
  useEffect(() => {
    let channel: RealtimeChannel | null = null;

    if (user) {
        // Canal global para rastrear usuários online
        channel = supabase.channel('system-global', {
            config: {
                presence: {
                    key: user.id, // Usa o ID do usuário como chave única
                },
            },
        });

        channel.subscribe(async (status) => {
            if (status === 'SUBSCRIBED') {
                await channel.track({
                    online_at: new Date().toISOString(),
                    user_id: user.id,
                    name: user.nome
                });
            }
        });
    }

    return () => {
        if (channel) {
            supabase.removeChannel(channel);
        }
    };
  }, [user]);

  const mapSupabaseUser = async (sbUser: any) => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('perfil, telefone')
        .eq('id', sbUser.id)
        .single();

      const userData: User = {
        id: sbUser.id,
        nome: sbUser.user_metadata?.nome || sbUser.email?.split('@')[0],
        email: sbUser.email || '',
        telefone: profile?.telefone || sbUser.user_metadata?.telefone || '',
        perfil: profile?.perfil || 'USUARIO'
      };

      setUser(userData);
    } catch (err) {
      console.error("Erro ao mapear usuário:", err);
      setUser({
        id: sbUser.id,
        nome: sbUser.user_metadata?.nome || sbUser.email?.split('@')[0],
        email: sbUser.email || '',
        telefone: sbUser.user_metadata?.telefone || '',
        perfil: 'USUARIO'
      });
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
    if (error) return { success: false, error: error.message };
    return { success: true };
  };

  const register = async (email: string, pass: string, name: string, phone: string): Promise<{ success: boolean; error?: string }> => {
    const { error } = await supabase.auth.signUp({
      email,
      password: pass,
      options: {
        data: {
          nome: name,
          telefone: phone,
        }
      }
    });
    if (error) return { success: false, error: error.message };
    return { success: true };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      register,
      logout, 
      isAdmin: user?.perfil === 'ADMIN' 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
