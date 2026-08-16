const Product = require("../models/Product");
const Order = require("../models/Order");
const Customer = require("../models/Customer");

const normalizeText = (value = "") => String(value).trim();

const BOB_PERSONALITY = {
  systemPrompt: "You are BOB, WROS's friendly retail companion. Speak with a light, playful tone, gentle humour, and warm encouragement. Be imaginative, helpful, polite, and commercially useful without sounding robotic, technical, rigid, or overly formal. Keep replies concise and conversational, avoid heavy bold formatting, anticipate the next useful step, and offer a practical suggestion when it helps.",
  opener: "Here is the useful bit:",
  signoff: "A little nudge from BOB: keep the next step simple and timely.",
};

const withBobTone = (reply) => `${BOB_PERSONALITY.opener} ${reply} ${BOB_PERSONALITY.signoff}`;

const CLOUD_TASK_PATTERNS = [
  /\b(generate|create|produce|render|edit)\b.{0,40}\b(video|image|media|document|pdf|presentation)\b/i,
  /\b(advanced reasoning|deep analysis|multi[- ]step|workflow|automate|automation)\b/i,
  /\b(plan|execute|coordinate)\b.{0,40}\b(workflow|campaign|automation)\b/i,
];

const sanitizeContext = (context = {}) => {
  let pageUrl = "";
  try {
    const parsed = new URL(String(context.pageUrl || context.url || ""));
    pageUrl = `${parsed.origin}${parsed.pathname}`;
  } catch {
    pageUrl = String(context.pageUrl || context.url || "").split(/[?#]/)[0];
  }

  return {
    pageUrl: pageUrl.slice(0, 500),
    pageTitle: normalizeText(context.pageTitle).slice(0, 200),
    sectionHeading: normalizeText(context.sectionHeading).slice(0, 200),
    consoleType: normalizeText(context.consoleType).slice(0, 50),
    actionContext: normalizeText(context.actionContext).slice(0, 200),
  };
};

const requiresCloudEngine = (prompt, context = {}) => {
  const routingText = [prompt, context.actionContext, context.sectionHeading, context.pageTitle].filter(Boolean).join(" ");
  return CLOUD_TASK_PATTERNS.some((pattern) => pattern.test(routingText));
};

const redactSensitiveText = (value) => normalizeText(value)
  .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[email redacted]")
  .replace(/\+?\d[\d\s().-]{7,}\d/g, "[phone redacted]")
  .replace(/\b(?:bearer\s+)?[A-Za-z0-9_-]{24,}\b/gi, "[token redacted]");

const askCloudEngine = async ({ prompt, context }) => {
  const endpoint = normalizeText(process.env.BOB_CLOUD_URL);
  if (!endpoint) return null;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), Number(process.env.BOB_CLOUD_TIMEOUT_MS || 8000));

  try {
    const headers = { "Content-Type": "application/json" };
    if (process.env.BOB_CLOUD_API_KEY) headers.Authorization = `Bearer ${process.env.BOB_CLOUD_API_KEY}`;
    const response = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify({ prompt: redactSensitiveText(prompt), context, assistant: "BOB" }),
      signal: controller.signal,
    });
    if (!response.ok) return null;
    const body = await response.json();
    const reply = normalizeText(body.reply || body.response || body.data?.reply);
    return reply ? { reply: withBobTone(reply) } : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
};

const recognizeProduct = async ({ tenantId, image, payload = {} }) => {
  if (!tenantId) throw new Error("Tenant context is required");
  const name = payload.name || "AI Recognized Product";
  const price = Number(payload.price || 0);
  const category = payload.category || "General";
  const description = payload.description || `AI generated description for ${name}`;

  if (payload.autoCreate !== false) {
    const existing = await Product.findOne({ tenantId, name: new RegExp(`^${name}$`, "i") });
    if (!existing) {
      const created = await Product.create({
        tenantId,
        name,
        price,
        stock: payload.stock || 10,
        description,
        category,
        images: image ? [image] : [],
      });
      return {
        recognized: true,
        product: created,
        created: true,
      };
    }

    return {
      recognized: true,
      product: existing,
      created: false,
    };
  }

  return {
    recognized: true,
    product: { name, price, category, description },
    created: false,
  };
};

const scanShelf = async ({ tenantId, image, payload = {} }) => {
  if (!tenantId) throw new Error("Tenant context is required");
  const items = Array.isArray(payload.items) ? payload.items : [
    { name: "Shelf Product 1", price: 25, category: "General" },
    { name: "Shelf Product 2", price: 35, category: "General" },
  ];

  return {
    scanned: true,
    image,
    products: items.map((item, index) => ({
      id: index + 1,
      name: item.name,
      price: Number(item.price || 0),
      category: item.category || "General",
    })),
  };
};

const generateReply = async ({ tenantId, operatorId, text = "", customerName = "Customer" }) => {
  if (!tenantId) throw new Error("Tenant context is required");
  const normalized = normalizeText(text).toLowerCase();

  let intent = "greeting";
  if (normalized.includes("price") || normalized.includes("product") || normalized.includes("catalog")) intent = "product query";
  if (normalized.includes("order") || normalized.includes("buy") || normalized.includes("purchase")) intent = "order request";
  if (normalized.includes("complaint") || normalized.includes("issue") || normalized.includes("problem")) intent = "complaint";

  const products = await Product.find({ tenantId }).limit(5).sort({ createdAt: -1 });
  const productText = products.length ? `We have ${products.map((p) => p.name).join(", ")}.` : "We have a range of products available.";

  const replies = {
    greeting: `Hello ${customerName}! Thanks for contacting WROS. ${productText}`,
    "product query": `Here are some available products: ${productText}`,
    "order request": "I can help with your order. Please share the product and quantity you want, and I’ll guide you through it.",
    complaint: "I’m sorry you’re having an issue. Please share the problem details so I can help resolve it quickly.",
  };

  return {
    intent,
    tenantId,
    operatorId,
    reply: replies[intent] || "Thanks for your message. We’re here to help.",
  };
};

const createOrderFromMessage = async ({ tenantId, customerId, text = "" }) => {
  if (!tenantId) throw new Error("Tenant context is required");
  if (!customerId) throw new Error("customerId is required for AI order creation");
  const normalized = normalizeText(text);
  const match = normalized.match(/(\d+)\s*(?:of\s*)?(.+)/i);
  const productName = match ? match[2].trim() : "General Item";
  const quantity = Number((normalized.match(/(\d+)/) || [])[1] || 1);

  const product = await Product.findOne({ tenantId, name: new RegExp(productName, "i") });
  if (!product) {
    throw new Error("Product not found for order creation");
  }

  const order = await Order.create({
    tenantId,
    customerId,
    items: [{ productId: product._id, quantity }],
    total: product.price * quantity,
    status: "pending",
  });

  return {
    order,
    parsed: {
      product: product.name,
      quantity,
      total: order.total,
    },
  };
};

const translateText = async ({ text = "", targetLanguage = "en" }) => {
  const lookup = {
    en: "English",
    fr: "French",
    es: "Spanish",
    ar: "Arabic",
  };

  return {
    original: text,
    targetLanguage: lookup[targetLanguage] || targetLanguage,
    translated: `Translated to ${lookup[targetLanguage] || targetLanguage}: ${text}`,
  };
};

const getAnalyticsOverview = async (tenantId) => {
  if (!tenantId) throw new Error("Tenant context is required");
  const [products, orders, customers] = await Promise.all([
    Product.find({ tenantId }).sort({ stock: 1 }).limit(10),
    Order.find({ tenantId }).sort({ createdAt: -1 }).limit(20),
    Customer.find({ tenantId }).limit(20),
  ]);

  const bestSellingProducts = await Product.find({ tenantId }).sort({ stock: 1 }).limit(5);
  const lowStockAlerts = products.filter((item) => item.stock < 10);
  const revenue = orders.reduce((sum, order) => sum + (Number(order.total) || 0), 0);
  const inventoryInsights = await getInventoryInsights(tenantId);
  const inventoryReport = await generateInventoryReport(tenantId);

  return {
    bestSellingProducts,
    lowStockAlerts,
    customerFrequency: customers.length,
    revenueProjections: revenue * 1.2,
    orderTrends: {
      totalOrders: orders.length,
      revenue,
    },
    inventoryInsights,
    inventoryReport,
    premiumFeatureGate: {
      tier: "growth",
      advancedInventory: true,
      aiReplies: true,
      billingAware: true,
    },
  };
};

const generateInventoryReport = async (tenantId) => {
  const insights = await getInventoryInsights(tenantId);
  const summary = {
    generatedAt: new Date().toISOString(),
    lowStockCount: insights.lowStockPredictions.length,
    overstockCount: insights.overstockAlerts.length,
    slowMovingCount: insights.slowMovingProducts.length,
    alertCount: insights.trendAlerts.length,
    actionRequired: insights.lowStockPredictions.length > 0 || insights.overstockAlerts.length > 0,
  };

  return {
    ...summary,
    headline: summary.actionRequired
      ? "Inventory attention required: low stock and slow-moving products detected."
      : "Inventory is stable and reorder activity remains within target thresholds.",
    recommendedActions: [
      "Review low-stock items before the next sales cycle.",
      "Assess overstock conditions and discount slow movers.",
      "Confirm reorder suggestions for fast-moving SKUs.",
    ],
  };
};

// Heuristic inventory insights: no external ML, computed from recent order velocity.
const getInventoryInsights = async (tenantId) => {
  if (!tenantId) throw new Error("Tenant context is required");
  const RECENT_ORDER_LIMIT = 100;
  const DAYS_TRACKED = 30;

  const [allProducts, recentOrders] = await Promise.all([
    Product.find({ tenantId }),
    Order.find({ tenantId }).sort({ createdAt: -1 }).limit(RECENT_ORDER_LIMIT).populate("items.productId"),
  ]);

  const midpoint = new Date(Date.now() - (DAYS_TRACKED / 2) * 86400000);
  const unitsSold = {};
  const recentHalfUnits = {};
  const olderHalfUnits = {};

  recentOrders.forEach((order) => {
    order.items.forEach((item) => {
      const productId = item.productId?._id ? String(item.productId._id) : String(item.productId);
      const quantity = item.quantity || 0;
      unitsSold[productId] = (unitsSold[productId] || 0) + quantity;

      if (order.createdAt >= midpoint) {
        recentHalfUnits[productId] = (recentHalfUnits[productId] || 0) + quantity;
      } else {
        olderHalfUnits[productId] = (olderHalfUnits[productId] || 0) + quantity;
      }
    });
  });

  const lowStockPredictions = [];
  const overstockAlerts = [];
  const slowMovingProducts = [];
  const reorderSuggestions = [];
  const trendAlerts = [];

  allProducts.forEach((product) => {
    const id = String(product._id);
    const sold = unitsSold[id] || 0;
    const dailyRate = sold / DAYS_TRACKED;
    const daysUntilStockout = dailyRate > 0 ? Math.round(product.stock / dailyRate) : null;

    if (daysUntilStockout !== null && daysUntilStockout <= 14) {
      lowStockPredictions.push({ productId: id, name: product.name, stock: product.stock, daysUntilStockout });

      const recommendedQuantity = Math.max(Math.ceil(dailyRate * DAYS_TRACKED - product.stock), 1);
      reorderSuggestions.push({ productId: id, name: product.name, stock: product.stock, recommendedQuantity });
    }

    if (sold === 0 && product.stock > 0) {
      slowMovingProducts.push({ productId: id, name: product.name, stock: product.stock });

      if (product.stock > 50) {
        overstockAlerts.push({ productId: id, name: product.name, stock: product.stock });
      }
    }

    const recent = recentHalfUnits[id] || 0;
    const older = olderHalfUnits[id] || 0;

    if (recent > older * 2 && recent >= 3) {
      trendAlerts.push({ productId: id, name: product.name, trend: "up", recentUnits: recent, priorUnits: older });
    } else if (older > recent * 2 && older >= 3) {
      trendAlerts.push({ productId: id, name: product.name, trend: "down", recentUnits: recent, priorUnits: older });
    }
  });

  return {
    lowStockPredictions,
    overstockAlerts,
    slowMovingProducts,
    reorderSuggestions,
    trendAlerts,
  };
};

const askLocalBob = async ({ prompt = "", userId = "", tenantId, operatorId, context = {} }) => {
  const normalized = normalizeText(prompt);
  if (!normalized) {
    throw new Error("A prompt is required");
  }

  const intent = normalized.toLowerCase();
  const pageContext = sanitizeContext(context);

  if (/^(hi|hello|hey|good morning|good afternoon|good evening)\b/i.test(normalized)) {
    return { reply: withBobTone(`Hello! I can help with ${pageContext.sectionHeading || pageContext.pageTitle || "WROS"}, navigation, documentation, support, legal guidance, and everyday console questions.`) };
  }

  if (/\b(where|navigate|navigation|open|find|go to)\b/i.test(normalized)) {
    return { reply: withBobTone(`You are in ${pageContext.sectionHeading || pageContext.pageTitle || "WROS"}. Use the visible navigation to move between the dashboard, catalog, orders, customers, messages, settings, and available founder tools.`) };
  }

  if (/\b(docs?|documentation|support|help article|legal|privacy|cookie|terms|gdpr|compliance)\b/i.test(normalized)) {
    return { reply: withBobTone(`I can explain the current ${pageContext.sectionHeading || pageContext.pageTitle || "WROS"} information and help you identify the next relevant action without retaining personal data.`) };
  }

  if (/\b(wros|operating system|console|owner|merchant|admin|founder)\b/i.test(normalized)) {
    return { reply: withBobTone(`This ${pageContext.consoleType || "WROS"} surface supports the tools available on the current page. Ask about the visible section or the action you want to complete.`) };
  }

  if (/\b(how do i|what can you do|guide me|explain this page)\b/i.test(normalized)) {
    return { reply: withBobTone(`I can guide you through ${pageContext.sectionHeading || pageContext.pageTitle || "this WROS page"} and explain the actions currently available.`) };
  }

  if (requiresCloudEngine(normalized, pageContext)) {
    return { reply: withBobTone("I can help structure that task now. Share the intended output, source material, constraints, and approval steps, and I will turn it into a clear, actionable workflow.") };
  }

  if (intent.includes("product description")) {
    const productName = normalized.replace(/.*product description(?: for)?/i, "").trim() || "this product";
    return { reply: withBobTone(`${productName} is a reliable retail choice, clearly presented with practical benefits and everyday value for customers.`) };
  }

  if (intent.includes("reorder")) {
    if (!tenantId) return { reply: withBobTone("Reorder insights require a merchant workspace. Open a merchant tenant before requesting catalog-specific recommendations.") };
    const insights = await getInventoryInsights(tenantId);
    const suggestions = insights.reorderSuggestions.slice(0, 5);
    return { reply: withBobTone(suggestions.length
      ? `Reorder soon: ${suggestions.map((item) => `${item.name} (${item.stock} left, add ${item.recommendedQuantity})`).join(", ")}.`
      : "No immediate reorder risks were detected in the current catalog.") };
  }

  if (intent.includes("sales") || intent.includes("summarise")) {
    if (!tenantId) return { reply: withBobTone("Sales insights require a merchant workspace. Open a merchant tenant before requesting transaction-specific analysis.") };
    const overview = await getAnalyticsOverview(tenantId);
    return { reply: withBobTone(`Sales summary: ${overview.orderTrends.totalOrders} recent orders with revenue of ${overview.orderTrends.revenue}. ${overview.inventoryReport.headline}`) };
  }

  if (intent.includes("whatsapp") || intent.includes("template")) {
    const scenario = intent.includes("confirmation") ? "confirmation" : intent.includes("follow-up") ? "follow-up" : "promo";
    const templates = {
      promo: "Hi {{name}}, we have a fresh offer selected for you. Reply YES and we will reserve it today.",
      "follow-up": "Hi {{name}}, just checking whether you still need help with your recent enquiry. We are ready when you are.",
      confirmation: "Thanks {{name}}. Your order is confirmed and we will send an update as soon as it is ready."
    };
    return { reply: withBobTone(`WhatsApp ${scenario} template: ${templates[scenario]}`) };
  }

  if (!tenantId) return { reply: withBobTone(`I can help with ${pageContext.sectionHeading || pageContext.pageTitle || "Founder OS"}, system operations, Found IT, navigation, documentation, and control-plane workflows.`) };
  const generated = await generateReply({ tenantId, operatorId, text: normalized, customerName: userId || "Operator" });
  return { reply: withBobTone(generated.reply), tenantId, operatorId };
};

const askBob = async (input = {}) => {
  const prompt = normalizeText(input.prompt);
  if (!prompt) throw new Error("A prompt is required");
  const context = sanitizeContext(input.context);

  if (requiresCloudEngine(prompt, context)) {
    const cloudReply = await askCloudEngine({ prompt, context });
    if (cloudReply) return cloudReply;
  }

  return askLocalBob({ ...input, prompt, context });
};

module.exports = {
  recognizeProduct,
  scanShelf,
  generateReply,
  createOrderFromMessage,
  translateText,
  getAnalyticsOverview,
  generateInventoryReport,
  requiresCloudEngine,
  sanitizeContext,
  redactSensitiveText,
  askLocalBob,
  askBob,
};
