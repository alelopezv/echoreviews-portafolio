export interface Review {
  id: string;
  title: string;
  author: {
    name: string;
    avatar: string;
    username: string;
  };
  date: string;
  coverImage: string;
  excerpt: string;
  content: string;
  rating: number;
  hashtags: string[];
  category: "anime" | "music" | "games" | "film";
  mediaTitle: string;
  readTime: number;
}

export const reviewsData: Review[] = [
  {
    id: "1",
    title: "Steins;Gate y la paradoja temporal más desgarradora del anime",
    author: {
      name: "María González",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
      username: "mariag"
    },
    date: "2026-04-01",
    coverImage: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1200&h=800&fit=crop",
    excerpt: "Un thriller de ciencia ficción que redefine el género, explorando las consecuencias del viaje en el tiempo con una profundidad emocional raramente vista.",
    content: `Steins;Gate no es simplemente un anime sobre viajes en el tiempo; es una exploración magistral sobre las consecuencias de nuestras decisiones y el peso del sacrificio. Lo que comienza como una premisa aparentemente ligera sobre un grupo de científicos aficionados descubriendo cómo enviar mensajes al pasado, se transforma en un thriller psicológico devastador.

Steins;Gate es una obra maestra que entiende que la ciencia ficción funciona mejor cuando está al servicio de la emoción humana. Es lenta cuando necesita serlo, devastadora cuando debe serlo, y al final, profundamente esperanzadora.`,
    rating: 9.5,
    hashtags: ["steinsgate", "anime", "scifi", "thriller", "timetravel", "whitefox"],
    category: "anime",
    mediaTitle: "Steins;Gate",
    readTime: 5
  },
  {
    id: "2",
    title: "OK Computer: El álbum que predijo el futuro digital",
    author: {
      name: "Carlos Mendoza",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
      username: "carlosm"
    },
    date: "2026-03-28",
    coverImage: "https://images.unsplash.com/photo-1619983081563-430f63602796?w=1200&h=800&fit=crop",
    excerpt: "Casi 30 años después, OK Computer sigue siendo el retrato más preciso de nuestra alienación tecnológica moderna.",
    content: `En 1997, Radiohead lanzó un álbum que no solo redefinió el rock alternativo, sino que también se convirtió en una profecía sobre nuestra relación con la tecnología. OK Computer es la banda sonora de la ansiedad moderna.

OK Computer no es solo uno de los mejores álbumes de los 90s; es una de las obras más importantes del rock. Es un álbum que entendió hacia dónde nos dirigíamos como sociedad antes de que llegáramos allí.`,
    rating: 10,
    hashtags: ["radiohead", "okcomputer", "rock", "alternative", "90s", "albumreview"],
    category: "music",
    mediaTitle: "OK Computer - Radiohead",
    readTime: 6
  },
  {
    id: "3",
    title: "Elden Ring: La culminación de una década de diseño FromSoftware",
    author: {
      name: "Ana Torres",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
      username: "anatorres"
    },
    date: "2026-03-25",
    coverImage: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=1200&h=800&fit=crop",
    excerpt: "FromSoftware perfecciona su fórmula en un mundo abierto que respeta la inteligencia del jugador.",
    content: `Elden Ring representa la culminación de todo lo que FromSoftware ha aprendido desde Demon's Souls. Es ambicioso, hermoso, frustrante y completamente inolvidable.

Lo primero que impresiona es la escala. The Lands Between es un mundo abierto verdaderamente épico, pero lo que lo distingue es su verticalidad y densidad. Cada área está llena de secretos, desde catacumbas ocultas hasta dragones dormidos en lagos. El diseño de niveles de FromSoftware, que ya era legendario, alcanza nuevas alturas aquí.

Este es un juego que se quedará en la conversación durante años. Es la prueba definitiva de que los juegos pueden ser tanto brutalmente difíciles como profundamente gratificantes.`,
    rating: 9.5,
    hashtags: ["eldenring", "fromsoftware", "soulslike", "openworld", "gamedesign"],
    category: "games",
    mediaTitle: "Elden Ring",
    readTime: 7
  },
  {
    id: "4",
    title: "Perfect Blue: El horror psicológico que Aronofsky homenajeó",
    author: {
      name: "Luis Ramírez",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
      username: "luisr"
    },
    date: "2026-03-22",
    coverImage: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200&h=800&fit=crop",
    excerpt: "Satoshi Kon crea una pesadilla visual sobre identidad, fama y la disolución entre realidad y ficción.",
    content: `Perfect Blue no ha envejecido ni un día desde 1997. De hecho, en la era de las redes sociales y la cultura de celebridades, su comentario sobre la pérdida de identidad es más relevante que nunca.

Satoshi Kon cuenta la historia de Mima Kirigoe, una idol japonesa que intenta hacer la transición a la actuación seria, solo para ver su vida desmoronarse mientras un acosador la persigue y comienza a perder el control de su propia identidad.

Perfect Blue es cine de autor en su forma más pura. Es una película que te hace cuestionar qué es real y qué es imaginado, no solo para los personajes sino para ti como espectador. Es perturbadora, hermosa y absolutamente inolvidable.`,
    rating: 9.5,
    hashtags: ["perfectblue", "satoshikon", "anime", "psychological", "thriller", "horror"],
    category: "anime",
    mediaTitle: "Perfect Blue",
    readTime: 6
  },
  {
    id: "5",
    title: "To Pimp a Butterfly: El jazz-rap como revolución social",
    author: {
      name: "Diego Silva",
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop",
      username: "diegos"
    },
    date: "2026-03-20",
    coverImage: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200&h=800&fit=crop",
    excerpt: "Kendrick Lamar entrega una obra maestra que fusiona jazz, funk y hip-hop para crear el álbum más importante de la década.",
    content: `To Pimp a Butterfly no es solo un álbum de hip-hop; es un statement cultural, una declaración política, y una obra de arte que trasciende géneros.

En 2026, casi once años después de su lanzamiento, To Pimp a Butterfly sigue siendo el estándar contra el cual se mide el hip-hop consciente. Es una obra maestra intemporal.`,
    rating: 10,
    hashtags: ["kendricklamar", "topimpabutterfly", "hiphop", "jazz", "albumreview", "conscious"],
    category: "music",
    mediaTitle: "To Pimp a Butterfly - Kendrick Lamar",
    readTime: 7
  },
  {
    id: "6",
    title: "Serial Experiments Lain: La pesadilla profética del internet",
    author: {
      name: "Sofía Chen",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop",
      username: "sofiac"
    },
    date: "2026-03-18",
    coverImage: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&h=800&fit=crop",
    excerpt: "En 1998, Serial Experiments Lain predijo nuestra existencia digital con una precisión escalofriante.",
    content: `Serial Experiments Lain es incómodo, confuso y absolutamente visionario. Lanzado en 1998, cuando el internet comercial apenas comenzaba, el anime de Yoshitoshi ABe y Ryutaro Nakamura predijo con precisión inquietante cómo la tecnología digital transformaría nuestra conciencia.

En una era donde vivimos más en línea que fuera de línea, donde la IA está comenzando a imitar la conciencia humana, donde la realidad virtual promete mundos alternativos, Serial Experiments Lain es más relevante que nunca. No es solo un anime de culto; es una advertencia que no escuchamos a tiempo.`,
    rating: 9.0,
    hashtags: ["serialexperimentslain", "anime", "cyberpunk", "philosophy", "cultclassic"],
    category: "anime",
    mediaTitle: "Serial Experiments Lain",
    readTime: 7
  },
  {
    id: "7",
    title: "Disco Elysium: El RPG que revolucionó la narrativa en videojuegos",
    author: {
      name: "Patricia Ruiz",
      avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&h=100&fit=crop",
      username: "patriciar"
    },
    date: "2026-03-15",
    coverImage: "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=1200&h=800&fit=crop",
    excerpt: "ZA/UM Studios demuestra que los videojuegos pueden ser literatura interactiva de primer nivel.",
    content: `Disco Elysium es el juego más literario que he experimentado. No es solo que tenga mucho texto - es que el texto es extraordinariamente bueno, del tipo que encontrarías en novelas premiadas.

Disco Elysium expandió lo que los videojuegos pueden ser. Es una obra maestra de narrativa interactiva.`,
    rating: 10,
    hashtags: ["discoelysium", "rpg", "narrative", "indie", "masterpiece"],
    category: "games",
    mediaTitle: "Disco Elysium",
    readTime: 8
  },
  {
    id: "8",
    title: "In Rainbows: El experimento que cambió la industria musical",
    author: {
      name: "Miguel Ángel Paz",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
      username: "miguelpaz"
    },
    date: "2026-03-12",
    coverImage: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200&h=800&fit=crop",
    excerpt: "Radiohead rompe con las discográficas y crea su álbum más cálido y accesible.",
    content: `In Rainbows es el álbum más cálido de Radiohead. Después de los experimentos fríos y electrónicos de Kid A y Amnesiac, y la desesperación claustrofóbica de Hail to the Thief, aquí encontramos una banda redescubriendo la alegría de tocar juntos.

Casi 20 años después, In Rainbows suena fresco. Es un álbum sobre conexión humana en una era digital, y sigue siendo relevante porque esas tensiones solo se han intensificado.`,
    rating: 9.5,
    hashtags: ["radiohead", "inrainbows", "alternative", "experimental", "albumreview"],
    category: "music",
    mediaTitle: "In Rainbows - Radiohead",
    readTime: 6
  }
];

export function getReviewById(id: string): Review | undefined {
  return reviewsData.find(review => review.id === id);
}

export function getReviewsByHashtag(hashtag: string): Review[] {
  return reviewsData.filter(review =>
    review.hashtags.includes(hashtag.toLowerCase().replace('#', ''))
  );
}

export function getAllHashtags(): string[] {
  const allHashtags = reviewsData.flatMap(review => review.hashtags);
  return Array.from(new Set(allHashtags)).sort();
}

export function getReviewsByCategory(category: Review["category"]): Review[] {
  return reviewsData.filter(review => review.category === category);
}
