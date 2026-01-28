import { motion } from 'framer-motion';
import splashImage from '@/assets/splash-screen.png';

interface SplashScreenProps {
  onComplete?: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, delay: 1.5 }}
      onAnimationComplete={() => onComplete?.()}
    >
      <motion.div
        className="relative w-full h-full flex flex-col items-center justify-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* Background image */}
        <motion.img
          src={splashImage}
          alt="LiFELiNE"
          className="absolute inset-0 w-full h-full object-cover"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        />
        
        {/* ECG pulse animation overlay */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.3, 0] }}
          transition={{ 
            duration: 1.5, 
            repeat: 1,
            ease: "easeInOut"
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
        </motion.div>
        
        {/* Pulse glow effect */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{
            boxShadow: [
              'inset 0 0 60px 0 rgba(16, 185, 129, 0)',
              'inset 0 0 60px 0 rgba(16, 185, 129, 0.2)',
              'inset 0 0 60px 0 rgba(16, 185, 129, 0)',
            ]
          }}
          transition={{
            duration: 1.2,
            repeat: 2,
            ease: "easeInOut"
          }}
        />
      </motion.div>
    </motion.div>
  );
}
