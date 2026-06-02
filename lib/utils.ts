export const fmt = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

export const fmtShort = (v: number) =>
  new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v);

export const parseDecimal = (s: string) =>
  parseFloat(s.replace(/\./g, "").replace(",", ".")) || 0;

export const uid = () => crypto.randomUUID();

export const shareText = (text: string) => {
  if (navigator.share) {
    navigator.share({ text }).catch(() => copyText(text));
  } else {
    copyText(text);
  }
};

export const copyText = (text: string) => {
  navigator.clipboard.writeText(text).catch(() => {
    const ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
  });
};

export const formatDate = (ts: number) =>
  new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric" }).format(
    new Date(ts)
  );

// Palavras numéricas em português → número
const NUMEROS: Record<string, number> = {
  um: 1, uma: 1, dois: 2, duas: 2, três: 3, tres: 3, quatro: 4, cinco: 5,
  seis: 6, sete: 7, oito: 8, nove: 9, dez: 10, onze: 11, doze: 12,
  treze: 13, quatorze: 14, catorze: 14, quinze: 15, dezesseis: 16,
  dezessete: 17, dezoito: 18, dezenove: 19, vinte: 20,
};

const wordToNum = (s: string): number | null => {
  const n = NUMEROS[s.toLowerCase()];
  return n != null ? n : null;
};

// Converte texto como "trinta e cinco" → 35, "cem" → 100, "cento e vinte" → 120
const parseValorFalado = (s: string): number | null => {
  // Já é número (ex: "30", "18,50")
  const direto = parseFloat(s.replace(",", "."));
  if (!isNaN(direto)) return direto;

  const DEZENAS: Record<string, number> = {
    dez: 10, onze: 11, doze: 12, treze: 13, quatorze: 14, catorze: 14,
    quinze: 15, dezesseis: 16, dezessete: 17, dezoito: 18, dezenove: 19,
    vinte: 20, trinta: 30, quarenta: 40, cinquenta: 50, sessenta: 60,
    setenta: 70, oitenta: 80, noventa: 90, cem: 100, cento: 100,
    duzentos: 200, duzentas: 200, trezentos: 300, quatrocentos: 400,
    quinhentos: 500, seiscentos: 600, setecentos: 700, oitocentos: 800,
    novecentos: 900,
  };
  const UNIDADES: Record<string, number> = {
    um: 1, uma: 1, dois: 2, duas: 2, três: 3, tres: 3, quatro: 4,
    cinco: 5, seis: 6, sete: 7, oito: 8, nove: 9,
  };

  const tokens = s.toLowerCase().split(/\s+e\s+|\s+/);
  let total = 0;
  for (const t of tokens) {
    if (DEZENAS[t] != null) total += DEZENAS[t];
    else if (UNIDADES[t] != null) total += UNIDADES[t];
  }
  return total > 0 ? total : null;
};

/**
 * Interpreta fala contínua SEM pontuação. Suporta dois padrões:
 *   A) valor por extenso: "uma pizza trinta reais duas cervejas dezoito reais"
 *   B) valor numérico com R$: "Duas pizzas a R$36 cadaQuatro cervejas a R$18"
 *   C) valor numérico com "reais": "pizza 30 reais cerveja 8 reais"
 *   D) mistura de A, B e C no mesmo texto
 *
 * Estratégia: converte TUDO para tokens [NOME ... V:XX] unificados,
 * depois divide nesses tokens para extrair cada item.
 */
export const parseVoiceInput = (text: string): { name: string; quantity: number; unitPrice: number }[] => {
  const items: { name: string; quantity: number; unitPrice: number }[] = [];

  // Passo 1: marca preços numéricos com R$ como token especial [V:XX]
  // Normaliza vírgula → ponto dentro do token para sobreviver ao cleanup
  let t = text.replace(/R\$\s*(\d+(?:[,.]\d+)?)/gi, (_, v) => ` [V:${parseFloat(v.replace(",", ".")).toFixed(2)}] `);

  // Passo 2: marca "NÚMERO reais" ou "por extenso reais" como token [V:XX]
  // Faz isso ANTES de lowercasar para não confundir com nomes
  // "trinta reais" → "[V:30]", "18 reais" → "[V:18]", "dezoito reais" → "[V:18]"
  t = t
    // "18 reais e 50 centavos" ou "18 reais" (com centavos opcionais)
    .replace(/(\d+(?:[,.]\d+)?)\s+reais?(?:\s+e\s+(\d+)\s+centavos?)?/gi, (_, r, c) => {
      const reais = parseFloat(r.replace(",", "."));
      const cents = c ? parseInt(c) / 100 : 0;
      return `[V:${(reais + cents).toFixed(2)}]`;
    })
    // Extenso seguido de "reais" (+ centavos opcionais): "dezoito reais e cinquenta centavos"
    .replace(
      /\b((?:cento?|duzentos?|trezentos?|quatrocentos?|quinhentos?|seiscentos?|setecentos?|oitocentos?|novecentos?)(?:\s+e\s+\w+)?|(?:vinte|trinta|quarenta|cinquenta|sessenta|setenta|oitenta|noventa)(?:\s+e\s+\w+)?|dez(?:esseis|essete|esseis|oito|enove)?|onze|doze|treze|qu(?:atorze|inze)|dezesseis|dezessete|dezenove)\s+reais?(?:\s+e\s+((?:\w+)(?:\s+e\s+\w+)?)\s+centavos?)?/gi,
      (_, extenso, centsWord) => {
        const r = parseValorFalado(extenso) ?? 0;
        const c = centsWord ? (parseValorFalado(centsWord) ?? 0) / 100 : 0;
        return `[V:${(r + c).toFixed(2)}]`;
      }
    )
    // Unidades por extenso seguidas de "reais" (+ centavos opcionais)
    .replace(/\b(um[a]?|dois|duas|tr[eê]s|quatro|cinco|seis|sete|oito|nove)\s+reais?(?:\s+e\s+((?:\w+)(?:\s+e\s+\w+)?)\s+centavos?)?/gi, (_, extenso, centsWord) => {
      const r = parseValorFalado(extenso);
      if (!r) return extenso + " reais";
      const c = centsWord ? (parseValorFalado(centsWord) ?? 0) / 100 : 0;
      return `[V:${(r + c).toFixed(2)}]`;
    });

  // Passo 3: lowercase + limpa pontuação preservando tokens [V:...]
  t = t.toLowerCase()
    .split(/(\[v:[\d.]+\])/i)
    .map((part, i) => i % 2 === 0 ? part.replace(/[.,;!?]/g, " ") : part)
    .join("")
    .replace(/\s+/g, " ").trim();

  // Passo 4: separa "cada" colado a palavra seguinte ("cadaQuatro" → "cada quatro")
  // Isso acontece quando o speech recognition cola duas palavras
  t = t.replace(/cada([a-záàãâéêíóôõúüç])/gi, "cada $1");

  // Passo 5: divide o texto pelos tokens [V:XX] usando regex com captura
  // "pizza [V:30] cervejas [V:18]" → ["pizza", "30", " cervejas", "18", ""]
  const partes = t.split(/\[v:([\d,.]+)\]/i);
  // partes = [seg0, val0, seg1, val1, ..., segN]
  // segmentos estão em índices pares, valores em índices ímpares

  for (let i = 1; i < partes.length; i += 2) {
    const valorStr = partes[i].trim();
    // O segmento que PRECEDE este valor é a soma do trecho atual
    // com o que sobrou do segmento anterior após o último valor
    const segmento = partes[i - 1].trim();

    if (!segmento) continue;

    const unitPrice = parseFloat(valorStr.replace(",", "."));
    if (!unitPrice || unitPrice <= 0) continue;

    processSegmento(segmento, String(unitPrice), items);
  }

  return items;
};

const QTY_WORDS: Record<string, number> = {
  um: 1, uma: 1, dois: 2, duas: 2, três: 3, tres: 3, quatro: 4, cinco: 5,
  seis: 6, sete: 7, oito: 8, nove: 9, dez: 10, onze: 11, doze: 12,
  treze: 13, quatorze: 14, catorze: 14, quinze: 15,
};

function processSegmento(
  segmento: string,
  valorRaw: string,
  items: { name: string; quantity: number; unitPrice: number }[]
) {
  const unitPrice = parseFloat(valorRaw.replace(",", "."));
  if (!unitPrice || unitPrice <= 0) return;

  // Remove conectivos/palavras de ligação que ficam no início ou fim do segmento
  const seg = segmento
    .replace(/^(?:e\s+também|depois|mais|aí|então|também|cada)\s+/i, "")
    .replace(/\s+(?:a\b|ao?\s+preço\s+de|por|cada)\s*$/i, "")
    .trim();

  if (!seg) return;

  // Extrai quantidade do início: "2X", "2x", "duas", "quatro", etc.
  const qtyMatch = seg.match(
    /^(\d+[xX]?|uma?|dois|duas|tr[eê]s|quatro|cinco|seis|sete|oito|nove|dez|onze|doze|treze|quatorze|catorze|quinze)\s+([\s\S]+)/i
  );

  let quantity = 1;
  let nomeRaw = seg;

  if (qtyMatch) {
    const qRaw = qtyMatch[1].trim().replace(/[xX]$/, ""); // remove sufixo "x" de "2x"
    const n = parseInt(qRaw);
    if (!isNaN(n)) quantity = n;
    else quantity = QTY_WORDS[qRaw.toLowerCase()] ?? 1;
    nomeRaw = qtyMatch[2].trim();
  }

  // Limpa artigos/preposições do início do nome
  const nome = nomeRaw
    .replace(/^(?:de|do|da|dos|das|o\b|a\b|os\b|as\b|ao?)\s+/i, "")
    .trim();

  if (nome.length > 1) {
    items.push({ name: capitalize(nome), quantity, unitPrice });
  }
}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

// Normalize OCR text into items
export const parseOCRText = (raw: string): { name: string; quantity: number; unitPrice: number }[] => {
  const items: { name: string; quantity: number; unitPrice: number }[] = [];

  const isSkippable = (line: string): boolean => {
    if (/^[-=*.\s|_]+$/.test(line)) return true;
    if (/\b(cnpj|cpf)\b/i.test(line)) return true;
    if (/\b(total|subtotal)\b/i.test(line)) return true;
    if (/\bserv\b/i.test(line)) return true; // Serv., Serviço, Serv 12%
    if (/\btroco\b/i.test(line)) return true;
    if (/\b(vendedor|atendente|caixa|operador|garcom|garçom)\b/i.test(line)) return true;
    if (/\b(mesa|pedido|comanda|preconta|nro|cupom|fiscal|obrigado|volte)\b/i.test(line)) return true;
    if (/\b(data|hora)\b/i.test(line) && /\d{2}[/:]\d{2}/.test(line)) return true;
    if (/\b(p\.?unit|pr\.?unit|p\.?total|pr\.?total|qtde|valor\b)/i.test(line)) return true;
    if (/^[\d\s,.\-/]+$/.test(line)) return true;
    return false;
  };

  const parsePrice = (s: string) =>
    parseFloat(s.replace(/\./g, "").replace(",", "."));

  const PRICE_RE = /(?<![,\d])(\d{1,3}(?:\.\d{3})*,\d{2}|\d{1,6},\d{2})(?![,\d])/g;

  for (const rawLine of raw.split("\n")) {
    const line = rawLine.trim();
    if (!line || isSkippable(line)) continue;

    // Remove lixo e código de produto no início (ex: "[00083", "00083")
    const workLine = line.replace(/^[^A-Za-zÀ-ú\d]*\d{4,6}\s+/, "");

    // Extrai todos os preços indexados no workLine
    const prices = [...workLine.matchAll(PRICE_RE)].map((m) => ({
      val: parsePrice(m[1]),
      idx: m.index ?? 0,
      raw: m[1],
    }));

    if (prices.length === 0) continue;

    let qty = 1;
    let unitPrice: number;
    let name: string;

    if (prices.length >= 2) {
      const unitCol = prices[prices.length - 2];
      const totalCol = prices[prices.length - 1];

      // Calcula qty real pelos preços (ignora qty do OCR que pode estar errado)
      const impliedQty = Math.round(totalCol.val / unitCol.val);
      if (impliedQty > 0 && impliedQty < 200 && Math.abs(unitCol.val * impliedQty - totalCol.val) < 0.51) {
        qty = impliedQty;
        unitPrice = unitCol.val;
      } else {
        // Preços não batem: usa coluna unit como está
        unitPrice = unitCol.val;
      }

      name = workLine.substring(0, unitCol.idx).replace(/[.\s]+$/, "").trim();
    } else {
      // Uma coluna: é o unitário (não divide por qty — unit vem antes do total nas comandas)
      unitPrice = prices[0].val;
      name = workLine.substring(0, prices[0].idx).replace(/[.\s]+$/, "").trim();
    }

    // Remove prefixo de qty do nome (ex: "3 AGUA MINERAL" → "AGUA MINERAL")
    name = name.replace(/^\d+\s*[xX]?\s*/i, "").replace(/\s+/g, " ").trim();

    if (!name || !/[A-Za-zÀ-ú]{2}/.test(name)) continue;
    if (unitPrice <= 0 || unitPrice > 9999) continue;

    items.push({ name: capitalize(name), quantity: qty, unitPrice });
  }

  return items;
};
