import { NewsItem, ProgramItem, ChannelItem } from "./types";

export const CHANNELS: ChannelItem[] = [
  {
    id: "main",
    name: "Nova Cidade Ao Vivo",
    genre: "Pop, Rock, Sertanejo & Hits",
    url: "https://stm19.xcast.com.br:11896/stream",
    description: "A rádio nº 1 de Balneário Rincão e litoral sul catarinense, tocando os maiores sucessos e trazendo notícias locais em tempo real.",
  },
  {
    id: "lofi",
    name: "Cidade Lo-Fi Chillout",
    genre: "Lo-Fi, Jazz Hop & Study Beats",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    description: "Sinta a brisa marinha de Balneário Rincão! Seleção de batidas relaxantes e lofi para focar, relaxar ou acompanhar o seu dia.",
  },
  {
    id: "electro",
    name: "Nova Cidade Club",
    genre: "House, Deep House & Dance",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    description: "A vibe eletrônica dos melhores lounges e beach clubs do litoral de Santa Catarina sintonizada diretamente com você.",
  }
];

export const PROGRAMS: ProgramItem[] = [
  {
    id: "manha-total",
    timeStart: "08:00",
    timeEnd: "12:00",
    name: "Manhã Total",
    host: "Carlos Ramos & Aline Souza",
    description: "Comece o seu dia bem informado com as notícias de Balneário Rincão e região da AMREC, boletins de trânsito, previsão do tempo na praia e sorteio de prêmios.",
    badge: "Ao Vivo",
    genre: "Variedades & Notícias"
  },
  {
    id: "tarde-hits",
    timeStart: "12:00",
    timeEnd: "18:00",
    name: "Tarde Hits",
    host: "Marcelo 'DJ' Costa",
    description: "As músicas mais ouvidas no litoral do Rincão e sul catarinense! Interação total por WhatsApp, pedidos musicas ao vivo e energia contagiante.",
    badge: "Líder em Audiência",
    genre: "Sucessos Globais"
  },
  {
    id: "voz-cidade",
    timeStart: "18:00",
    timeEnd: "22:00",
    name: "Voz da Cidade",
    host: "Patrícia Mendes",
    description: "O jornalismo local de credibilidade em Balneário Rincão. Debates sobre o desenvolvimento do litoral sul de SC, prestação de serviços e curadoria refinada de MPB.",
    badge: "Destaque",
    genre: "Informativo & MPB"
  },
  {
    id: "madrugada-mix",
    timeStart: "22:00",
    timeEnd: "08:00",
    name: "Madrugada Mix",
    host: "Locução Automática",
    description: "Trilha sonora perfeita desenvolvida para embalar as noites repletas de estrelas à beira-mar de Balneário Rincão, trazendo clássicos atemporais.",
    genre: "Flashback & Lounge"
  }
];

export const NEWS: NewsItem[] = [
  {
    id: "news-1",
    title: "Abertura da Temporada de Verão em Balneário Rincão atrai milhares de turistas e impulsiona o comércio local",
    category: "Turismo & Lazer",
    snippet: "Com recorde histórico de público, o evento oficial trouxe shows nacionais gratuitos na beira-mar, gastronomia pesqueira típica e feira artesanal regional.",
    content: "O lançamento oficial da temporada em Balneário Rincão iniciou de forma incrível. Estima-se que mais de 50 mil pessoas circularam pelos deques de acesso e palcos na orla durante todo o fim de semana. Além de incentivar o turismo, a iniciativa oferece oficinas culturais locais e feira gastronômica de peixes e frutos do mar, valorizando a pesca artesanal e pescadores de Balneário Rincão. O calendário prossegue com várias atrações esportivas e musicais no calçadão das praias.",
    date: "24 de Maio, 2026",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=60",
    author: "Redação Vitrine do Sul",
    reads: 1420
  },
  {
    id: "news-2",
    title: "Campeonato Praiano de Futebol de Balneário Rincão agita o fim de semana esportivo no litoral sul de SC",
    category: "Esportes",
    snippet: "A tradicional disputa na areia atraiu grandes torcidas. As semifinais foram marcadas por viradas espetaculares e gols emocionantes nos minutos finais.",
    content: "O clássico praiano de ontem nas areias do Balneário Rincão entrará para a história do desporto regional. Sob sol forte e calor intenso, as equipes do Rincão FC e União Sul travaram um duelo tático excepcional. O time da União Sul abriu o placar no primeiro período da partida. Contudo, guiado pelos gritos de incentivo da torcida, o Rincão FC buscou o empate heroico e converteu a virada espetacular nos segundos finais garantindo vaga na disputa da grande final na praia do Rincão.",
    date: "23 de Maio, 2026",
    image: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=60",
    author: "Marcos Silva, Portal Vitrine do Sul",
    reads: 2105
  },
  {
    id: "news-3",
    title: "Revitalização e ampliação da orla marítima de Balneário Rincão é inaugurada com ciclovia, iluminação LED e acessibilidade",
    category: "Cidade",
    snippet: "Governo municipal concluiu as obras da principal via de orla turística. Projeto destaca-se pela preservação de dunas, novos acessos de madeira e segurança ampliada.",
    content: "Balneário Rincão comemora a entrega formal do novo trecho revitalizado de sua calçada Beira-Mar. Com ciclovia totalmente demarcada, passagens de madeira suspensas que protegem e preservam a vegetação de restinga e dunas locais, além de modernos refletores em tecnologia LED solar que fornecem maior segurança para caminhadas noturnas. Moradores e turistas elogiaram muito a infraestrutura que eleva o potencial turístico da praia neste ano em SC.",
    date: "22 de Maio, 2026",
    image: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&auto=format&fit=crop&q=60",
    author: "Gabriela Vasconcellos",
    reads: 1890
  }
];

export const CONTACT_INFO = {
  phone: "(48) 99682-7641",
  email: "comercial@radiowebnovacidade.com.br",
  address: "Av. Leoberto Leal, 200 - Caixa de Água, Balneário Rincão - SC, 88820-000",
  website: "https://www.radiowebnovacidade.com.br/",
  socials: {
    instagram: "https://instagram.com",
    facebook: "https://facebook.com",
    youtube: "https://youtube.com",
    whatsapp: "https://wa.me/5548996827641?text=Ol%C3%A1%20R%C3%A1dio%20Nova%20Cidade!%20Estou%20ouvindo%20pelo%20site%20e%20gostaria%20de%20pedir%20uma%20m%C3%BAsica."
  }
};
