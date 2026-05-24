import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Sparkles, Send, Music2, Heart, Check, Building2, User } from "lucide-react";
import { SongRequest } from "../types";

interface RequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitRequest: (request: Omit<SongRequest, "id" | "timestamp">) => void;
}

export default function RequestModal({ isOpen, onClose, onSubmitRequest }: RequestModalProps) {
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [song, setSong] = useState("");
  const [artist, setArtist] = useState("");
  const [message, setMessage] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [whatsappUrl, setWhatsappUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !song || !artist) {
      return;
    }

    setIsSubmitting(true);

    const whatsappNumber = "5548996827641";
    const textMessage = `Olá Toninho Santos! Enviei um pedido de música pelo site da Rádio Web Nova Cidade:

👤 *Nome:* ${name}
📍 *Cidade/Bairro:* ${city || "Não informado"}
🎵 *Música:* ${song}
🎤 *Artista:* ${artist}
${message.trim() ? `💬 *Recado:* ${message.trim()}` : ""}`;

    const encodedText = encodeURIComponent(textMessage);
    const url = `https://wa.me/${whatsappNumber}?text=${encodedText}`;
    setWhatsappUrl(url);

    // Call state callback to register it in the app's marquee/scroll for user's instant feedback
    onSubmitRequest({
      name,
      city: city || "Rádio Ouvinte",
      song,
      artist,
      message: message || "Enviado via WhatsApp"
    });

    // Short visual feedback before loading redirection
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmittedSuccess(true);
      
      // Auto redirect to WhatsApp as a convenience
      try {
        window.open(url, "_blank");
      } catch (err) {
        console.log("Adblocker/popup blocker prevented automatic open.", err);
      }
    }, 600);
  };

  const handleReset = () => {
    setName("");
    setCity("");
    setSong("");
    setArtist("");
    setMessage("");
    setSubmittedSuccess(false);
    setWhatsappUrl("");
  };

  const handleCloseSuccess = () => {
    handleReset();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-hidden">
          {/* Glass background overlay */}
          <motion.div
            className="absolute inset-0 bg-black/85 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal Container */}
          <motion.div
            className="relative w-full max-w-lg rounded-2xl bg-[#071629] border border-[#1ECBE1]/25 shadow-[0_0_50px_rgba(30,203,225,0.15)] overflow-hidden z-10 text-left"
            initial={{ scale: 0.95, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 30 }}
            transition={{ type: "spring", damping: 25 }}
          >
            {/* Turquoise/Ocean top header accent bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-blue-ocean to-brand-turquoise" />

            {/* Close trigger button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Interactive Screen States: Success or Form */}
            <div className="p-6 sm:p-8">
              {!submittedSuccess ? (
                <>
                  <div className="flex items-center gap-2 mb-6 text-brand-turquoise">
                    <Music2 className="w-6 h-6 text-brand-turquoise" />
                    <h3 className="text-xl font-bold text-white uppercase tracking-tight">
                      PEÇA SUA <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-turquoise to-brand-orange">MÚSICA</span>
                    </h3>
                  </div>

                  <p className="text-gray-400 text-xs mb-6 leading-relaxed">
                    Mande seu pedido musical diretamente para o nosso WhatsApp! Preencha a de som do estúdio e clique para abrir a conversa.
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Visitor Name and City */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-mono uppercase tracking-widest text-gray-400 mb-1.5 font-bold">
                          Seu Nome <span className="text-brand-orange">*</span>
                        </label>
                        <div className="relative">
                          <span className="absolute left-3.5 top-3.5 text-gray-500">
                            <User className="w-4 h-4" />
                          </span>
                          <input
                            type="text"
                            required
                            placeholder="Ex: João da Silva"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-[#030e1d] border border-white/5 focus:border-brand-turquoise text-white rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none transition-colors"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono uppercase tracking-widest text-gray-400 mb-1.5 font-bold">
                          Sua Cidade / Bairro
                        </label>
                        <div className="relative">
                          <span className="absolute left-3.5 top-3.5 text-gray-500">
                            <Building2 className="w-4 h-4" />
                          </span>
                          <input
                            type="text"
                            placeholder="Ex: Centro"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            className="w-full bg-[#030e1d] border border-white/5 focus:border-brand-turquoise text-white rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none transition-colors"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Target Song and Artist */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-mono uppercase tracking-widest text-gray-400 mb-1.5 font-bold">
                          Nome da Música <span className="text-brand-orange">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Ex: Blinding Lights"
                          value={song}
                          onChange={(e) => setSong(e.target.value)}
                          className="w-full bg-[#030e1d] border border-white/5 focus:border-brand-turquoise text-white rounded-xl py-2.5 px-4 text-sm outline-none transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono uppercase tracking-widest text-gray-400 mb-1.5 font-bold">
                          Artista / Cantor <span className="text-brand-orange">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Ex: The Weeknd"
                          value={artist}
                          onChange={(e) => setArtist(e.target.value)}
                          className="w-full bg-[#030e1d] border border-white/5 focus:border-brand-turquoise text-white rounded-xl py-2.5 px-4 text-sm outline-none transition-colors"
                        />
                      </div>
                    </div>

                    {/* Optional Recado Message */}
                    <div>
                      <label className="block text-[10px] font-mono uppercase tracking-widest text-gray-400 mb-1.5 font-bold">
                        Recado / Alô Especial
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Escreva um recado para os locutores mandarem no ar (Opcional)..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="w-full bg-[#030e1d] border border-white/5 focus:border-brand-turquoise text-white rounded-xl py-2.5 px-4 text-sm outline-none transition-colors resize-none"
                      />
                    </div>

                    {/* Submit and reset CTA buttons */}
                    <div className="pt-4 flex items-center justify-end gap-3">
                      <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 text-white bg-gradient-to-r from-brand-orange to-brand-gold hover:shadow-[0_0_15px_rgba(255,138,0,0.3)] transition-all cursor-pointer disabled:opacity-50"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-4.5 h-4.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>PREPARANDO...</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5 fill-current" />
                            <span>PEDIR NO WHATSAPP</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-6 text-center flex flex-col items-center justify-center"
                >
                  <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mb-5">
                    <Check className="w-8 h-8 font-black" />
                  </div>

                  <h3 className="text-xl font-extrabold text-white uppercase tracking-tight mb-2">
                    Pedido Preparado!
                  </h3>
                  
                  <div className="flex items-center gap-1.5 text-emerald-400 font-mono text-[10px] uppercase font-bold tracking-widest mb-4">
                    <Sparkles className="w-4 h-4 text-brand-gold animate-bounce" />
                    Envie no WhatsApp da Rádio
                  </div>

                  <p className="text-gray-300 text-sm max-w-sm leading-relaxed mb-6">
                    Olá <strong className="text-white">{name}</strong>, seu pedido da música <strong className="text-brand-turquoise">"{song}"</strong> foi configurado! Se a conversa não abriu automaticamente, clique no botão verde abaixo para enviar seu alô ao direto para a mesa de som.
                  </p>

                  <div className="w-full flex flex-col gap-3">
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-4 rounded-xl font-black text-xs uppercase tracking-widest text-white bg-emerald-600 hover:bg-emerald-500 hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] flex items-center justify-center gap-2.5 transition-all cursor-pointer"
                    >
                      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.261 2.266 3.504 5.278 3.501 8.484-.007 6.66-5.344 11.997-11.958 11.997-2.005-.001-3.973-.502-5.724-1.458L0 24zm6.59-4.846c1.6.95 3.1 1.45 4.8 1.45 5.5 0 9.9-4.5 9.9-10s-4.4-10-9.9-10c-5.5 0-9.9 4.5-9.9 10 0 1.9.5 3.7 1.5 5.3L1.9 21.6l4.7-1.44zm11.3-4.9c-.3-.2-1.7-1-2-1.1-.3-.1-.5-.2-.7.1-.2.3-.8 1.1-1 1.3-.2.2-.4.2-.7.1a10 10 0 0 1-3.8-2.4 11 11 0 0 1-2.6-3.3c-.2-.3 0-.5.1-.6s.3-.4.5-.6c.2-.2.2-.3.3-.5.1-.2 0-.4 0-.5v-.1c-.2-.6-.7-1.5-.9-2-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.8.4a3 3 0 0 0-1 2.3c0 1.4.5 2.7 1.2 3.7a14 14 0 0 0 5.8 5.1c3.1 1.2 3.6.9 4.9.7 1.3-.2 2.8-.9 3.2-1.9.3-1 .3-1.8.2-2-.1-.2-.4-.3-.7-.4z" />
                      </svg>
                      <span>Conversar no WhatsApp</span>
                    </a>

                    <button
                      onClick={handleCloseSuccess}
                      className="w-full py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider text-gray-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                    >
                      Voltar para o Site
                    </button>
                  </div>
                </motion.div>
              )}
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
