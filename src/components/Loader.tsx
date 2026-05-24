import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Radio } from "lucide-react";

interface LoaderProps {
  onComplete: () => void;
}

export default function Loader({ onComplete }: LoaderProps) {
  const [progress, setProgress] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => {
            setIsExiting(true);
            setTimeout(onComplete, 800); // Wait for exit animation
          }, 400);
          return 100;
        }
        // Quadratic sort of speed-up
        const step = Math.max(1, Math.floor((100 - prev) * 0.15) + Math.floor(Math.random() * 5));
        return Math.min(100, prev + step);
      });
    }, 80);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          id="loader-root"
          className="fixed inset-0 bg-[#031326] z-50 flex flex-col items-center justify-center overflow-hidden"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, y: -40, scale: 0.98 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Decorative Background Pulsing Glow */}
          <div className="absolute w-[600px] h-[600px] rounded-full bg-radial-dim-tropical opacity-45 blur-3xl pointer-events-none" />

          {/* Core Content */}
          <div className="flex flex-col items-center max-w-md px-6 text-center z-10">
            {/* Spinning/Pulsating Logo Frame */}
            <motion.div
              id="loader-icon-container"
              className="relative p-6 rounded-full mb-6 glass-panel-glow neon-border-active bg-neutral-dark/80"
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.1, type: "spring" }}
            >
              <Radio className="w-16 h-16 text-brand-turquoise animate-pulse" />
              {/* Outer ring */}
              <div className="absolute inset-0 rounded-full border border-dashed border-brand-orange/40 animate-spin-slow" />
            </motion.div>

            {/* Brand Titles */}
            <motion.h1
              id="loader-brand-title"
              className="text-3xl font-extrabold tracking-tight text-white mb-2"
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              RÁDIO WEB <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-turquoise via-brand-orange to-brand-gold">NOVA CIDADE</span>
            </motion.h1>

            <motion.p
              id="loader-brand-tag"
              className="text-gray-300 font-medium text-sm tracking-wider uppercase mb-8"
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              A Trilha Sonora da sua Cidade
            </motion.p>

            {/* Simulated Audio Bars */}
            <div className="flex items-center gap-1.5 h-10 mb-8 justify-center">
              {[0.6, 0.9, 0.5, 0.8, 1, 0.7, 0.4, 0.9, 0.6, 0.8].map((delay, index) => (
                <div
                  key={index}
                  className="w-1 rounded-full bg-gradient-to-t from-brand-blue-ocean via-brand-turquoise to-brand-orange"
                  style={{
                    height: `${delay * 100}%`,
                    animation: `loadPulse 1s ease-in-out infinite alternate`,
                    animationDelay: `${index * 0.1}s`,
                  }}
                />
              ))}
            </div>

            {/* Progress Percentage Counter */}
            <div className="w-48 bg-white/5 h-[3px] rounded-full overflow-hidden relative mb-2">
              <motion.div
                className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-brand-blue-ocean via-brand-turquoise to-brand-orange"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-xs font-mono tracking-widest text-[#7EF3FF] font-black">
              {progress === 100 ? "PRONTO" : `CARREGANDO ${progress}%`}
            </span>
          </div>

          {/* Minimalist Footer inside loading */}
          <div className="absolute bottom-8 left-0 right-0 text-center">
            <span className="text-[10px] font-mono tracking-widest text-gray-600 block mb-1">
              PORTAL VITRINE DO SUL CO-NETWORK
            </span>
            <span className="text-[9px] text-gray-700">Versão 3.2.0 • Premium Web Player</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
