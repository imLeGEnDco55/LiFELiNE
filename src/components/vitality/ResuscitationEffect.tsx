import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useVitality } from '@/hooks/useVitality';
import { useFeedback } from '@/hooks/useFeedback';

export function ResuscitationEffect() {
  const vitality = useVitality();
  const { successFeedback } = useFeedback();
  const [showEffect, setShowEffect] = useState(false);
  const [prevState, setPrevState] = useState(vitality.state);

  useEffect(() => {
    // Detect resurrection: was flatline/critical, now vital/weak
    if (
      (prevState === 'flatline' || prevState === 'critical') &&
      (vitality.state === 'vital' || vitality.state === 'weak')
    ) {
      setShowEffect(true);
      successFeedback();
      
      const timer = setTimeout(() => {
        setShowEffect(false);
      }, 2500);

      return () => clearTimeout(timer);
    }
    
    setPrevState(vitality.state);
  }, [vitality.state, prevState, successFeedback]);

  return (
    <AnimatePresence>
      {showEffect && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center"
        >
          {/* Flash effect */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: [0, 0.8, 0],
            }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 bg-success"
          />

          {/* Pulse rings */}
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0.5, opacity: 0.8 }}
              animate={{ 
                scale: [0.5, 2.5],
                opacity: [0.8, 0],
              }}
              transition={{
                duration: 1.5,
                delay: i * 0.3,
                ease: "easeOut",
              }}
              className="absolute w-32 h-32 rounded-full border-4 border-success"
            />
          ))}

          {/* Center icon */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ 
              scale: [0, 1.5, 1],
              rotate: 0,
            }}
            transition={{ 
              duration: 0.8,
              type: "spring",
              bounce: 0.5,
            }}
            className="relative z-10"
          >
            <motion.span 
              className="text-6xl"
              animate={{ 
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 0.5,
                repeat: 3,
              }}
            >
              🫀
            </motion.span>
          </motion.div>

          {/* Text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="absolute bottom-1/3 text-center"
          >
            <motion.h2 
              className="text-2xl font-bold text-success"
              animate={{ 
                textShadow: [
                  '0 0 10px hsl(142, 76%, 50%)',
                  '0 0 20px hsl(142, 76%, 50%)',
                  '0 0 10px hsl(142, 76%, 50%)',
                ]
              }}
              transition={{ duration: 1, repeat: 2 }}
            >
              ¡RESUCITADO!
            </motion.h2>
            <p className="text-muted-foreground mt-1">
              Tu productividad vuelve a latir
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
