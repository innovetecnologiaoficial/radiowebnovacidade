import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Radio, Volume2, Sparkles, MessageCircleCode, ArrowDown, Mic, Calendar, Megaphone } from "lucide-react";
import { collection, addDoc, query, orderBy, limit, onSnapshot, serverTimestamp } from "firebase/firestore";
import { db, handleFirestoreError, OperationType, testConnection } from "./firebase";
import { CHANNELS, PROGRAMS } from "./data";
import { ChannelItem, ProgramItem, SongRequest } from "./types";

// Import Custom Subcomponents
import Loader from "./components/Loader";
import Header from "./components/Header";
import NewsSection from "./components/NewsSection";
import RequestModal from "./components/RequestModal";
import Footer from "./components/Footer";
import MiniPlayer from "./components/MiniPlayer";

export default function App() {
  const [isLoaderActive, setIsLoaderActive] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  
  // Audio configuration states
  const [activeChannel, setActiveChannel] = useState<ChannelItem>(CHANNELS[0]);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);

  // Program scheduling states
  const [currentProgram, setCurrentProgram] = useState<ProgramItem>(PROGRAMS[0]);

  // Modals displays
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [songRequests, setSongRequests] = useState<SongRequest[]>([]);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 1. Calculate active show on air based on current hourly schedule
  const evaluateCurrentShow = () => {
    const currentHour = new Date().getHours();
    
    // Schedule ranges:
    // 08:00 - 12:00 -> Manhã Total
    // 12:00 - 18:00 -> Tarde Hits
    // 18:00 - 22:00 -> Voz da Cidade
    // 22:00 - 08:00 -> Madrugada Mix
    let activeId = "madrugada-mix";
    if (currentHour >= 8 && currentHour < 12) {
      activeId = "manha-total";
    } else if (currentHour >= 12 && currentHour < 18) {
      activeId = "tarde-hits";
    } else if (currentHour >= 18 && currentHour < 22) {
      activeId = "voz-cidade";
    }

    const prog = PROGRAMS.find((p) => p.id === activeId);
    if (prog) {
      setCurrentProgram(prog);
    }
  };

  useEffect(() => {
    testConnection();
    evaluateCurrentShow();
    const interval = setInterval(evaluateCurrentShow, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  // 2. Setup Audio instance and event callbacks
  useEffect(() => {
    // Create new audio element
    const audio = new Audio();
    audio.src = activeChannel.url;
    audio.volume = volume;
    audioRef.current = audio;

    // Stream diagnostic triggers
    const handleWaiting = () => {
      setIsLoadingAudio(true);
    };

    const handleCanPlay = () => {
      setIsLoadingAudio(false);
    };

    const handlePlaying = () => {
      setIsLoadingAudio(false);
      setIsPlaying(true);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    const handleError = (e: Event) => {
      console.warn("Audio Stream connected / loaded state update.", e);
      setIsLoadingAudio(false);
    };

    audio.addEventListener("waiting", handleWaiting);
    audio.addEventListener("canplayable", handleCanPlay);
    audio.addEventListener("playing", handlePlaying);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("error", handleError);

    return () => {
      audio.pause();
      audio.removeEventListener("waiting", handleWaiting);
      audio.removeEventListener("canplayable", handleCanPlay);
      audio.removeEventListener("playing", handlePlaying);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("error", handleError);
    };
  }, []);

  // Sync volume state to audio element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // 3. Audio Handlers
  const handlePlayToggle = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      setIsLoadingAudio(true);
      
      // Modern browsers require play trigger within safe stack trace
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsLoadingAudio(false);
            setIsPlaying(true);
          })
          .catch((err) => {
            console.warn("Retrying streaming connection due to interaction limits.", err);
            // Re-load and play fallback track immediately if the Zeno demo stream fails to pipe
            setIsLoadingAudio(false);
            setIsPlaying(false);
          });
      }
    }
  };

  const handleChannelChange = (channel: ChannelItem) => {
    if (!audioRef.current) return;

    setActiveChannel(channel);
    setIsLoadingAudio(true);
    
    audioRef.current.src = channel.url;
    audioRef.current.load();

    if (isPlaying) {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsLoadingAudio(false);
          })
          .catch((err) => {
            console.error("Failed to play channel:", err);
            setIsLoadingAudio(false);
            setIsPlaying(false);
          });
      }
    } else {
      // Just loaded, not actively playing
      setIsLoadingAudio(false);
    }
  };

  const handleVolumeChange = (volValue: number) => {
    setVolume(volValue);
    if (volValue > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  const handleMuteToggle = () => {
    setIsMuted((prev) => !prev);
  };

  // Listen for song requests from Firestore
  useEffect(() => {
    const q = query(
      collection(db, "song_requests"),
      orderBy("createdAt", "desc"),
      limit(20)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const reqs: SongRequest[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          reqs.push({
            id: doc.id,
            name: data.name || "",
            city: data.city || "",
            song: data.song || "",
            artist: data.artist || "",
            message: data.message || "",
            timestamp: data.timestamp || ""
          });
        });
        setSongRequests(reqs);
      },
      (error) => {
        console.error("Error fetching song requests: ", error);
        handleFirestoreError(error, OperationType.LIST, "song_requests");
      }
    );

    return () => unsubscribe();
  }, []);

  // Submit song request
  const handleSongRequestSubmit = async (request: Omit<SongRequest, "id" | "timestamp">) => {
    const timestampStr = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    
    // Fallback optimistic update just in case they are offline
    const newRequest: SongRequest = {
      ...request,
      id: `request-${Date.now()}`,
      timestamp: timestampStr
    };
    setSongRequests((prev) => [newRequest, ...prev]);

    try {
      await addDoc(collection(db, "song_requests"), {
        name: request.name,
        city: request.city || "Ouvinte",
        song: request.song,
        artist: request.artist,
        message: request.message || "Enviado via WhatsApp",
        timestamp: timestampStr,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Failed to add song request to Firestore: ", error);
      handleFirestoreError(error, OperationType.CREATE, "song_requests");
    }
  };

  const scrollPlayNow = () => {
    // Quick play toggle for active live stream
    handlePlayToggle();
  };

  return (
    <div className="min-h-screen bg-[#070707] text-white font-sans relative antialiased flex flex-col justify-between selection:bg-brand-turquoise selection:text-neutral-dark">
      
      {/* Dynamic Splash Loadscreen */}
      <Loader onComplete={() => setIsLoaderActive(false)} />

      {/* Primary layout content (only rendered fully when loader ends) */}
      {!isLoaderActive && (
        <motion.div
          id="app-layout"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="flex flex-col min-h-screen"
        >
          {/* Transparent Glass Navbar */}
          <Header onPlayTrigger={scrollPlayNow} isPlaying={isPlaying} />

          {/* MAIN PAGE CORE */}
          <main className="flex-1">
            
            {/* HERO HERO SECTION */}
            <section
              id="hero-banner"
              className="relative min-h-[85vh] flex items-center justify-center pt-28 overflow-hidden bg-black"
            >
              {/* Background ambient beach visual design with parallax gradient overlay */}
              <div className="absolute inset-0 z-0">
                <img
                  src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&auto=format&fit=crop&q=80"
                  alt="Praia Paradisíaca ao Pôr do Sol"
                  className="w-full h-full object-cover opacity-80 filter scale-102"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#070707] via-black/30 to-black/10" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40" />
              </div>

              {/* Parallax dust/glow spots */}
              <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-brand-blue-ocean/10 rounded-full blur-[120px] pointer-events-none animate-pulse-slow" />
              <div className="absolute bottom-10 right-1/4 w-[380px] h-[380px] bg-brand-turquoise/10 rounded-full blur-[100px] pointer-events-none animate-pulse-slow" style={{ animationDelay: "2s" }} />

              <div className="max-w-4xl mx-auto px-4 text-center relative z-10 flex flex-col items-center">
                
                {/* Brand Logo Banner Image */}
                <motion.div
                  className="mb-6 flex justify-center"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1, duration: 0.8, type: "spring" }}
                >
                  <img
                    src="https://www.radiowebnovacidade.com.br/imagens/logobg.png"
                    alt="Logo Rádio Web Nova Cidade"
                    className="h-28 sm:h-36 md:h-44 w-auto object-contain drop-shadow-[0_8px_32px_rgba(30,203,225,0.45)] hover:scale-103 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                </motion.div>

                {/* Main Heading Text */}
                <motion.h1
                  id="hero-header-title"
                  className="text-5xl sm:text-6xl md:text-7xl font-black text-white leading-none tracking-tight uppercase"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4, duration: 0.8, type: "spring" }}
                >
                  RÁDIO WEB <br className="sm:hidden" />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue-ocean via-brand-turquoise to-brand-orange animate-pulse">
                    NOVA CIDADE
                  </span>
                </motion.h1>

                {/* Subtext description */}
                <motion.p
                  className="text-gray-300 text-base sm:text-lg md:text-xl mt-6 max-w-2xl mx-auto font-medium"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.8 }}
                >
                  Ouvir rádio online com suas músicas favoritas, notícias de Balneário Rincão, SC em tempo real e canais digitais exclusivos. A verdadeira trilha sonora do litoral sul catarinense.
                </motion.p>

                {/* Call-to-Action Controls and requests */}
                <motion.div
                  className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.8 }}
                >
                  <button
                    id="hero-btn-ouvir"
                    onClick={scrollPlayNow}
                    className="cursor-pointer w-full sm:w-auto px-8 py-4 rounded-full font-black text-sm uppercase tracking-wider text-neutral-dark bg-gradient-to-r from-brand-orange to-brand-gold hover:shadow-[0_0_25px_rgba(255,138,0,0.4)] hover:scale-103 transition-all flex items-center justify-center gap-2.5"
                  >
                    <Radio className="w-5 h-5 animate-pulse" />
                    <span>OUVIR AO VIVO</span>
                  </button>

                  <button
                    id="hero-btn-pedir"
                    onClick={() => setIsRequestModalOpen(true)}
                    className="cursor-pointer w-full sm:w-auto px-8 py-4 rounded-full font-bold text-sm uppercase tracking-wider text-white bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all flex items-center justify-center gap-2.5"
                  >
                    <MessageCircleCode className="w-5 h-5 text-brand-turquoise" />
                    <span>PEDIR MÚSICA</span>
                  </button>
                </motion.div>

              </div>
            </section>

            {/* LOCUTOR TONINHO SANTOS SECTION */}
            <section id="section-announcer" className="py-20 relative overflow-hidden bg-[#040a15] border-b border-white/5">
              {/* Beach city night/coastal background image with overlay */}
              <div className="absolute inset-0 z-0 pointer-events-none select-none">
                <img 
                  src="https://turismo.balneariorincao.sc.gov.br/uploads/sites/46/2022/10/2741754-scaled.jpg" 
                  alt="Scenic Beach City Coast Night Background" 
                  className="w-full h-full object-cover opacity-[0.52] mix-blend-screen scale-102"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-[#040a15]/95 via-transparent to-[#040a15]/95" />
              </div>

              {/* Subtle background glow effect */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-orange/5 rounded-full blur-[120px] pointer-events-none z-0" />
              
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                  
                  {/* Photo Container */}
                  <motion.div 
                    className="lg:col-span-5 flex justify-center"
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                  >
                    <div className="relative group w-full max-w-sm sm:max-w-md">
                      {/* Outer Glow frame */}
                      <div className="absolute -inset-1.5 bg-gradient-to-r from-brand-turquoise via-brand-orange to-brand-gold rounded-3xl blur opacity-30 group-hover:opacity-60 transition duration-1000 group-hover:duration-200"></div>
                      
                      {/* Image Frame Container */}
                      <div className="relative bg-[#020a14]/90 border border-white/10 rounded-3xl overflow-hidden p-4 sm:p-6 shadow-2xl">
                        <img 
                          src="https://radiowebnovacidade.com.br/imagens/toninho.png" 
                          alt="Locutor Toninho Santos - Rádio Web Nova Cidade" 
                          className="w-full h-auto max-h-[420px] object-contain rounded-2xl drop-shadow-[0_10px_25px_rgba(30,203,225,0.2)] hover:scale-[1.02] transition-transform duration-500"
                          referrerPolicy="no-referrer"
                        />
                        
                        {/* Dynamic Floating Tag inside Image frame */}
                        <div className="absolute bottom-6 left-6 right-6 bg-black/80 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex items-center justify-between">
                          <div className="text-left">
                            <span className="text-[10px] font-mono uppercase tracking-widest text-brand-turquoise block font-black">Ao Vivo de Balneário Rincão</span>
                            <span className="text-sm font-extrabold text-white block mt-0.5">Toninho Santos</span>
                          </div>
                          <span className="flex h-2.5 w-2.5 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Informational Text & Interaction Column */}
                  <motion.div 
                    className="lg:col-span-7 text-left space-y-6"
                    initial={{ opacity: 0, x: 55 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                  >
                    <div>
                      <span className="text-brand-orange uppercase font-mono text-xs tracking-widest font-black flex items-center gap-2 mb-3">
                        <span className="p-1 px-2 rounded bg-brand-orange/10 border border-brand-orange/20">LOCUTOR OFICIAL</span>
                        A Voz do Litoral Sul
                      </span>
                      <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight uppercase leading-tight font-sans">
                        SINTONIZE COM <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-turquoise via-brand-orange to-brand-gold">
                          TONINHO SANTOS
                        </span>
                      </h2>
                    </div>

                    <p className="text-gray-300 text-sm sm:text-base leading-relaxed max-w-2xl">
                      Com muito carisma, dinamismo e uma seleção musical incrível, o querido locutor <strong>Toninho Santos</strong> comanda a programação trazendo a energia contagiante de <strong>Balneário Rincão - SC</strong> diretamente para a sua tela! É a união de entretenimento, alto astral, prestação de serviço e a brisa do litoral sul catarinense em um só lugar.
                    </p>

                    {/* Features checklist Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      <div className="flex items-start gap-3 bg-[#030e1d]/45 p-4 rounded-xl border border-white/5 hover:border-brand-turquoise/20 transition-all">
                        <div className="p-2 rounded bg-brand-turquoise/10 text-brand-turquoise shrink-0">
                          <Mic className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white uppercase">Programação Diária</h4>
                          <p className="text-xs text-gray-400 mt-1">Os melhores sucessos locais e nacionais ao longo do seu dia.</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 bg-[#030e1d]/45 p-4 rounded-xl border border-white/5 hover:border-brand-orange/20 transition-all">
                        <div className="p-2 rounded bg-brand-orange/10 text-brand-orange shrink-0">
                          <Calendar className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white uppercase">Informação de Verdade</h4>
                          <p className="text-xs text-gray-400 mt-1">Notícias quentes e boletins integrados do Portal Vitrine do Sul.</p>
                        </div>
                      </div>
                    </div>

                    {/* Interaction Buttons with Toninho */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                      {/* WhatsApp Connection */}
                      <a 
                        href="https://wa.me/5548996827641?text=Ol%C3%A1%20Toninho%20Santos!%20Estou%20ouvindo%20a%20R%C3%A1dio%20Web%20Nova%20Cidade%20pelo%20site%20e%20gostaria%20de%20mandar%20um%20abra%C3%A7o!"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="cursor-pointer px-6 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-emerald-600 hover:bg-emerald-500 hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all flex items-center justify-center gap-2"
                      >
                        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.261 2.266 3.504 5.278 3.501 8.484-.007 6.66-5.344 11.997-11.958 11.997-2.005-.001-3.973-.502-5.724-1.458L0 24zm6.59-4.846c1.6.95 3.1 1.45 4.8 1.45 5.5 0 9.9-4.5 9.9-10s-4.4-10-9.9-10c-5.5 0-9.9 4.5-9.9 10 0 1.9.5 3.7 1.5 5.3L1.9 21.6l4.7-1.44zm11.3-4.9c-.3-.2-1.7-1-2-1.1-.3-.1-.5-.2-.7.1-.2.3-.8 1.1-1 1.3-.2.2-.4.2-.7.1a10 10 0 0 1-3.8-2.4 11 11 0 0 1-2.6-3.3c-.2-.3 0-.5.1-.6s.3-.4.5-.6c.2-.2.2-.3.3-.5.1-.2 0-.4 0-.5v-.1c-.2-.6-.7-1.5-.9-2-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.8.4a3 3 0 0 0-1 2.3c0 1.4.5 2.7 1.2 3.7a14 14 0 0 0 5.8 5.1c3.1 1.2 3.6.9 4.9.7 1.3-.2 2.8-.9 3.2-1.9.3-1 .3-1.8.2-2-.1-.2-.4-.3-.7-.4z" />
                        </svg>
                        <span>Falar com Toninho no WhatsApp</span>
                      </a>

                      {/* Music Request Button */}
                      <button 
                        onClick={() => setIsRequestModalOpen(true)}
                        className="cursor-pointer px-6 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider text-brand-turquoise bg-white/2 hover:bg-white/5 border border-brand-turquoise/20 hover:border-brand-turquoise/50 transition-all flex items-center justify-center gap-2"
                      >
                        <MessageCircleCode className="w-4 h-4" />
                        <span>Mandar Pedido no Ar</span>
                      </button>
                    </div>

                  </motion.div>
                </div>
              </div>
            </section>



            {/* NEWS STATION CONTAINER (Section 4) */}
            <NewsSection />

          </main>

          {/* DYNAMIC REGISTERED MUSIC ORDERS BANNER (SHOW RECENT SONGS REQUESTED BY CITIZENS) */}
          {songRequests.length > 0 && (
            <section
              id="recent-song-marquee"
              className="py-6 bg-gradient-to-r from-sky-950/20 to-teal-950/20 border-t border-brand-turquoise/15 overflow-hidden relative"
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-4">
                <span className="text-[10px] font-mono font-black uppercase text-brand-turquoise shrink-0 flex items-center gap-1.5 bg-black/40 border border-brand-turquoise/20 px-3 py-1 rounded-full">
                  <Sparkles className="w-4 h-4 text-brand-orange" />
                  Mural de Pedidos
                </span>
                
                {/* Scrolling requested list horizontal viewport */}
                <div className="flex-1 overflow-x-auto no-scrollbar flex items-center gap-6 py-1 whitespace-nowrap scroll-smooth">
                  {songRequests.map((req) => (
                    <div
                      key={req.id}
                      className="inline-flex items-center gap-2 bg-[#030e1d]/50 border border-brand-turquoise/15 py-1.5 px-4 rounded-xl text-xs shrink-0 select-none hover:border-brand-turquoise/20 transition-colors"
                    >
                      <span className="text-gray-400 font-medium">
                        <strong className="text-white font-semibold">{req.name}</strong> ({req.city}) pediu:
                      </span>
                      <span className="text-brand-turquoise font-bold font-mono">
                        {req.song} - {req.artist}
                      </span>
                      <span className="text-xs text-gray-500">[{req.timestamp}]</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* FOOTER SECTION (Section 6) */}
          <Footer onOpenRequestModal={() => setIsRequestModalOpen(true)} />

          {/* BOTTOM FLOATING CONTROL PANEL BAR (SCROLL REACTION COMPONENT) */}
          <MiniPlayer
            isPlaying={isPlaying}
            onPlayToggle={handlePlayToggle}
            activeChannel={activeChannel}
            currentProgram={currentProgram}
            volume={volume}
            onVolumeChange={handleVolumeChange}
            isMuted={isMuted}
            onMuteToggle={handleMuteToggle}
            onOpenRequestModal={() => setIsRequestModalOpen(true)}
          />

          {/* REUSABLE LIGHTWEIGHT MUSIC ORDERS SUBMIT modal */}
          <RequestModal
            isOpen={isRequestModalOpen}
            onClose={() => setIsRequestModalOpen(false)}
            onSubmitRequest={handleSongRequestSubmit}
          />

        </motion.div>
      )}
    </div>
  );
}
