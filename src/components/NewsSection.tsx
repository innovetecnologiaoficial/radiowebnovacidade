import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { BookOpen, Calendar, Clock, User, ArrowRight, Eye, X, Share2, CornerDownRight, ExternalLink, Megaphone } from "lucide-react";
import { NEWS } from "../data";
import { NewsItem } from "../types";

// Helper to decode XML/HTML entities cleanly in current environment
function decodeHTMLEntities(text: string): string {
  if (!text) return "";
  if (typeof document === "undefined") {
    // Server-side/Node context basic character mapper
    return text
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'")
      .replace(/&#39;/g, "'")
      .replace(/&iacute;/g, "í")
      .replace(/&aacute;/g, "á")
      .replace(/&oacute;/g, "ó")
      .replace(/&uacute;/g, "ú")
      .replace(/&eacute;/g, "é")
      .replace(/&atilde;/g, "ã")
      .replace(/&otilde;/g, "õ")
      .replace(/&ccedil;/g, "ç");
  }
  try {
    const textArea = document.createElement("textarea");
    textArea.innerHTML = text;
    return textArea.value;
  } catch (e) {
    return text;
  }
}

// Robust fallback parser when native browser XML parsing encounters issues
function parseRSSRegexFallback(xmlText: string): NewsItem[] {
  const result: NewsItem[] = [];
  const itemMatches = xmlText.match(/<item>([\s\S]*?)<\/item>/g) || [];
  
  for (let i = 0; i < itemMatches.length; i++) {
    const itemXml = itemMatches[i];
    
    const getTag = (tag: string): string => {
      const match = itemXml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\/${tag}>`, 'i'));
      if (match && match[1]) {
        return match[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").trim();
      }
      return "";
    };

    const title = getTag("title") || "Sem Título";
    const link = getTag("link") || "https://www.vitrinedosul.com.br";
    const description = getTag("description") || getTag("content:encoded") || "";
    const category = getTag("category") || "Notícias";
    const author = getTag("author") || getTag("dc:creator") || "Vitrine do Sul";
    const pubDate = getTag("pubDate");

    let formattedDate = pubDate;
    try {
      if (pubDate) {
        const d = new Date(pubDate);
        if (!isNaN(d.getTime())) {
          formattedDate = d.toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "short",
            year: "numeric"
          });
        }
      }
    } catch (e) {}

    const reads = Math.floor(Math.random() * 200) + 120;
    
    const decodedTitle = decodeHTMLEntities(title);
    const decodedDesc = decodeHTMLEntities(description);

    let snippet = decodedDesc
      .replace(/<[^>]*>/g, "")
      .replace(/\s+/g, " ")
      .trim();
    if (snippet.length > 150) {
      snippet = snippet.substring(0, 147) + "...";
    }

    const content = decodedDesc
      .replace(/<[^>]*>/g, "")
      .replace(/\s+/g, " ")
      .trim() || "Consulte mais detalhes no portal de notícias.";

    // Image extraction from enclosure or desc
    let image = "";
    const enclosureMatch = itemXml.match(/<enclosure[^>]+url=["']([^"']+)["']/i);
    if (enclosureMatch && enclosureMatch[1]) {
      image = enclosureMatch[1];
    }
    
    if (!image) {
      const imgMatch = description.match(/<img[^>]+src=["']([^"']+)["']/i);
      if (imgMatch && imgMatch[1]) {
        image = imgMatch[1];
      }
    }

    const defaultImages = [
      "https://str1.lnmimg.net/img/2026/02/02/92c154f7c47e6848a26cef9cfe740581.webp",
      "https://str1.lnmimg.net/img/2026/05/24/cd5b76f1f575f92a63bf99deae8d7769.webp",
      "https://www.vitrinedosul.com.br/images/noticias/1953/fc5aca7dff4afa5eec2a5887e2344bce.webp"
    ];

    if (!image || !image.startsWith("http")) {
      image = defaultImages[i % defaultImages.length];
    }

    const guidMatch = itemXml.match(/<guid[^>]*>([\s\S]*?)<\/guid>/i);
    const guid = guidMatch ? guidMatch[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").trim() : (link || `news-${i}-${Date.now()}`);

    result.push({
      id: guid,
      title: decodedTitle,
      category,
      snippet,
      content,
      date: formattedDate || "Recentemente",
      image,
      author,
      reads,
      link
    });
  }
  return result;
}

// Dynamic RSS XML Parser
function parseRSS(xmlText: string): NewsItem[] {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, "text/xml");
    
    // Fallback if browser parser encounters error
    const parserError = xmlDoc.getElementsByTagName("parsererror");
    if (parserError.length > 0) {
      console.warn("DOMParser error found. Relying on Regex Parser fallback.");
      return parseRSSRegexFallback(xmlText);
    }

    const items = xmlDoc.getElementsByTagName("item");
    const result: NewsItem[] = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      
      const getTagValue = (tagName: string): string => {
        const el = item.getElementsByTagName(tagName)[0];
        return el ? el.textContent || "" : "";
      };

      const title = getTagValue("title") || "Sem Título";
      const link = getTagValue("link") || "https://www.vitrinedosul.com.br";
      const description = getTagValue("description") || getTagValue("content:encoded") || "";
      const category = getTagValue("category") || "Notícias";
      const author = getTagValue("author") || getTagValue("dc:creator") || "Vitrine do Sul";
      const pubDate = getTagValue("pubDate");
      
      let formattedDate = pubDate;
      try {
        if (pubDate) {
          const d = new Date(pubDate);
          if (!isNaN(d.getTime())) {
            formattedDate = d.toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "short",
              year: "numeric"
            });
          }
        }
      } catch (e) {}

      const reads = Math.floor(Math.random() * 200) + 120;
      
      const decodedTitle = decodeHTMLEntities(title);
      const decodedDesc = decodeHTMLEntities(description);

      let snippet = decodedDesc
        .replace(/<[^>]*>/g, "")
        .replace(/\s+/g, " ")
        .trim();
      if (snippet.length > 150) {
        snippet = snippet.substring(0, 147) + "...";
      }

      const content = decodedDesc
        .replace(/<[^>]*>/g, "")
        .replace(/\s+/g, " ")
        .trim() || "Consulte mais detalhes no portal de notícias.";

      let image = "";
      
      // 1. Enclosure
      const enclosure = item.getElementsByTagName("enclosure")[0];
      if (enclosure) {
        image = enclosure.getAttribute("url") || "";
      }
      
      // 2. Media Tag
      if (!image) {
        const mediaContent = item.getElementsByTagName("media:content")[0];
        if (mediaContent) {
          image = mediaContent.getAttribute("url") || "";
        }
      }
      
      if (!image) {
        const mediaThumbnail = item.getElementsByTagName("media:thumbnail")[0];
        if (mediaThumbnail) {
          image = mediaThumbnail.getAttribute("url") || "";
        }
      }

      // 3. Img tag in description
      if (!image && description) {
        const imgMatch = description.match(/<img[^>]+src=["']([^"']+)["']/i);
        if (imgMatch && imgMatch[1]) {
          image = imgMatch[1];
        }
      }

      const defaultImages = [
        "https://str1.lnmimg.net/img/2026/02/02/92c154f7c47e6848a26cef9cfe740581.webp",
        "https://str1.lnmimg.net/img/2026/05/24/cd5b76f1f575f92a63bf99deae8d7769.webp",
        "https://www.vitrinedosul.com.br/images/noticias/1953/fc5aca7dff4afa5eec2a5887e2344bce.webp"
      ];

      if (!image || !image.startsWith("http")) {
        image = defaultImages[i % defaultImages.length];
      }

      const guid = getTagValue("guid") || link || `news-${i}-${Date.now()}`;

      result.push({
        id: guid,
        title: decodedTitle,
        category,
        snippet,
        content,
        date: formattedDate || "Recentemente",
        image,
        author,
        reads,
        link
      });
    }

    if (result.length === 0) {
      return parseRSSRegexFallback(xmlText);
    }

    return result;
  } catch (error) {
    console.error("DOMParser parse error, calling regex fallback", error);
    return parseRSSRegexFallback(xmlText);
  }
}

export default function NewsSection() {
  const [newsList, setNewsList] = useState<NewsItem[]>(NEWS);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [modalCopied, setModalCopied] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState<number>(3);

  useEffect(() => {
    let active = true;
    const fetchNews = async () => {
      try {
        setIsLoading(true);
        let xmlText = "";
        
        try {
          // 1. Tenta usar o proxy local caso a hospedagem seja Full-Stack (Node.js/Express)
          const response = await fetch(`/api/rss?t=${Date.now()}`);
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          xmlText = await response.text();
          // Verifica se o texto retornado não é um HTML (Erro 404 típico de hospedagem estática)
          if (xmlText.trim().toLowerCase().startsWith("<!doctype html>")) {
            throw new Error("Proxy local não encontrado (Hospedagem estática)");
          }
        } catch (localErr) {
          console.warn("Proxy local não disponível. Usando proxy público para CORS...");
          // 2. Se a hospedagem for estática (cPanel, Vercel, HostGator), usa o allOrigins para burlar o CORS
          const fallbackResponse = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent('https://www.vitrinedosul.com.br/rss.xml')}&t=${Date.now()}`);
          if (!fallbackResponse.ok) throw new Error(`Fallback HTTP ${fallbackResponse.status}`);
          xmlText = await fallbackResponse.text();
        }

        (window as any).__DEBUG_XML = xmlText;
        if (active) {
          const parsed = parseRSS(xmlText);
          if (parsed.length > 0) {
            setNewsList(parsed);
            setError(null);
          } else {
            throw new Error("Parsed empty news feed");
          }
        }
      } catch (err: any) {
        console.warn("Failed to fetch RSS news, fallback to local archive:", err);
        console.error("DEBUG XML_TEXT:", (window as any).__DEBUG_XML);
        if (active) {
          // Soft fallback to default predefined news
          setNewsList(NEWS);
          // Set error state so the header badge shows Offline without prompting the ugly big alert
          setError("offline");
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    fetchNews();
    return () => {
      active = false;
    };
  }, []);

  const handleShare = (item: NewsItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = item.link || `${window.location.origin}/noticia/${item.id}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedId(item.id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  return (
    <section id="section-news" className="py-20 bg-[#062B57]/20 border-y border-white/5 relative">
      <div className="absolute inset-0 bg-radial-dim-tropical opacity-10 pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* News Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div className="text-left">
            <span className="text-brand-turquoise uppercase font-mono text-xs tracking-widest font-black flex items-center gap-1.5 mb-2 flex-wrap sm:flex-nowrap">
              <BookOpen className="w-4 h-4 text-brand-turquoise" />
              Notícias Vitrine do Sul
              {isLoading ? (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[8px] font-bold font-mono tracking-wider bg-brand-turquoise/15 text-brand-turquoise border border-brand-turquoise/20 animate-pulse ml-1.5">
                  Sincronizando...
                </span>
              ) : error ? (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[8px] font-bold font-mono tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/25 ml-1.5">
                  Offline (Pre-carregado)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[8px] font-bold font-mono tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 ml-1.5">
                  Sincronizado
                </span>
              )}
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight uppercase">
              PORTAL <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-turquoise to-brand-orange">VITRINE DO SUL</span>
            </h2>
            <p className="text-gray-400 text-sm mt-2 max-w-xl">
              Acompanhe as últimas publicações, notícias, reportagens especiais e acontecimentos importantes em tempo real diretamente do portal.
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex flex-col items-start md:items-end group">
            <span className="text-[10px] text-gray-500 font-mono tracking-wider uppercase block mb-2 font-medium">
              Parceria Exclusiva
            </span>
            <a 
              href="https://www.vitrinedosul.com.br/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="block relative bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 hover:border-brand-turquoise/20 p-2 px-3 rounded-xl transition-all duration-300 shadow-md transform hover:-translate-y-0.5"
            >
              <img 
                src="https://www.vitrinedosul.com.br/img/f23f14e98b1633ae33c6df8188840cb21436602a.png" 
                alt="Logo Vitrine do Sul" 
                className="h-9 w-auto object-contain brightness-105 contrast-105"
                referrerPolicy="no-referrer"
              />
            </a>
          </div>
        </div>

        {/* Modern Bento Grid News Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {newsList.slice(0, visibleCount).map((item, index) => (
            <motion.div
              key={item.id}
              className="bg-[#030e1d]/85 rounded-2xl overflow-hidden border border-[#0A5FA8]/20 hover:border-brand-turquoise/40 transition-all duration-300 flex flex-col group h-full shadow-lg"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              {/* Picture view */}
              <div className="relative h-56 overflow-hidden bg-black shrink-0">
                <img
                  src={item.image}
                  alt={item.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                  referrerPolicy="no-referrer"
                />
                
                {/* Floating Category tag over picture */}
                <span className="absolute top-4 left-4 text-[10px] font-mono tracking-wider font-extrabold uppercase px-2.5 py-1 rounded bg-black/80 text-brand-turquoise border border-brand-turquoise/30">
                  {item.category}
                </span>

                {/* Cover Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-85" />
              </div>

              {/* Informative description block */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  {/* Meta items */}
                  <div className="flex items-center gap-4 text-[10px] font-mono text-gray-400 mb-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-brand-turquoise" />
                      {item.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5 text-brand-orange" />
                      {item.reads} visualizações
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white leading-snug group-hover:text-brand-turquoise transition-colors duration-300 line-clamp-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-400 text-xs mt-2 line-clamp-3 leading-relaxed">
                    {item.snippet}
                  </p>
                </div>

                {/* Action button */}
                <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                  {/* Read Trigger */}
                  <button
                    onClick={() => setSelectedNews(item)}
                    className="text-white hover:text-brand-turquoise font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer group/btn"
                  >
                    <span>Ler Mais</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform text-brand-turquoise" />
                  </button>

                  {/* Quick Share Trigger */}
                  <button
                    onClick={(e) => handleShare(item, e)}
                    className="p-2 rounded-xl text-gray-500 hover:text-white bg-white/2 hover:bg-white/5 border border-white/5 cursor-pointer flex items-center gap-1 text-[10px] uppercase font-mono transition-colors"
                  >
                    <Share2 className="w-3 h-3 text-brand-orange" />
                    <span>{copiedId === item.id ? "Copiado!" : "Compartilhar"}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Expand / Collapse News Trigger */}
        {newsList.length > visibleCount && (
          <div className="mt-12 text-center">
            <button
              onClick={() => setVisibleCount((prev) => Math.min(prev + 3, newsList.length))}
              className="px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-[#062B57] hover:text-[#062B57] bg-brand-turquoise hover:bg-brand-turquoise/80 hover:shadow-[0_0_20px_rgba(30,203,225,0.4)] transition-all duration-300 font-sans cursor-pointer items-center inline-flex gap-2"
            >
              <span>Carregar Mais Notícias</span>
              <CornerDownRight className="w-3.5 h-3.5 rotate-90 text-[#062B57]" />
            </button>
          </div>
        )}

      </div>

      {/* Modern Pop-up Dialog for Article Reading */}
      <AnimatePresence>
        {selectedNews && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
            {/* Modal glass background overlay */}
            <motion.div
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedNews(null)}
            />

            {/* Modal Body Container */}
            <motion.div
              className="relative w-full max-w-3xl rounded-3xl bg-[#071629] border border-[#1ECBE1]/25 shadow-2xl overflow-hidden z-10 max-h-[85vh] flex flex-col"
              initial={{ scale: 0.95, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 30 }}
              transition={{ type: "spring", damping: 25, stiffness: 180 }}
            >
              {/* Cover view */}
              <div className="relative h-64 sm:h-80 w-full shrink-0">
                <img
                  src={selectedNews.image}
                  alt={selectedNews.title}
                  loading="lazy"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#071629] via-[#031326]/40 to-transparent" />
                
                {/* Floating category Tag */}
                <span className="absolute top-6 left-6 text-xs font-mono tracking-wider font-extrabold uppercase px-3 py-1.5 rounded-lg bg-gradient-to-r from-brand-blue-ocean to-brand-turquoise text-white">
                  {selectedNews.category}
                </span>

                {/* Close Button Trigger */}
                <button
                  onClick={() => setSelectedNews(null)}
                  className="absolute top-6 right-6 p-2 rounded-xl bg-black/70 border border-white/10 text-white hover:text-brand-turquoise hover:bg-black transition-colors cursor-pointer"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Text / Body Content - Scrollable */}
              <div className="p-6 sm:p-10 overflow-y-auto no-scrollbar flex-1 text-left">
                {/* Metadatas */}
                <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-gray-400 mb-4 pb-4 border-b border-white/5">
                  <span className="flex items-center gap-1">
                    <User className="w-4 h-4 text-brand-orange" />
                    Autor: {selectedNews.author}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4 text-brand-turquoise" />
                    {selectedNews.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4 text-brand-gold" />
                    Leitura: 3 min
                  </span>
                </div>

                {/* Main Heading title */}
                <h3 className="text-xl sm:text-2xl font-black text-white leading-tight uppercase mb-6">
                  {selectedNews.title}
                </h3>

                {/* Snippet / Blockquote accent */}
                <div className="p-4 rounded-xl bg-white/2 border-l-4 border-brand-turquoise italic text-sm text-gray-300 leading-relaxed mb-6">
                  "{selectedNews.snippet}"
                </div>

                {/* Core Paragraphs */}
                <div className="text-gray-300 text-sm sm:text-base space-y-4 leading-relaxed font-sans">
                  {selectedNews.content.split("\n\n").map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                  <p>Inovação, veracidade e compromisso de prestação de contas com o cidadão: estas são as diretrizes editoriais do Portal Vitrine do Sul em conjunto com os canais da Rádio Web Nova Cidade.</p>
                </div>
              </div>

              {/* Modal Footer with quick action keys */}
              <div className="p-6 bg-[#000000]/60 border-t border-white/5 flex items-center justify-between shrink-0 flex-wrap gap-4">
                <span className="text-[10px] font-mono text-gray-500 uppercase flex items-center gap-1">
                  <CornerDownRight className="w-3 h-3 text-brand-turquoise" />
                  Sincronizado via Vitrine do Sul RSS
                </span>
                <div className="flex items-center gap-3">
                  {selectedNews.link && (
                    <a
                      href={selectedNews.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-black bg-brand-turquoise hover:bg-brand-turquoise/80 transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <span>Ver no Portal</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                  <button
                    onClick={() => {
                      const shareUrl = selectedNews.link || `${window.location.origin}/noticia/${selectedNews.id}`;
                      navigator.clipboard.writeText(shareUrl);
                      setModalCopied(true);
                      setTimeout(() => setModalCopied(false), 2000);
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors cursor-pointer"
                  >
                    {modalCopied ? "Copiado!" : "Copiar Link"}
                  </button>
                  <button
                    onClick={() => setSelectedNews(null)}
                    className="px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider text-white bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
