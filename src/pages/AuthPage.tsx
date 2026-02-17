import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Mail, Lock, User, Eye, EyeOff, Cloud, CloudOff, Database, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/providers/AuthProvider';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { isValidEmail, isValidPassword } from '@/lib/security';

export function AuthPage() {
  const navigate = useNavigate();
  const { signIn, signUp, mode, switchMode } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Reset form when mode changes
  const handleModeChange = (newMode: string) => {
    switchMode(newMode as 'local' | 'cloud');
    setEmail('');
    setPassword('');
    setDisplayName('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      toast.error('Completa todos los campos');
      return;
    }

    if (!isValidEmail(email)) {
      toast.error('Por favor ingresa un email válido');
      return;
    }

    if (!isValidPassword(password)) {
      toast.error('La contraseña debe tener al menos 8 caracteres, mayúscula, minúscula y número');
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
        toast.success(mode === 'local' ? '¡Bienvenido de vuelta (Local)!' : '¡Bienvenido de vuelta (Nube)!');
        navigate('/');
      } else {
        const { error } = await signUp(email, password, displayName);
        if (error) throw error;
        toast.success('¡Cuenta creada! Bienvenido a LiFELiNE');
        navigate('/');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error de autenticación';
      toast.error(message);
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
        <div className={cn(
          "inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-4 transition-colors duration-500",
          mode === 'local' ? "gradient-primary glow-primary" : "bg-blue-600 shadow-[0_0_40px_-5px_rgba(37,99,235,0.6)]"
        )}>
          {mode === 'local' ? (
            <Heart className="w-10 h-10 text-primary-foreground" />
          ) : (
            <Database className="w-10 h-10 text-white" />
          )}
        </div>
        <h1 className={cn(
          "text-3xl font-bold transition-colors duration-500",
          mode === 'local' ? "text-gradient-primary" : "text-blue-500"
        )}>LiFELiNE</h1>
        <p className="text-muted-foreground mt-2">
          {mode === 'local' ? "Tu productividad tiene pulso (Modo Local)" : "Tu productividad sincronizada (Modo Nube)"}
        </p>
      </motion.div>

      {/* Mode Toggle */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex justify-center mb-8"
      >
        <Tabs value={mode} onValueChange={handleModeChange} className="w-[200px]">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="local">
              <CloudOff className="w-4 h-4 mr-2" />
              Local
            </TabsTrigger>
            <TabsTrigger value="cloud">
              <Cloud className="w-4 h-4 mr-2" />
              Nube
            </TabsTrigger>
          </TabsList>
        </Tabs>
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
              aria-label="Tu nombre"
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
            placeholder={mode === 'local' ? "Email (solo ID local)" : "Email"}
            aria-label="Correo electrónico"
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
            aria-label="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-11 pr-11 h-12 bg-card border-border"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground hover:bg-transparent"
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </Button>
        </div>

        <Button
          type="submit"
          className={cn(
            "w-full h-12 text-lg font-semibold transition-all duration-500",
            mode === 'local' ? "gradient-primary glow-primary" : "bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20"
          )}
          disabled={isLoading}
        >
          {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
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
            <>¿No tienes cuenta? <span className={cn("font-medium", mode === 'local' ? "text-primary" : "text-blue-500")}>Regístrate</span></>
          ) : (
            <>¿Ya tienes cuenta? <span className={cn("font-medium", mode === 'local' ? "text-primary" : "text-blue-500")}>Inicia Sesión</span></>
          )}
        </button>
      </motion.div>
    </div>
  );
}
