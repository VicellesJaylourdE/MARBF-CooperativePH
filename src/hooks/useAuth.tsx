
import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient'; 
import bcrypt from 'bcryptjs';

type Role = 'admin' | 'user' | 'staff' | null;

interface AuthContextType {
  user: any;
  role: Role;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  register: (userData: {
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: Role;
  }) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<Role>(null);
  const [loading, setLoading] = useState(true);

    const fetchAndSetRole = async (currentUser: any) => {
        if (!currentUser) {
            setRole(null);
            return;
        }
        
        const { data: userData } = await supabase
            .from('users')
            .select('role')
            .eq('user_email', currentUser.email)
            .single();

        setRole(userData?.role ?? null);
    };

    const processSession = async (session: any) => {
        setUser(session?.user ?? null);
        await fetchAndSetRole(session?.user ?? null);
        setLoading(false);
    };

  useEffect(() => {
        supabase.auth.getSession().then(({ data }) => {
            processSession(data.session);
        });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
             processSession(session);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);


  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };

    setUser(data.user);
   
    await fetchAndSetRole(data.user); 
    return {};
  };

  const register = async (userData: {
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: Role; 
  }) => {
    try {
        // ... (Supabase sign up logic)
      const { error: signUpError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
      });
      if (signUpError) return { error: signUpError.message };

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);

      const { error: dbError } = await supabase.from('users').insert([{
        username: userData.username,
        user_firstname: userData.firstName,
        user_lastname: userData.lastName,
        user_email: userData.email,
        user_password: hashedPassword,
        role: userData.role,
      }]);

      if (dbError) return { error: dbError.message };

      return {};
    } catch (err: any) {
      return { error: err.message };
    }
  };
  
  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};