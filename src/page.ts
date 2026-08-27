import { escapeHtml, type Quote } from "./quote";

const SHARED_CSS = `
    :root {
      color-scheme: light dark;
      --bg: #f3ead8;
      --fg: #2c2416;
      --muted: #6e6254;
    }

    @media (prefers-color-scheme: dark) {
      :root {
        --bg: #11100e;
        --fg: #e8e0d0;
        --muted: #9a8f7e;
      }
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    html, body {
      min-height: 100%;
    }

    body {
      min-height: 100dvh;
      display: grid;
      place-items: center;
      background: var(--bg);
      color: var(--fg);
      font-family: "Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif;
      padding: 2.5rem 1.5rem;
    }

    main {
      max-width: 36rem;
      animation: rise 0.7s ease;
    }

    blockquote p {
      font-size: clamp(1.35rem, 2.4vw, 1.85rem);
      line-height: 1.45;
      font-weight: 400;
      letter-spacing: -0.01em;
    }

    footer {
      margin-top: 1.75rem;
      color: var(--muted);
      font-size: 0.82rem;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    footer a {
      color: inherit;
      text-decoration: none;
    }

    footer a:hover {
      text-decoration: underline;
    }

    footer .links {
      margin-top: 0.85rem;
    }

    article h1 {
      font-size: clamp(1.35rem, 2.4vw, 1.85rem);
      font-weight: 400;
      letter-spacing: -0.01em;
      margin-bottom: 1.25rem;
    }

    article p, article dt, article dd, article li {
      line-height: 1.5;
      margin-bottom: 0.85rem;
    }

    article h2 {
      font-size: 1rem;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--muted);
      margin: 1.75rem 0 0.75rem;
      font-weight: 400;
    }

    article dl dt {
      font-weight: 400;
      margin-bottom: 0.25rem;
    }

    article dl dd {
      margin-bottom: 1.1rem;
      color: var(--fg);
    }

    article a {
      color: inherit;
    }

    article ul {
      list-style: none;
    }

    article li {
      margin-bottom: 1.1rem;
    }

    @keyframes rise {
      from { opacity: 0; transform: translateY(0.4rem); }
      to { opacity: 1; transform: none; }
    }
`;

function shell(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <style>${SHARED_CSS}
  </style>
</head>
<body>
  ${body}
</body>
</html>
`;
}

export function renderPage(quote: Quote): string {
  const text = escapeHtml(quote.text);
  const author = escapeHtml(quote.author);
  const work = escapeHtml(quote.work);
  const locator = escapeHtml(quote.locator);
  const id = escapeHtml(quote.id);

  return shell(
    "laestoa",
    `<main>
    <blockquote>
      <p>${text}</p>
      <footer>
        ${author}, ${work} ${locator}
        <div class="links">
          <a href="/q/${id}">/q/${id}</a>
          &nbsp;&nbsp;
          <a href="/fuentes">fuentes</a>
          &nbsp;&nbsp;
          <a href="/preguntas">preguntas</a>
        </div>
      </footer>
    </blockquote>
  </main>`,
  );
}

export function renderNotFound(): string {
  return shell(
    "laestoa",
    `<main>
    <blockquote>
      <p>No se encontró esa cita.</p>
      <footer>
        <div class="links">
          <a href="/">hoy</a>
          &nbsp;&nbsp;
          <a href="/fuentes">fuentes</a>
          &nbsp;&nbsp;
          <a href="/preguntas">preguntas</a>
        </div>
      </footer>
    </blockquote>
  </main>`,
  );
}

export type EditionNote = {
  author: string;
  works: string;
  translator: string;
  bibliographic: string;
  url: string;
  urlLabel: string;
};

export const EDITIONS: readonly EditionNote[] = [
  {
    author: "Epicteto",
    works: "Enquiridión",
    translator: "Enrique Ataide y Portugal",
    bibliographic:
      "Manual de Epicteto, Madrid, Oficina de Aznar, 1802. Traducción del francés.",
    url: "https://archive.org/details/BRes111594",
    urlLabel: "Internet Archive",
  },
  {
    author: "Marco Aurelio",
    works: "Meditaciones (en esta edición, Soliloquios)",
    translator: "Jacinto Díaz de Miranda",
    bibliographic:
      "Soliloquios o reflexiones morales del emperador Marco Aurelio, in Obras de los moralistas griegos, Biblioteca Clásica CXVII, Madrid, Viuda de Hernando y Ca., 1888. Reimprime la versión de 1785.",
    url: "https://archive.org/details/marcusaurelius_obrasdelosmoralistasgriegos_1888",
    urlLabel: "Internet Archive",
  },
  {
    author: "Séneca",
    works: "Cartas a Lucilio",
    translator: "Francisco Navarro y Calvo",
    bibliographic:
      "Epístolas morales, Biblioteca Clásica LXVI, Madrid, Luis Navarro, 1884.",
    url: "https://es.wikisource.org/wiki/Archivo:Ep%C3%ADstolas_morales_-_bdh0000051763.pdf",
    urlLabel: "Wikisource (BNE/BDH)",
  },
  {
    author: "Séneca",
    works:
      "Sobre la providencia, Sobre la vida bienaventurada, Sobre la tranquilidad del ánimo, Sobre la brevedad de la vida",
    translator: "Pedro Fernández Navarrete",
    bibliographic:
      "Tratados filosóficos, Tomo I, Biblioteca Clásica LXVII, Madrid, Luis Navarro, 1884. El texto citado se tomó de la reimpresión de Perlado Páez y Ca., Sucesores de Hernando, 1908.",
    url: "https://archive.org/details/tratadosfilosfi00navagoog",
    urlLabel: "Internet Archive",
  },
];

export function renderFuentes(): string {
  const groups = new Map<string, EditionNote[]>();
  for (const edition of EDITIONS) {
    const list = groups.get(edition.author) ?? [];
    list.push(edition);
    groups.set(edition.author, list);
  }

  const sections = [...groups.entries()]
    .map(([author, editions]) => {
      const items = editions
        .map((edition) => {
          return `<li>
        <p><strong>${escapeHtml(edition.works)}</strong>. ${escapeHtml(edition.translator)}. ${escapeHtml(edition.bibliographic)}</p>
        <p><a href="${escapeHtml(edition.url)}">${escapeHtml(edition.urlLabel)}</a></p>
      </li>`;
        })
        .join("\n");
      return `<h2>${escapeHtml(author)}</h2>\n    <ul>\n      ${items}\n    </ul>`;
    })
    .join("\n    ");

  return shell(
    "Fuentes",
    `<main>
    <article>
      <h1>Fuentes</h1>
      <p>El español de este sitio se copia de traducciones antiguas de dominio público.</p>
      ${sections}
      <footer class="links">
        <a href="/">hoy</a>
        &nbsp;&nbsp;
        <a href="/preguntas">preguntas</a>
      </footer>
    </article>
  </main>`,
  );
}

export function formatFuentesPlain(): string {
  const blocks = [
    "Fuentes",
    "",
    "El español de este sitio se copia de traducciones antiguas de dominio público.",
  ];
  let currentAuthor = "";
  for (const edition of EDITIONS) {
    if (edition.author !== currentAuthor) {
      currentAuthor = edition.author;
      blocks.push("", currentAuthor);
    }
    blocks.push(
      "",
      `${edition.works}. ${edition.translator}. ${edition.bibliographic}`,
      edition.url,
    );
  }
  blocks.push("");
  return `${blocks.join("\n")}\n`;
}

const FAQ: readonly { q: string; a: string }[] = [
  {
    q: "¿Qué es laestoa.cl?",
    a: "Un sitio con una cita estoica al día, tomada de Epicteto, Marco Aurelio o Séneca. Cada jornada, en Chile, todas las visitas ven la misma.",
  },
  {
    q: "¿Por qué al volver a entrar veo la misma cita?",
    a: "La cita corresponde al día, no se elige al azar en cada visita. Cambia cuando cambia la fecha.",
  },
  {
    q: "¿Qué es el localizador?",
    a: "El número que indica dónde está el pasaje en la obra: capítulo, carta, o libro y apartado, según el caso. Con él se puede hallar el mismo texto en otra edición. Por ejemplo, Enquiridión 8 es el capítulo 8 del Manual de Epicteto; Meditaciones 2.1 es el libro 2, apartado 1; Cartas a Lucilio 13 es la carta 13.",
  },
  {
    q: "¿De dónde sale el texto en español?",
    a: "De traducciones antiguas de dominio público. La lista de ediciones está en Fuentes.",
  },
  {
    q: "¿Puedo guardar una cita?",
    a: "Sí. Cada una tiene su propia dirección, el enlace que aparece bajo el texto. Más adelante habrá un espacio de conversación en cada cita.",
  },
];

export function renderPreguntas(): string {
  const items = FAQ.map(
    (item) => `<dt>${escapeHtml(item.q)}</dt>\n      <dd>${escapeHtml(item.a)}</dd>`,
  ).join("\n      ");

  return shell(
    "Preguntas",
    `<main>
    <article>
      <h1>Preguntas</h1>
      <dl>
      ${items}
      </dl>
      <footer class="links">
        <a href="/">hoy</a>
        &nbsp;&nbsp;
        <a href="/fuentes">fuentes</a>
      </footer>
    </article>
  </main>`,
  );
}

export function formatPreguntasPlain(): string {
  const lines = ["Preguntas", ""];
  for (const item of FAQ) {
    lines.push(item.q, item.a, "");
  }
  return `${lines.join("\n")}\n`;
}
