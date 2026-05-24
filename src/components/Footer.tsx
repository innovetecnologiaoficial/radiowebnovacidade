import { Radio, Instagram, Facebook, Youtube, Phone, Mail, MapPin, ArrowUp, Sparkles, MessageCircle } from "lucide-react";
import { CONTACT_INFO } from "../data";

interface FooterProps {
  onOpenRequestModal: () => void;
}

export default function Footer({ onOpenRequestModal }: FooterProps) {
  const handleScrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  return (
    <footer id="footer-root" className="bg-[#020a17] border-t border-white/5 pt-16 pb-8 relative overflow-hidden">
      {/* Decorative Beach & Cyber-Ocean Ambient Glows */}
      <div className="absolute left-1/4 top-0 w-[400px] h-[400px] bg-brand-turquoise/10 rounded-full blur-[120px] pointer-events-none select-none" />
      <div className="absolute right-10 bottom-0 w-[300px] h-[300px] bg-brand-orange/5 rounded-full blur-[100px] pointer-events-none select-none" />
      
      {/* Wave Divider subtle background line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-brand-turquoise/40 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pb-14 border-b border-white/5">
          
          {/* COLUMN 1: GRAND LOGO SHOWCASE PANEL (Emphasis on Logo) */}
          <div className="lg:col-span-5 flex flex-col items-start text-left">
            {/* Simple logo and title presentation */}
            <div className="flex items-center gap-4 mb-6 select-none">
              <img 
                src="https://www.radiowebnovacidade.com.br/imagens/logobg.png" 
                alt="Logo Rádio Web Nova Cidade" 
                className="h-16 w-16 object-contain brightness-110 contrast-105 drop-shadow-[0_4px_12px_rgba(30,203,225,0.25)]"
                referrerPolicy="no-referrer"
              />
              <div className="text-left">
                <h3 className="text-white text-lg font-black tracking-tight uppercase leading-tight">
                  RÁDIO WEB
                </h3>
                <p className="text-brand-turquoise text-sm font-semibold tracking-wider font-mono uppercase">
                  NOVA CIDADE
                </p>
              </div>
            </div>
            
            <p className="text-gray-400 text-sm leading-relaxed max-w-md mb-6">
              A rádio online número um de <strong className="text-white">Balneário Rincão - SC</strong>. Conectando todo o litoral sul catarinense com programação de ponta, canais integrados de jornalismo e a melhor energia musical.
            </p>

            {/* Redes Sociais */}
            <div className="w-full">
              <span className="text-[10px] font-mono font-bold tracking-widest text-gray-500 uppercase block mb-3">
                Acompanhe nas Redes Sociais
              </span>
              <div className="flex items-center gap-3">
                {[
                  { icon: <Instagram className="w-4.5 h-4.5" />, href: CONTACT_INFO.socials.instagram, label: "Instagram", colorClass: "hover:text-[#e1306c]" },
                  { icon: <Facebook className="w-4.5 h-4.5" />, href: CONTACT_INFO.socials.facebook, label: "Facebook", colorClass: "hover:text-[#1877f2]" },
                  { icon: <Youtube className="w-4.5 h-4.5" />, href: CONTACT_INFO.socials.youtube, label: "YouTube", colorClass: "hover:text-[#ff0000]" },
                ].map((social, i) => (
                  <a
                    key={i}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-10 h-10 rounded-xl bg-white/[0.03] text-gray-400 border border-white/5 flex items-center justify-center transition-all duration-300 ${social.colorClass} hover:bg-white/[0.08] hover:border-white/20 hover:-translate-y-1 hover:shadow-[0_4px_12px_rgba(0,0,0,0.5)]`}
                    aria-label={social.label}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* COLUMN 2: HIGH CONTRAST NAVIGATION LINKS */}
          <div className="lg:col-span-3 text-left">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-1.5 h-4 bg-brand-turquoise rounded-full" />
              <h4 className="text-white font-mono text-xs font-black uppercase tracking-widest">
                Navegação
              </h4>
            </div>
            
            <ul className="space-y-4 text-sm">
              <li>
                <button
                  onClick={() => {
                    const el = document.getElementById("section-news");
                    if (el) {
                      const offset = 85;
                      const bodyRect = document.body.getBoundingClientRect().top;
                      const elementRect = el.getBoundingClientRect().top;
                      const elementPosition = elementRect - bodyRect;
                      const offsetPosition = elementPosition - offset;
                      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
                    }
                  }}
                  className="text-gray-400 hover:text-brand-turquoise transition-colors cursor-pointer text-left focus:outline-none flex items-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-turquoise/40 group-hover:bg-brand-turquoise transition-colors" />
                  <span>Vitrine de Notícias</span>
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenRequestModal}
                  className="text-brand-orange font-bold hover:text-brand-gold transition-colors cursor-pointer text-left focus:outline-none flex items-center gap-2 group mt-2 sm:text-base text-sm"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-orange animate-ping" />
                  <span>Pedir Música Ao Vivo!</span>
                </button>
              </li>
            </ul>

            {/* Tech Quality Signifier Card */}
            <div className="mt-10 p-5 rounded-2xl bg-white/[0.01] border border-white/[0.03] flex items-center gap-3">
              <Radio className="w-8 h-8 text-brand-turquoise animate-pulse shrink-0" />
              <div className="text-[11px] text-gray-500 font-mono leading-normal">
                Transmissor online com áudio HD de alta definição e compressão de som do estúdio.
              </div>
            </div>
          </div>

          {/* COLUMN 3: CONTACT INFOS & INTERACTIVE WHATSAPP CTA */}
          <div className="lg:col-span-4 text-left">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-1.5 h-4 bg-brand-orange rounded-full" />
              <h4 className="text-white font-mono text-xs font-black uppercase tracking-widest">
                Contatos & Estúdio
              </h4>
            </div>
            
            <ul className="space-y-4 text-sm text-gray-400 mb-8">
              <li className="flex items-start gap-3.5 group/map">
                <MapPin className="w-5 h-5 text-brand-turquoise shrink-0 mt-0.5 group-hover/map:text-brand-orange transition-colors" />
                <div className="flex flex-col">
                  <a 
                    href="https://maps.app.goo.gl/Fb7jCiKXyqMvoupw8"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-brand-turquoise text-gray-300 transition-colors leading-relaxed font-semibold cursor-pointer decoration-dotted hover:underline"
                  >
                    {CONTACT_INFO.address}
                  </a>
                  <a
                    href="https://maps.app.goo.gl/Fb7jCiKXyqMvoupw8"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-brand-turquoise/80 group-hover/map:text-brand-orange transition-colors font-mono tracking-wider uppercase mt-1 flex items-center gap-1 cursor-pointer"
                  >
                    <span>Ver localização no Google Maps</span>
                    <span>→</span>
                  </a>
                </div>
              </li>

              <li className="flex items-center gap-3.5">
                <Phone className="w-5 h-5 text-brand-orange shrink-0" />
                <a
                  href={`tel:${CONTACT_INFO.phone.replace(/[^0-9]/g, "")}`}
                  className="hover:text-white transition-colors font-medium font-mono"
                >
                  {CONTACT_INFO.phone}
                </a>
              </li>

              <li className="flex items-center gap-3.5">
                <Mail className="w-5 h-5 text-brand-gold shrink-0" />
                <a 
                  href={`mailto:${CONTACT_INFO.email}`} 
                  className="hover:text-white transition-colors font-medium"
                >
                  {CONTACT_INFO.email}
                </a>
              </li>
            </ul>

            {/* WhatsApp Box */}
            <div className="rounded-2xl p-4.5 bg-gradient-to-br from-emerald-950/40 to-slate-900/40 border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.05)]">
              <span className="text-[9px] font-mono font-black text-emerald-400 tracking-widest uppercase block mb-2">
                FALE AO VIVO PELO WHATSAPP
              </span>
              <p className="text-xs text-gray-400 leading-normal mb-3.5">
                Participe do programa, mande notícias do Rincão ou envie denúncias direto na nossa mesa de som.
              </p>
              <a
                href={CONTACT_INFO.socials.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-widest font-sans transition-all duration-300 hover:shadow-[0_0_25px_rgba(16,185,129,0.35)] hover:-translate-y-0.5 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 fill-white text-emerald-600" />
                <span>MENSAGEM DE WHATSAPP</span>
              </a>
            </div>
          </div>
        </div>

        {/* BOTTOM FLOOR BAR: SYSTEM STANDARDS & SCROLL UP */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-gray-500 text-xs text-center md:text-left font-sans">
            <p className="text-gray-400">© 2026 Rádio Web Nova Cidade. Todos os direitos reservados.</p>
            <p className="mt-1.5 text-[10px] text-gray-600 uppercase font-mono tracking-wider flex flex-wrap items-center justify-center md:justify-start gap-y-1 gap-1.5">
              <span>Balneário Rincão SC</span>
              <span>•</span>
              <span className="text-brand-turquoise/60 font-semibold">Web Player Premium</span>
              <span>•</span>
              <span>HD Live Stream</span>
            </p>
          </div>

          {/* Aerodynamic flight up ScrollButton */}
          <button
            onClick={handleScrollToTop}
            className="group p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/5 hover:border-brand-turquoise/20 text-gray-400 hover:text-brand-turquoise transition-all cursor-pointer focus:outline-none flex items-center gap-2 text-xs font-semibold tracking-wider uppercase font-mono shadow-md"
            aria-label="Voltar para o topo do site"
          >
            <span className="hidden sm:inline pl-1">Voltar ao Topo</span>
            <ArrowUp className="w-4.5 h-4.5 group-hover:-translate-y-1 transition-transform duration-300" />
          </button>
        </div>

      </div>
    </footer>
  );
}
