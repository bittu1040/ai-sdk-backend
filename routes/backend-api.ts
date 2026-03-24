
import { Router } from 'express';
import axios from 'axios';
import { productsData } from '../data/products.js';

const router = Router();

// Simple API endpoints that our tools will call

router.get('/weather', (req, res) => {
  const { city } = req.query;
  // Mock weather data
  res.json({
    city: city || 'Unknown',
    temperature: 72,
    condition: 'Sunny',
    humidity: 65
  });
});

router.get('/time', (req, res) => {
  const { timezone } = req.query;
  res.json({
    timezone: timezone || 'UTC',
    currentTime: new Date().toISOString(),
    timestamp: Date.now()
  });
});

router.get('/user/:id', (req, res) => {
  const { id } = req.params;
  // Mock user data
  res.json({
    id,
    name: `User ${id}`,
    email: `user${id}@example.com`,
    status: 'active'
  });
});

// ------------------------------------------------------------------
// JSONPlaceholder Posts API
// ------------------------------------------------------------------

// Get all posts or filter by userId
router.get('/posts', async (req, res) => {
  try {
    const { userId } = req.query;
    const url = userId 
      ? `https://jsonplaceholder.typicode.com/posts?userId=${userId}`
      : 'https://jsonplaceholder.typicode.com/posts';
    
    const response = await axios.get(url);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to fetch posts',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get single post by ID
router.get('/posts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const response = await axios.get(`https://jsonplaceholder.typicode.com/posts/${id}`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to fetch post',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// ------------------------------------------------------------------
// Products API (Hardcoded data from JSON file)
// ------------------------------------------------------------------

// Get all products or filter by category
router.get('/products', (req, res) => {
  try {
    const { category, inStock } = req.query;
    let filteredProducts = productsData;

    // Filter by category if provided
    if (category) {
      filteredProducts = filteredProducts.filter(
        (p: any) => p.category.toLowerCase() === (category as string).toLowerCase()
      );
    }

    // Filter by stock status if provided
    if (inStock !== undefined) {
      const stockFilter = inStock === 'true';
      filteredProducts = filteredProducts.filter((p: any) => p.inStock === stockFilter);
    }

    res.json(filteredProducts);
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to fetch products',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get single product by ID
router.get('/products/:id', (req, res) => {
  try {
    const { id } = req.params;
    const product = productsData.find((p: any) => p.id === id);
    
    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    
    res.json(product);
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to fetch product',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;


