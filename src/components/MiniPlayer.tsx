import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Play, Pause, Volume2, VolumeX, Radio, Sparkles, MessageCircleCode } from "lucide-react";
import { ChannelItem, ProgramItem } from "../types";

interface MiniPlayerProps {
  isPlaying: boolean;
  onPlayToggle: () => void;
  activeChannel: ChannelItem;
  currentProgram: ProgramItem;
  volume: number;
  onVolumeChange: (vol: number) => void;
  isMuted: boolean;
  onMuteToggle: () => void;
  onOpenRequestModal: () => void;
}

export default function MiniPlayer({
  isPlaying,
  onPlayToggle,
  activeChannel,
  currentProgram,
  volume,
  onVolumeChange,
  isMuted,
  onMuteToggle,
  onOpenRequestModal
}: MiniPlayerProps) {
  const [shouldShow, setShouldShow] = useState(true);

  // Always force display as requested by the user for maximum visibility and ease of access
  useEffect(() => {
    setShouldShow(true);
  }, []);

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          id="mini-player-root"
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-4 left-4 right-4 md:left-1/2 md:right-auto md:-translate-x-1/2 md:w-full md:max-w-3xl z-50 shadow-[0_0_50px_rgba(30,203,225,0.25)]"
        >
          {/* Glass-panel bottom dock with dynamic active neon glowing borders */}
          <div className={`glass-panel-glow p-3 rounded-2xl flex items-center justify-between gap-4 shadow-2xl relative overflow-hidden transition-all duration-300 ${
            isPlaying ? "neon-border-active border-brand-turquoise/50" : "border-brand-turquoise/30"
          }`}>
            {/* Turquoise decorative side glow */}
            <div className="absolute top-0 bottom-0 left-0 w-1 bg-gradient-to-t from-brand-blue-ocean to-brand-turquoise" />

            {/* left block: active info with flex-1 min-w-0 to prevent narrow-screen overflow */}
            <div className="flex items-center gap-3 text-left overflow-hidden select-none min-w-0 flex-1 sm:flex-initial">
              <div className="relative shrink-0">
                {/* Micro cover disc */}
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-tr from-brand-blue-deep to-brand-turquoise p-1 overflow-hidden relative shadow-md ${
                  isPlaying ? "animate-spin-slow" : ""
                }`}>
                  <img
                    src="https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=100&auto=format&fit=crop&q=60"
                    alt="Current Radio Feed"
                    className="w-full h-full object-cover rounded-lg opacity-85"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-[#000]/25 flex items-center justify-center">
                    <Radio className="w-4 h-4 text-white" />
                  </div>
                </div>

                {/* mini pulse ring */}
                {isPlaying && (
                  <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-turquoise opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-brand-turquoise" />
                  </span>
                )}
              </div>

              <div className="overflow-hidden min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-white font-black text-xs block truncate tracking-wide">
                    {currentProgram.name}
                  </span>
                  <span className="text-gray-500 font-mono text-[9px] uppercase tracking-wide px-1.5 py-0.2 bg-white/5 rounded border border-white/5 hidden sm:inline-block">
                    {activeChannel.id === "main" ? "Ao Vivo" : "Playlist"}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-gray-400 text-[10px] mt-0.5 truncate">
                  <span className="truncate">{activeChannel.name}</span>
                </div>
              </div>
            </div>

            {/* Middle and Right: controls */}
            <div className="flex items-center gap-2 sm:gap-4 shrink-0">
              
              {/* Audio controller buttons with tactile targets */}
              <div className="flex items-center gap-2 sm:gap-2.5">
                
                {/* Standalone Mute action button specifically optimized for Cellphones & Tablets */}
                <button
                  onClick={onMuteToggle}
                  className="sm:hidden w-11 h-11 rounded-xl flex items-center justify-center bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition-all cursor-pointer focus:outline-none shrink-0"
                  aria-label="Alternar mudo"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-5 h-5 text-brand-orange animate-pulse" />
                  ) : (
                    <Volume2 className="w-5 h-5 text-brand-turquoise" />
                  )}
                </button>

                {/* volume micro slider for desktop */}
                <div className="hidden sm:flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-xl border border-white/5">
                  <button
                    onClick={onMuteToggle}
                    className="text-gray-400 hover:text-white transition-colors cursor-pointer focus:outline-none"
                    aria-label="Toggle mute"
                  >
                    {isMuted || volume === 0 ? (
                      <VolumeX className="w-4 h-4 text-brand-orange" />
                    ) : (
                      <Volume2 className="w-4 h-4 text-brand-turquoise" />
                    )}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                    className="w-16 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-brand-turquoise"
                  />
                </div>

                {/* Core play pause touch-friendly 48px target on mobile, 44px on desktop */}
                <button
                  onClick={onPlayToggle}
                  className={`w-12 h-12 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center cursor-pointer focus:outline-none transition-all ${
                    isPlaying
                      ? "bg-white text-black hover:scale-105"
                      : "bg-gradient-to-r from-brand-orange to-brand-gold text-white hover:scale-105 hover:shadow-[0_0_15px_rgba(255,138,0,0.4)]"
                  }`}
                  aria-label={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4 fill-current text-neutral-dark" />
                  ) : (
                    <Play className="w-4 h-4 fill-current translate-x-0.5 text-white" />
                  )}
                </button>
              </div>

              {/* Pedir Música mobile-adapted button */}
              <button
                onClick={onOpenRequestModal}
                className="bg-brand-turquoise/10 hover:bg-gradient-to-r hover:from-brand-turquoise hover:to-brand-orange text-brand-turquoise hover:text-white border border-brand-turquoise/20 hover:border-transparent px-3 py-2 rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-widest flex items-center gap-1.5 cursor-pointer focus:outline-none transition-all duration-300"
              >
                <MessageCircleCode className="w-4 h-4 shrink-0" />
                <span className="hidden sm:inline">PEDIR MÚSICA</span>
                <span className="inline sm:hidden">PEDIR</span>
              </button>

            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
