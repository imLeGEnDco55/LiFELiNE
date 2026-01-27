import { motion, AnimatePresence } from 'framer-motion';
import { Download, RefreshCw, X, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePWA } from '@/hooks/usePWA';

export function PWAPrompt() {
  const {
    isInstallable,
    isInstalled,
    isOnline,
    needRefresh,
    promptInstall,
    refreshApp,
    dismissRefresh,
  } = usePWA();

  return (
    <>
      {/* Offline indicator */}
      <AnimatePresence>
        {!isOnline && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="fixed top-0 left-0 right-0 z-50 bg-warning/90 text-warning-foreground py-2 px-4 flex items-center justify-center gap-2 text-sm font-medium"
          >
            <WifiOff className="w-4 h-4" />
            Sin conexión - Modo offline
          </motion.div>
        )}
      </AnimatePresence>

      {/* Install prompt */}
      <AnimatePresence>
        {isInstallable && !isInstalled && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-24 left-4 right-4 z-50 bg-card border border-border rounded-xl p-4 shadow-2xl"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Download className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">Instalar Deadliner</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Instala la app para acceso rápido y uso offline
                </p>
              </div>
              <button
                onClick={() => promptInstall()}
                className="p-1 hover:bg-muted rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <div className="flex gap-2 mt-4">
              <Button
                onClick={promptInstall}
                className="flex-1"
                size="sm"
              >
                <Download className="w-4 h-4 mr-2" />
                Instalar
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Update available prompt */}
      <AnimatePresence>
        {needRefresh && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-24 left-4 right-4 z-50 bg-card border border-primary/50 rounded-xl p-4 shadow-2xl"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <RefreshCw className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">Actualización disponible</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Hay una nueva versión de Deadliner
                </p>
              </div>
              <button
                onClick={dismissRefresh}
                className="p-1 hover:bg-muted rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <div className="flex gap-2 mt-4">
              <Button
                onClick={refreshApp}
                className="flex-1"
                size="sm"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Actualizar ahora
              </Button>
              <Button
                onClick={dismissRefresh}
                variant="outline"
                size="sm"
              >
                Más tarde
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
