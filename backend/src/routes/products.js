import { Router } from "express";
import { summarizeProduct, compareProducts } from "../services/ai.js";
import { scrapeProduct } from "../utils/scrape.js";
import ProductSummary from "../models/ProductSummary.js";
import ProductComparison from "../models/ProductComparison.js";
import maybeAuth from "../middleware/maybeAuth.js";
import auth from "../middleware/auth.js";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const mockData = require("../data/mockProducts.json");

const router = Router();

// Test route
router.get("/ping", (_req, res) => {
  res.json({ ok: true, route: "products" });
});

// Normalize input
async function normalizeInput(input) {
  if (input.url) {
    const scraped = await scrapeProduct(input.url);
    return { ...scraped, ...input, sourceUrl: input.url };
  }
  return {
    title: input.title || "Product",
    description: input.description || "",
    price: input.price || null,
    features: input.features || [],
    specs: input.specs || {},
    sourceUrl: input.url || null,
  };
}

//summarize
router.post("/summarize", maybeAuth, async (req, res) => {
  try {
    const normalized = await normalizeInput(req.body || {});
    const bullets = await summarizeProduct(normalized);

    // Avoid duplicates
    let doc = await ProductSummary.findOne({
      user: req.user?.id || null,
      "input.title": normalized.title,
      "input.description": normalized.description,
    });

    if (!doc) {
      doc = await ProductSummary.create({
        user: req.user?.id || null,
        input: normalized,
        bullets,
      });
    }

    res.json({ id: doc._id, product: normalized, bullets });
  } catch (err) {
    console.error("Summarize error:", err);
    res.status(500).json({ message: err.message });
  }
});

// compare
router.post("/compare", maybeAuth, async (req, res) => {
  try {
    const items = Array.isArray(req.body?.items) ? req.body.items : [];
    if (items.length < 2)
      return res.status(400).json({ message: "Need at least two products" });

    const normalized = await Promise.all(items.map(normalizeInput));
    const result = await compareProducts(normalized, req.body.criteria || {});

    // Avoid duplicates by checking titles + criteria
    const titles = normalized.map((p) => p.title);
    let doc = await ProductComparison.findOne({
      user: req.user?.id || null,
      "inputs.title": { $all: titles },
      criteria: req.body.criteria || {},
    });

    if (!doc) {
      doc = await ProductComparison.create({
        user: req.user?.id || null,
        inputs: normalized,
        criteria: req.body.criteria || {},
        compared: result.compared,
        summary: result.summary,
      });
    }

    res.json({ id: doc._id, ...result });
  } catch (err) {
    console.error("Compare error:", err.message);
    res.status(500).json({ message: "Failed to compare products" });
  }
});

// suggest best product
router.post("/suggest", maybeAuth, async (req, res) => {
  try {
    const items = Array.isArray(req.body?.items) ? req.body.items : [];
    if (items.length < 1)
      return res.status(400).json({ message: "Provide at least one product" });

    const normalized = await Promise.all(items.map(normalizeInput));
    const result = await compareProducts(normalized, req.body.criteria || {});

    // Avoid duplicates
    const titles = normalized.map((p) => p.title);
    let doc = await ProductComparison.findOne({
      user: req.user?.id || null,
      "inputs.title": { $all: titles },
      criteria: req.body.criteria || {},
    });

    if (!doc) {
      doc = await ProductComparison.create({
        user: req.user?.id || null,
        inputs: normalized,
        criteria: req.body.criteria || {},
        compared: result.compared,
        summary: result.summary,
      });
    }

    res.json({
      id: doc._id,
      best: result.summary.best,
      compared: result.compared,
    });
  } catch (err) {
    console.error("Suggest error:", err.message);
    res.status(500).json({ message: "Failed to suggest product" });
  }
});

// mock data
router.get("/mock", (_req, res) => {
  res.json({ products: mockData });
});

//history
router.get("/history/summaries", auth, async (req, res) => {
  try {
    const items = await ProductSummary.find({ user: req.user.id }).sort({
      createdAt: -1,
    });
    res.json({ items });
  } catch {
    res.status(500).json({ message: "Failed to load summaries" });
  }
});

router.get("/history/comparisons", auth, async (req, res) => {
  try {
    const items = await ProductComparison.find({ user: req.user.id }).sort({
      createdAt: -1,
    });
    res.json({ items });
  } catch {
    res.status(500).json({ message: "Failed to load comparisons" });
  }
});

export default router;
