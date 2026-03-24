
import { z } from 'zod';
import axios from 'axios';
import { tool } from 'ai';

const PORT = process.env.PORT || 3001;
const baseURL = `http://localhost:${PORT}`;

// Define tools that AI can call with execute functions
export const tools = {
  getWeather: tool({
    description: 'Get current weather information for a city',
    inputSchema: z.object({
      city: z.string().describe('The city name to get weather for'),
    }),
    execute: async ({ city }: { city: string }) => {
      const res = await axios.get(`${baseURL}/api/weather`, {
        params: { city }
      });
      return res.data;
    },
  }),
  
  getCurrentTime: tool({
    description: 'Get current time for a timezone',
    inputSchema: z.object({
      timezone: z.string().optional().describe('Timezone (e.g., UTC, America/New_York)'),
    }),
    execute: async ({ timezone }: { timezone?: string }) => {
      const res = await axios.get(`${baseURL}/api/time`, {
        params: { timezone }
      });
      return res.data;
    },
  }),
  
  getUserInfo: tool({
    description: 'Get user information by user ID',
    inputSchema: z.object({
      userId: z.string().describe('The user ID to look up'),
    }),
    execute: async ({ userId }: { userId: string }) => {
      const res = await axios.get(`${baseURL}/api/user/${userId}`);
      return res.data;
    },
  }),
  
  getPosts: tool({
    description: 'Get blog posts from JSONPlaceholder. Can retrieve all posts or filter by user ID.',
    inputSchema: z.object({
      userId: z.string().optional().describe('Optional user ID to filter posts by specific user'),
    }),
    execute: async ({ userId }: { userId?: string }) => {
      const res = await axios.get(`${baseURL}/api/posts`, {
        params: userId ? { userId } : undefined
      });
      return res.data;
    },
  }),
  
  getPostById: tool({
    description: 'Get a specific blog post by its ID from JSONPlaceholder',
    inputSchema: z.object({
      postId: z.string().describe('The post ID to retrieve'),
    }),
    execute: async ({ postId }: { postId: string }) => {
      const res = await axios.get(`${baseURL}/api/posts/${postId}`);
      return res.data;
    },
  }),
  
  getProducts: tool({
    description: 'Get products catalog. Can filter by category (Electronics, Sports, Home & Kitchen, Accessories, Stationery) or stock availability.',
    inputSchema: z.object({
      category: z.string().optional().describe('Optional category to filter products (e.g., Electronics, Sports)'),
      inStock: z.string().optional().describe('Filter by stock status: "true" for in-stock only, "false" for out-of-stock'),
    }),
    execute: async ({ category, inStock }: { category?: string; inStock?: string }) => {
      const params: any = {};
      if (category) params.category = category;
      if (inStock) params.inStock = inStock;
      
      const res = await axios.get(`${baseURL}/api/products`, { params });
      return res.data;
    },
  }),
  
  getProductById: tool({
    description: 'Get detailed information about a specific product by its ID',
    inputSchema: z.object({
      productId: z.string().describe('The product ID to retrieve'),
    }),
    execute: async ({ productId }: { productId: string }) => {
      const res = await axios.get(`${baseURL}/api/products/${productId}`);
      return res.data;
    },
  }),
};

// Type for tool calls
export type ToolName = keyof typeof tools;

