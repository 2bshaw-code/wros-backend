const Product = require("../models/Product");
const Order = require("../models/Order");
const Customer = require("../models/Customer");

const normalizeText = (value = "") => String(value).trim();

const recognizeProduct = async ({ image, payload = {} }) => {
  const name = payload.name || "AI Recognized Product";
  const price = Number(payload.price || 0);
  const category = payload.category || "General";
  const description = payload.description || `AI generated description for ${name}`;

  if (payload.autoCreate !== false) {
    const existing = await Product.findOne({ name: new RegExp(`^${name}$`, "i") });
    if (!existing) {
      const created = await Product.create({
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

const scanShelf = async ({ image, payload = {} }) => {
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

const generateReply = async ({ text = "", customerName = "Customer" }) => {
  const normalized = normalizeText(text).toLowerCase();

  let intent = "greeting";
  if (normalized.includes("price") || normalized.includes("product") || normalized.includes("catalog")) intent = "product query";
  if (normalized.includes("order") || normalized.includes("buy") || normalized.includes("purchase")) intent = "order request";
  if (normalized.includes("complaint") || normalized.includes("issue") || normalized.includes("problem")) intent = "complaint";

  const products = await Product.find({}).limit(5).sort({ createdAt: -1 });
  const productText = products.length ? `We have ${products.map((p) => p.name).join(", ")}.` : "We have a range of products available.";

  const replies = {
    greeting: `Hello ${customerName}! Thanks for contacting WROS. ${productText}`,
    "product query": `Here are some available products: ${productText}`,
    "order request": "I can help with your order. Please share the product and quantity you want, and I’ll guide you through it.",
    complaint: "I’m sorry you’re having an issue. Please share the problem details so I can help resolve it quickly.",
  };

  return {
    intent,
    reply: replies[intent] || "Thanks for your message. We’re here to help.",
  };
};

const createOrderFromMessage = async ({ text = "" }) => {
  const normalized = normalizeText(text);
  const match = normalized.match(/(\d+)\s*(?:of\s*)?(.+)/i);
  const productName = match ? match[2].trim() : "General Item";
  const quantity = Number((normalized.match(/(\d+)/) || [])[1] || 1);

  const product = await Product.findOne({ name: new RegExp(productName, "i") });
  if (!product) {
    throw new Error("Product not found for order creation");
  }

  const order = await Order.create({
    customerId: null,
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

const getAnalyticsOverview = async () => {
  const [products, orders, customers] = await Promise.all([
    Product.find({}).sort({ stock: 1 }).limit(10),
    Order.find({}).sort({ createdAt: -1 }).limit(20),
    Customer.find({}).limit(20),
  ]);

  const bestSellingProducts = await Product.find({}).sort({ stock: 1 }).limit(5);
  const lowStockAlerts = products.filter((item) => item.stock < 10);
  const revenue = orders.reduce((sum, order) => sum + (Number(order.total) || 0), 0);

  return {
    bestSellingProducts,
    lowStockAlerts,
    customerFrequency: customers.length,
    revenueProjections: revenue * 1.2,
    orderTrends: {
      totalOrders: orders.length,
      revenue,
    },
  };
};

module.exports = {
  recognizeProduct,
  scanShelf,
  generateReply,
  createOrderFromMessage,
  translateText,
  getAnalyticsOverview,
};
