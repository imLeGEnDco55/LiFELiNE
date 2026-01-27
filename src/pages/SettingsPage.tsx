import { motion } from 'framer-motion';
import { User, LogOut, Moon, Bell, Shield, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocalAuth } from '@/hooks/useLocalAuth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { CategoryManager } from '@/components/settings/CategoryManager';

export function SettingsPage() {
  const navigate = useNavigate();
  const { user, signOut } = useLocalAuth();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast.error('Error al cerrar sesión');
    } else {
      navigate('/auth');
    }
  };

  const displayName = user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'Usuario';
  const email = user?.email || '';

  return (
    <div className="px-4 py-6 pb-24">
      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold">Configuración</h1>
      </motion.header>

      {/* Profile Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-4 p-4 bg-card rounded-xl border border-border">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center">
            <span className="text-2xl font-bold text-primary-foreground">
              {displayName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-lg truncate">{displayName}</h2>
            <p className="text-sm text-muted-foreground truncate">{email}</p>
          </div>
        </div>
      </motion.div>

      {/* Category Manager */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.05 }}
        className="mb-8 p-4 bg-card rounded-xl border border-border"
      >
        <CategoryManager />
      </motion.div>

      {/* Settings Options */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="space-y-2"
      >
        <SettingsItem 
          icon={User} 
          label="Editar Perfil" 
          onClick={() => toast.info('Próximamente')} 
        />
        <SettingsItem 
          icon={Bell} 
          label="Notificaciones" 
          onClick={() => toast.info('Próximamente')} 
          badge="Próximamente"
        />
        <SettingsItem 
          icon={Moon} 
          label="Tema Oscuro" 
          onClick={() => toast.info('El tema oscuro está siempre activo')} 
          active
        />
        <SettingsItem 
          icon={Shield} 
          label="Privacidad" 
          onClick={() => toast.info('Próximamente')} 
        />
      </motion.div>

      {/* Sign Out */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-8"
      >
        <Button
          variant="outline"
          className="w-full h-12 border-destructive text-destructive hover:bg-destructive/10"
          onClick={handleSignOut}
        >
          <LogOut className="w-5 h-5 mr-2" />
          Cerrar Sesión
        </Button>
      </motion.div>

      {/* Version */}
      <p className="text-center text-muted-foreground text-xs mt-8">
        Deadliner v1.0.0 (Local Mode)
      </p>
    </div>
  );
}

interface SettingsItemProps {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  badge?: string;
  active?: boolean;
}

function SettingsItem({ icon: Icon, label, onClick, badge, active }: SettingsItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-4 p-4 rounded-xl bg-card border border-border",
        "transition-colors hover:bg-accent"
      )}
    >
      <Icon className="w-5 h-5 text-muted-foreground" />
      <span className="flex-1 text-left font-medium">{label}</span>
      {badge && (
        <span className="text-xs bg-secondary px-2 py-1 rounded-full text-muted-foreground">
          {badge}
        </span>
      )}
      {active && (
        <div className="w-2 h-2 rounded-full bg-success" />
      )}
    </button>
  );
}
