import express from 'express';
import Product from '../models/Product.js';

const router = express.Router();

// Seed sample products if empty
router.get('/seed', async (req, res) => {
  const count = await Product.countDocuments();
  if (count === 0) {
    await Product.insertMany([
      { name: 'Wireless Headphones', price: 99, description: 'High-quality noise canceling audio.', category: 'Electronics', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500' },
      { name: 'Smartwatch V2', price: 149, description: 'Track workouts and notifications seamlessly.', category: 'Electronics', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500' },
      { name: 'Leather Backpack', price: 79, description: 'Durable and stylish daily carry bag.', category: 'Fashion', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500' }
    ]);
    return res.json({ message: 'Sample products seeded' });
  }
  res.json({ message: 'Products already exist' });
});

// Get all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;