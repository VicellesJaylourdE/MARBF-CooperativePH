import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import bcrypt from 'bcryptjs';

interface AuthContextType {
  user: any;
  role: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  register: (userData: {
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: 'admin' | 'user';
  }) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // 🔎 Track session
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  // 🟢 Login
  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };

    setUser(data.user);

    // Get role from users table
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('user_email', email)
      .single();

    setRole(userData?.role ?? null);

    return {};
  };

  // 🟢 Register
  const register = async (userData: {
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: 'admin' | 'user';
  }) => {
    try {
      // Create Supabase auth account
      const { error: signUpError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
      });
      if (signUpError) return { error: signUpError.message };

      // Hash password before storing in custom table
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);

      // Insert into users table
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

  // 🟢 Logout
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
