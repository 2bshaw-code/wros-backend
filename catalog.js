const productStore = new Map();
const tenantStores = new Map();

const getStore = (tenantId) => {
  if (!tenantId) return productStore;
  const key = String(tenantId);
  if (!tenantStores.has(key)) tenantStores.set(key, new Map());
  return tenantStores.get(key);
};

const seedCatalog = () => {
  const sampleProducts = [
    { id: 'p-1001', name: 'Classic Brew', category: 'Coffee', description: 'Smooth, balanced coffee for daily rituals.', price: 12.5 },
    { id: 'p-1002', name: 'Citrus Spark', category: 'Drinks', description: 'Light and refreshing citrus-based beverage.', price: 9.99 },
    { id: 'p-1003', name: 'Desk Lamp', category: 'Home', description: 'Modern desk lamp with adjustable lighting.', price: 49.0 },
    { id: 'p-1004', name: 'Trail Bottle', category: 'Accessories', description: 'Insulated bottle for work and travel.', price: 24.0 },
  ];

  for (const product of sampleProducts) {
    if (!productStore.has(product.id)) {
      productStore.set(product.id, { ...product, available: true });
    }
  }
};

seedCatalog();

function addProduct(id, product = {}, tenantId) {
  const productId = String(id || product.id || `p-${Date.now()}`);
  const nextProduct = {
    ...product,
    id: productId,
    name: product.name || 'Untitled Product',
    category: product.category || 'General',
    description: product.description || 'No description available.',
    price: Number(product.price || 0),
    available: product.available !== false,
  };
  getStore(tenantId).set(productId, nextProduct);
  return nextProduct;
}

function listProducts(tenantId) {
  return Array.from(getStore(tenantId).values()).map((product) => ({ ...product }));
}

function getProduct(id, tenantId) {
  const product = getStore(tenantId).get(String(id));
  return product ? { ...product } : null;
}

function searchProducts(keyword = '', tenantId) {
  const query = String(keyword || '').trim().toLowerCase();
  if (!query) return listProducts(tenantId);

  return listProducts(tenantId).filter((product) => {
    return [product.name, product.category, product.description].some((value) => String(value || '').toLowerCase().includes(query));
  });
}

module.exports = {
  productStore,
  addProduct,
  listProducts,
  getProduct,
  searchProducts,
};
