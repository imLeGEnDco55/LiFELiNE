import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MiniPomodoro } from './MiniPomodoro';
import { cn } from '@/lib/utils';

export function FocusBubble() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Bubble Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-24 right-4 z-40",
          "w-14 h-14 rounded-full",
          "bg-gradient-to-br from-red-500 to-orange-500",
          "shadow-lg shadow-red-500/30",
          "flex items-center justify-center",
          "text-2xl",
          "glow-primary"
        )}
        style={{
          boxShadow: '0 4px 20px rgba(239, 68, 68, 0.4)',
        }}
      >
        🍅
      </motion.button>

      {/* Focus Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
            />
            
            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 50 }}
              className="fixed inset-x-4 bottom-24 z-50 max-w-lg mx-auto"
            >
              <div className="bg-card border border-border rounded-2xl p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🍅</span>
                    <h2 className="text-lg font-bold">Pomodoro Focus</h2>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen(false)}
                    className="rounded-full"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
                
                <MiniPomodoro />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
