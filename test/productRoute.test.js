const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Product = require('../schemas/productSchema');
const productRoutes = require('../routes/products');

const app = express();
app.use(express.json());
app.use('/api/products', productRoutes);

const JWT_SECRET = 'your-secret-key';

beforeAll(async () => {
  await mongoose.connect('mongodb://localhost:27017/test-db', { useNewUrlParser: true, useUnifiedTopology: true });
});

afterAll(async () => {
  await mongoose.connection.close();
});

beforeEach(async () => {
  await Product.deleteMany({});
});

describe('Product Routes', () => {
  describe('GET /api/products', () => {
    it('should return all products', async () => {
      await Product.create([
        { name: 'Product 1', price: 10, description: 'Description 1' },
        { name: 'Product 2', price: 20, description: 'Description 2' }
      ]);

      const res = await request(app).get('/api/products');

      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body[0]).toHaveProperty('name', 'Product 1');
      expect(res.body[1]).toHaveProperty('name', 'Product 2');
    });
  });

  describe('POST /api/products', () => {
    it('should create a new product when authenticated', async () => {
      const token = jwt.sign({ _id: 'user123', role: 'admin' }, JWT_SECRET);

      const res = await request(app)
        .post('/api/products')
        .set('Authorization', token)
        .send({
          name: 'New Product',
          price: 15,
          description: 'New Description'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('_id');
      expect(res.body.name).toBe('New Product');
      expect(res.body.price).toBe(15);
      expect(res.body.description).toBe('New Description');
    });

    it('should not create a product without authentication', async () => {
      const res = await request(app)
        .post('/api/products')
        .send({
          name: 'Unauthorized Product',
          price: 25,
          description: 'Unauthorized Description'
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe('Token not found');
    });
  });

  describe('PUT /api/products/:id', () => {
    it('should update an existing product when authenticated', async () => {
      const product = await Product.create({
        name: 'Old Product',
        price: 30,
        description: 'Old Description'
      });

      const token = jwt.sign({ _id: 'user123', role: 'admin' }, JWT_SECRET);

      const res = await request(app)
        .put(`/api/products/${product._id}`)
        .set('Authorization', token)
        .send({
          name: 'Updated Product',
          price: 35,
          description: 'Updated Description'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.name).toBe('Updated Product');
      expect(res.body.price).toBe(35);
      expect(res.body.description).toBe('Updated Description');
    });
  });

  describe('DELETE /api/products/:id', () => {
    it('should delete an existing product when authenticated', async () => {
      const product = await Product.create({
        name: 'Product to Delete',
        price: 40,
        description: 'Delete me'
      });

      const token = jwt.sign({ _id: 'user123', role: 'admin' }, JWT_SECRET);

      const res = await request(app)
        .delete(`/api/products/${product._id}`)
        .set('Authorization', token);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Product deleted');

      const deletedProduct = await Product.findById(product._id);
      expect(deletedProduct).toBeNull();
    });
  });
});