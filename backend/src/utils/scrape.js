import axios from "axios";
import { load } from "cheerio";

function clean(text) {
  return text?.replace(/\s+/g, " ").trim();
}

function findPrice(text) {
  if (!text) return null;
  const m = text.replace(/[,\s]/g, "").match(/(\$|₹|€|£)?(\d+(?:\.\d{1,2})?)/);
  return m ? (m[1] ? `${m[1]}${m[2]}` : m[2]) : null;
}

async function scrapeProduct(url) {
  const { data: html } = await axios.get(url, {
    headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
  });
  const $ = load(html);

  // 1. Title
  const title =
    clean(
      $('meta[property="og:title"]').attr("content") ||
        $('meta[name="twitter:title"]').attr("content") ||
        $("h1").first().text() ||
        $("title").text()
    ) || "Product";

  // 2. Description
  const description = clean(
    $('meta[name="description"]').attr("content") ||
      $('meta[property="og:description"]').attr("content") ||
      $('meta[name="twitter:description"]').attr("content") ||
      $("div#productDescription").text() ||
      $("p").first().text()
  );

  // 3. Price
  let price = null;
  const priceSelectors = [
    "#priceblock_ourprice",
    "#priceblock_dealprice",
    '[class*="price"]',
    '[id*="price"]',
  ];
  for (const sel of priceSelectors) {
    const txt = clean($(sel).first().text());
    price = findPrice(txt);
    if (price) break;
  }

  // 4. Features / bullet points
  const features = [];
  $("ul li").each((_, el) => {
    const t = clean($(el).text());
    if (
      t &&
      t.length > 3 &&
      !/About this item|Buy now|Free shipping|Main content/i.test(t)
    ) {
      features.push(t);
    }
  });

  // Limit to first 6-8 meaningful features
  const uniqueFeatures = [...new Set(features)].slice(0, 8);

  // 5. Optional: specs (if Amazon table or definition list exists)
  const specs = {};
  $("table tr").each((_, el) => {
    const key = clean($(el).find("th").text());
    const val = clean($(el).find("td").text());
    if (key && val) specs[key] = val;
  });

  return {
    title,
    description,
    price,
    features: uniqueFeatures,
    specs,
    sourceUrl: url,
  };
}

export { scrapeProduct };
