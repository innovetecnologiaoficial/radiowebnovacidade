import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Radio, Menu, X, Play, Volume2, Sun, Cloud, CloudRain } from "lucide-react";

interface HeaderProps {
  onPlayTrigger: () => void;
  isPlaying: boolean;
}

export default function Header({ onPlayTrigger, isPlaying }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [weatherTemp, setWeatherTemp] = useState<number | null>(null);
  const [weatherCode, setWeatherCode] = useState<number | null>(null);

  // Scroll handler for navbar glass opacity
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch light forecast data directly from Open-Meteo for Balneário Rincão
  useEffect(() => {
    const fetchHeaderWeather = async () => {
      try {
        const response = await fetch(
          "https://api.open-meteo.com/v1/forecast?latitude=-28.8287&longitude=-49.2324&current=temperature_2m,weather_code"
        );
        if (response.ok) {
          const data = await response.json();
          if (data && data.current) {
            setWeatherTemp(Math.round(data.current.temperature_2m));
            setWeatherCode(data.current.weather_code);
          }
        }
      } catch (err) {
        console.warn("Header weather API failed, quiet fallback used.", err);
      }
    };
    fetchHeaderWeather();
    // Sincronizar de hora em hora
    const interval = setInterval(fetchHeaderWeather, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const renderWeatherIcon = (code: number | null) => {
    if (code === null || code === 0) {
      return <Sun className="w-4 h-4 text-brand-orange shrink-0 animate-pulse" />;
    }
    if (code >= 1 && code <= 3) {
      return <Cloud className="w-4 h-4 text-brand-turquoise shrink-0" />;
    }
    if (code >= 51 && code <= 82) {
      return <CloudRain className="w-4 h-4 text-blue-400 shrink-0" />;
    }
    return <Sun className="w-4 h-4 text-brand-orange shrink-0" />;
  };

  const scrollToSection = (id: string) => {
    setIsMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      const offset = 85; // Height of floating header
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <header
      id="main-header"
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? "py-3 bg-black/80 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.8)] border-b border-white/5"
          : "py-5 bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo - click scrolls to top */}
        <button
          id="header-brand-logo"
          onClick={() => {
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="flex items-center gap-2.5 group cursor-pointer focus:outline-none"
        >
          <div className="relative flex items-center py-1">
            <img
              src="https://www.radiowebnovacidade.com.br/imagens/logobg.png"
              alt="Logo Rádio Web Nova Cidade"
              className="h-9 sm:h-11 w-auto object-contain transition-all duration-300 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
            {isPlaying && (
              <span className="absolute -top-1 -right-1.5 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-turquoise opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-turquoise"></span>
              </span>
            )}
          </div>
        </button>

        {/* Highlighted CTA Call-to-Action & Weather Badge */}
        <div className="flex items-center gap-3 sm:gap-4">
          
          {/* Header Real-time weather badge for Balneário Rincão SC */}
          {weatherTemp !== null && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 px-2.5 py-1.5 sm:px-3 rounded-xl bg-white/5 border border-white/10 hover:border-brand-turquoise/30 select-none transition-all duration-300"
              title="Temperatura atual em Balneário Rincão - SC"
            >
              {renderWeatherIcon(weatherCode)}
              <div className="flex flex-col text-left">
                <span className="text-white text-[10px] sm:text-xs font-black leading-tight">
                  {weatherTemp}°C
                </span>
                <span className="text-gray-400 text-[7px] sm:text-[8px] font-mono tracking-widest uppercase leading-none font-bold">
                  Rincão - SC
                </span>
              </div>
            </motion.div>
          )}

          <button
            id="btn-ouca-agora"
            onClick={onPlayTrigger}
            className={`cursor-pointer font-bold relative px-4 sm:px-5 py-2 sm:py-2.5 rounded-full overflow-hidden text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2 group transition-all duration-300 focus:outline-none ${
              isPlaying
                ? "bg-gradient-to-r from-brand-blue-ocean to-brand-turquoise scale-102 hover:shadow-[0_0_20px_rgba(30,203,225,0.35)]"
                : "bg-gradient-to-r from-brand-orange to-brand-gold hover:scale-102 hover:shadow-[0_0_20px_rgba(255,138,0,0.35)]"
            } text-white`}
          >
            {isPlaying ? (
              <>
                <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-bounce" />
                <span>NO AR</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current group-hover:scale-110 transition-transform" />
                <span>OUÇA AO VIVO</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
