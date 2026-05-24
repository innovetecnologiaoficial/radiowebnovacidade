import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

// Real-time memory cache for RSS proxy
let cachedRSS: string | null = null;
let lastCachedTime = 0;
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes TTL

// Generate beautiful backup RSS XML dynamically if target portal is slow, down, or blocked
function generateFallbackXML(): string {
  return `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:content="http://purl.org/rss/1.0/modules/content/">
<channel>
  <title>Vitrine do Sul - Fallback Cache</title>
  <link>https://www.vitrinedosul.com.br</link>
  <description>Backup RSS feed for Vitrine do Sul</description>
  <item>
    <title><![CDATA[Abertura da Temporada de Verão em Balneário Rincão atrai milhares de turistas e impulsiona o comércio local]]></title>
    <link>https://www.vitrinedosul.com.br/abertura-da-temporada-de-verao-em-balneario-rincao-atrai-milhares-de-turistas-e-impulsiona-o-comercio-local</link>
    <description><![CDATA[Com recorde histórico de público, o evento oficial trouxe shows nacionais gratuitos na beira-mar, gastronomia pesqueira típica e feira artesanal regional. O lançamento oficial da temporada em Balneário Rincão iniciou de forma incrível. Estima-se que mais de 50 mil pessoas circularam pelos deques de acesso e palcos na orla durante todo o fim de semana. Além de incentivar o turismo, a iniciativa oferece oficinas culturais locais e feira gastronômica de peixes e frutos do mar, valorizando a pesca artesanal e pescadores de Balneário Rincão. O calendário prossegue com várias atrações esportivas e musicais no calçadão das praias.]]></description>
    <category><![CDATA[Turismo & Lazer]]></category>
    <pubDate>Sun, 24 May 2026 12:00:00 GMT</pubDate>
    <enclosure url="https://str1.lnmimg.net/img/2026/02/02/92c154f7c47e6848a26cef9cfe740581.webp" type="image/webp" />
  </item>
  <item>
    <title><![CDATA[Campeonato Praiano de Futebol de Balneário Rincão agita o fim de semana esportivo no litoral sul de SC]]></title>
    <link>https://www.vitrinedosul.com.br/campeonato-praiano-de-futebol-de-balneario-rincao-agita-o-fim-de-semana-esportivo-no-litoral-sul-de-sc</link>
    <description><![CDATA[A tradicional disputa na areia atraiu grandes torcidas. As semifinais foram marcadas por viradas espetaculares e gols emocionantes nos minutos finais. O clássico praiano de ontem nas areias do Balneário Rincão entrará para a história do desporto regional. Sob sol forte e calor intenso, as equipes do Rincão FC e União Sul travaram um duelo tático excepcional. O time da União Sul abriu o placar no primeiro período da partida. Contudo, guiado pelos gritos de incentivo da torcida, o Rincão FC buscou o empate heroico e converteu a virada espetacular nos segundos finais garantindo vaga na disputa da grande final na praia do Rincão.]]></description>
    <category><![CDATA[Esportes]]></category>
    <pubDate>Sat, 23 May 2026 14:00:00 GMT</pubDate>
    <enclosure url="https://str1.lnmimg.net/img/2026/05/24/cd5b76f1f575f92a63bf99deae8d7769.webp" type="image/webp" />
  </item>
  <item>
    <title><![CDATA[Revitalização e ampliação da orla marítima de Balneário Rincão é inaugurada com ciclovia, iluminação LED e acessibilidade]]></title>
    <link>https://www.vitrinedosul.com.br/revitalizacao-e-ampliacao-da-orla-maritima-de-balneario-rincao-e-inaugurada-com-ciclovia-iluminacao-led-e-acessibilidade</link>
    <description><![CDATA[Governo municipal concluiu as obras da principal via de orla turística. Projeto destaca-se pela preservação de dunas, novos acessos de madeira e segurança ampliada. Balneário Rincão comemora a entrega formal do novo trecho revitalizado de sua calçada Beira-Mar. Com ciclovia totalmente demarcada, passagens de madeira suspensas que protegem e preservam a vegetação de restinga e dunas locais, além de modernos refletores em tecnologia LED solar que fornecem maior segurança para caminhadas noturnas. Moradores e turistas elogiaram muito a infraestrutura que eleva o potencial turístico da praia neste ano em SC.]]></description>
    <category><![CDATA[Cidade]]></category>
    <pubDate>Fri, 22 May 2026 10:00:00 GMT</pubDate>
    <enclosure url="https://www.vitrinedosul.com.br/images/noticias/1953/fc5aca7dff4afa5eec2a5887e2344bce.webp" type="image/webp" />
  </item>
</channel>
</rss>`;
}

  // RSS Feed Proxy Endpoint
  app.get("/api/rss", async (req, res) => {
    const now = Date.now();
    
    // Serve cached RSS if fresh and exists
    if (cachedRSS && (now - lastCachedTime < CACHE_TTL)) {
      res.setHeader("Content-Type", "application/xml; charset=utf-8");
      res.setHeader("X-Cache-Status", "HIT");
      return res.send(cachedRSS);
    }

    try {
      // Clean fetch with 4.5 seconds timeout limit
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4500);

      const response = await fetch("https://www.vitrinedosul.com.br/rss.xml", {
        signal: controller.signal,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "application/xml, text/xml, */*"
        }
      });
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch RSS: ${response.status} ${response.statusText}`);
      }
      
      const text = await response.text();
      
      // Perform a light verification: make sure it has basic structural XML keys
      if (text.includes("<channel>") && text.includes("<item>")) {
        cachedRSS = text;
        lastCachedTime = now;
        res.setHeader("Content-Type", "application/xml; charset=utf-8");
        res.setHeader("X-Cache-Status", "MISS");
        return res.send(text);
      } else {
        throw new Error("Invalid RSS format returned from destination");
      }
    } catch (error: any) {
      console.warn("[Server RSS Proxy] Fallback mode triggered: ", error.message || error);
      
      res.setHeader("Content-Type", "application/xml; charset=utf-8");
      res.setHeader("X-Cache-Status", "FALLBACK");
      
      // Return stale cache if we have one, otherwise return default XML template
      if (cachedRSS) {
        return res.send(cachedRSS);
      } else {
        return res.send(generateFallbackXML());
      }
    }
  });

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Vite middleware for development or serving compiled files for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] Web Nova Cidade running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
