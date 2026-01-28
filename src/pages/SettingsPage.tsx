import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, LogOut, Moon, Bell, Shield, ChevronRight, BellRing, BellOff, Clock, Volume2, Vibrate } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useLocalAuth } from '@/hooks/useLocalAuth';
import { useNotifications } from '@/hooks/useNotifications';
import { useFeedbackSettings } from '@/hooks/useFeedbackSettings';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { CategoryManager } from '@/components/settings/CategoryManager';

export function SettingsPage() {
  const navigate = useNavigate();
  const { user, signOut } = useLocalAuth();
  const { settings, isSupported, toggleNotifications, toggle24h, toggle1h } = useNotifications();
  const { settings: feedbackSettings, toggleSound, toggleHaptic } = useFeedbackSettings();
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);

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
        
        {/* Notifications Section */}
        <div className="space-y-0">
          <button
            onClick={() => setShowNotificationSettings(!showNotificationSettings)}
            className={cn(
              "w-full flex items-center gap-4 p-4 bg-card border border-border",
              "transition-colors hover:bg-accent",
              showNotificationSettings ? "rounded-t-xl" : "rounded-xl"
            )}
          >
            <Bell className="w-5 h-5 text-muted-foreground" />
            <span className="flex-1 text-left font-medium">Notificaciones</span>
            {settings.enabled ? (
              <span className="flex items-center gap-1 text-xs bg-success/20 text-success px-2 py-1 rounded-full">
                <BellRing className="w-3 h-3" />
                Activas
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full">
                <BellOff className="w-3 h-3" />
                Inactivas
              </span>
            )}
            <ChevronRight className={cn(
              "w-5 h-5 text-muted-foreground transition-transform",
              showNotificationSettings && "rotate-90"
            )} />
          </button>
          
          <AnimatePresence>
            {showNotificationSettings && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden bg-card border-x border-b border-border rounded-b-xl"
              >
                <div className="p-4 space-y-4">
                  {!isSupported ? (
                    <p className="text-sm text-muted-foreground">
                      Tu navegador no soporta notificaciones push.
                    </p>
                  ) : (
                    <>
                      {/* Master toggle */}
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">Habilitar notificaciones</p>
                          <p className="text-xs text-muted-foreground">
                            {settings.permission === 'denied' 
                              ? 'Bloqueadas en el navegador' 
                              : 'Recibe alertas de deadlines'
                            }
                          </p>
                        </div>
                        <Switch 
                          checked={settings.enabled}
                          onCheckedChange={toggleNotifications}
                          disabled={settings.permission === 'denied'}
                        />
                      </div>

                      {settings.enabled && (
                        <>
                          <div className="h-px bg-border" />
                          
                          {/* 24h notification */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-warning" />
                              <div>
                                <p className="text-sm">24 horas antes</p>
                                <p className="text-xs text-muted-foreground">Aviso anticipado</p>
                              </div>
                            </div>
                            <Switch 
                              checked={settings.notify24h}
                              onCheckedChange={toggle24h}
                            />
                          </div>

                          {/* 1h notification */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-urgent" />
                              <div>
                                <p className="text-sm">1 hora antes</p>
                                <p className="text-xs text-muted-foreground">Alerta urgente</p>
                              </div>
                            </div>
                            <Switch 
                              checked={settings.notify1h}
                              onCheckedChange={toggle1h}
                            />
                          </div>
                        </>
                      )}
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Feedback Settings */}
        <div className="p-4 bg-card rounded-xl border border-border space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Volume2 className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Sonido</p>
                <p className="text-xs text-muted-foreground">Feedback sonoro al completar</p>
              </div>
            </div>
            <Switch 
              checked={feedbackSettings.soundEnabled}
              onCheckedChange={toggleSound}
            />
          </div>
          
          <div className="h-px bg-border" />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Vibrate className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Vibración</p>
                <p className="text-xs text-muted-foreground">Feedback háptico al completar</p>
              </div>
            </div>
            <Switch 
              checked={feedbackSettings.hapticEnabled}
              onCheckedChange={toggleHaptic}
            />
          </div>
        </div>

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
