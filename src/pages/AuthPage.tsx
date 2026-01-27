import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLocalAuth } from '@/hooks/useLocalAuth';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export function AuthPage() {
  const navigate = useNavigate();
  const { signIn, signUp } = useLocalAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !password.trim()) {
      toast.error('Completa todos los campos');
      return;
    }

    if (!isLogin && !displayName.trim()) {
      toast.error('Ingresa tu nombre');
      return;
    }

    setIsLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) throw error;
        toast.success('¡Bienvenido de vuelta!');
        navigate('/');
      } else {
        const { error } = await signUp(email, password, displayName);
        if (error) throw error;
        toast.success('¡Cuenta creada! Bienvenido a Deadliner');
        navigate('/');
      }
    } catch (error: any) {
      toast.error(error.message || 'Error de autenticación');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center px-6 py-12">
      {/* Logo & Branding */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl gradient-primary glow-primary mb-4">
          <Clock className="w-10 h-10 text-primary-foreground" />
        </div>
        <h1 className="text-3xl font-bold text-gradient-primary">Deadliner</h1>
        <p className="text-muted-foreground mt-2">
          Transforma tus metas en countdowns
        </p>
      </motion.div>

      {/* Auth Form */}
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        {!isLogin && (
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Tu nombre"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="pl-11 h-12 bg-card border-border"
            />
          </div>
        )}

        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-11 h-12 bg-card border-border"
          />
        </div>

        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type={showPassword ? 'text' : 'password'}
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-11 pr-11 h-12 bg-card border-border"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>

        <Button
          type="submit"
          className="w-full h-12 text-lg font-semibold gradient-primary glow-primary"
          disabled={isLoading}
        >
          {isLoading ? 'Cargando...' : isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
        </Button>
      </motion.form>

      {/* Toggle Auth Mode */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-center mt-6"
      >
        <button
          type="button"
          onClick={() => setIsLogin(!isLogin)}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          {isLogin ? (
            <>¿No tienes cuenta? <span className="text-primary font-medium">Regístrate</span></>
          ) : (
            <>¿Ya tienes cuenta? <span className="text-primary font-medium">Inicia Sesión</span></>
          )}
        </button>
      </motion.div>
    </div>
  );
}
