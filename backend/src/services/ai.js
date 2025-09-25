async function getOpenAI() {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  try {
    const { default: OpenAI } = await import('openai');
    return new OpenAI({ apiKey: key });
  } catch {
    return null;
  }
}

function extractPriceNumber(price) {
  if (typeof price === 'number') return price;
  if (!price) return null;
  const m = String(price).replace(/[\,\s]/g, '').match(/(\d+(?:\.\d+)?)/);
  return m ? parseFloat(m[1]) : null;
}

function basicSummarize(text) {
  // Very naive fallback: pick sentences and convert to bullets
  if (!text) return [];
  const sentences = text
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .filter(Boolean)
    .slice(0, 6);
  return sentences.map((s) => `• ${s.trim()}`);
}

export async function summarizeProduct({ title, description, specs = {}, features = [] }) {
  const text = [title, description, features.join('. '), JSON.stringify(specs)].filter(Boolean).join('\n');
  const openai = await getOpenAI();
  if (openai) {
    try {
      const prompt = `Summarize the following product into 5-7 short, consumer-friendly bullet points. Avoid marketing fluff, be specific.\n\n${text}`;
      const resp = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You write concise, useful product bullets.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.3,
      });
      const content = resp.choices?.[0]?.message?.content || '';
      return content
        .split(/\n+/)
        .map((l) => l.replace(/^[-*•]\s?/, '').trim())
        .filter(Boolean)
        .map((l) => `• ${l}`);
    } catch {
      // fall through to basic
    }
  }
  return basicSummarize(text);
}

function heuristicProsCons(product) {
  const pros = [];
  const cons = [];
  const price = extractPriceNumber(product.price);
  if (product.features?.length) {
    pros.push('Rich feature set');
  }
  if (price != null) {
    if (price < 50) pros.push('Great budget value');
    if (price > 500) cons.push('Premium price');
  }
  if ((product.specs && Object.keys(product.specs).length === 0) || (!product.features || product.features.length === 0)) {
    cons.push('Limited details available');
  }
  return { pros, cons };
}

export async function compareProducts(products, criteria = {}) {
  // products: [{ title, description, price, features, specs }]
  const enriched = await Promise.all(
    products.map(async (p) => {
      const bullets = await summarizeProduct(p);
      const { pros, cons } = heuristicProsCons(p);
      const price = extractPriceNumber(p.price);
      return { ...p, bullets, pros, cons, numericPrice: price };
    })
  );

  // Simple scoring: lower price + more features
  const scored = enriched.map((p) => {
    let score = 0;
    if (p.numericPrice != null) score += Math.max(0, 1000 - p.numericPrice); // cheaper is better
    score += (p.features?.length || 0) * 20;
    // Criteria adjustments
    if (criteria.budget) {
      const b = extractPriceNumber(criteria.budget);
      if (b != null && p.numericPrice != null && p.numericPrice <= b) score += 100;
    }
    if (criteria.quality === 'high') score += 30; // naive placeholder
    if (criteria.features && Array.isArray(criteria.features)) {
      const matchCount = (p.features || []).filter((f) => criteria.features.some((cf) => String(f).toLowerCase().includes(String(cf).toLowerCase()))).length;
      score += matchCount * 25;
    }
    return { ...p, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const best = scored[0];

  const priceSummary = scored
    .map((p) => `${p.title || 'Item'}: ${p.price ?? 'N/A'}`)
    .join(' | ');

  return {
    compared: scored.map(({ numericPrice, ...rest }) => rest),
    summary: {
      priceSummary,
      best: best ? { title: best.title, price: best.price, reason: 'Best balance of value and features (heuristic).', score: best.score } : null,
    },
  };
}
