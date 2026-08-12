const products = [
  { id: 1, name: "Wireless Headphones", price: 89.99, category: "Electronics" },
  { id: 2, name: "Running Shoes", price: 120.5, category: "Footwear" },
  { id: 3, name: "Coffee Grinder", price: 65.0, category: "Kitchen" },
];

const orders = [
  { id: "ORD-1001", customerId: 1, total: 89.99, status: "Paid" },
  { id: "ORD-1002", customerId: 2, total: 120.5, status: "Processing" },
  { id: "ORD-1003", customerId: 3, total: 65.0, status: "Shipped" },
];

const customers = [
  { id: 1, name: "Alice Johnson", email: "alice@example.com", city: "Nairobi" },
  { id: 2, name: "Ben Smith", email: "ben@example.com", city: "Mombasa" },
  { id: 3, name: "Carla Gomez", email: "carla@example.com", city: "Kisumu" },
];

module.exports = {
  products,
  orders,
  customers,
};
