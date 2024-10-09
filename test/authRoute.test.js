const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../schemas/userSchema');
const authRoutes = require('../routes/authRoutes');

const app = express();
app.use(express.json());
app.use('/api', authRoutes);

const JWT_SECRET = 'your-secret-key';

beforeAll(async () => {
  await mongoose.connect('mongodb://localhost:27017/test-db', { useNewUrlParser: true, useUnifiedTopology: true });
});

afterAll(async () => {
  await mongoose.connection.close();
});

beforeEach(async () => {
  await User.deleteMany({});
});

describe('Authentication Routes', () => {
  describe('POST /api/user', () => {
    it('should create a new user', async () => {
      const res = await request(app)
        .post('/api/user')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('_id');
      expect(res.body.name).toBe('Test User');
      expect(res.body.email).toBe('test@example.com');
      expect(res.body).not.toHaveProperty('password');
    });

    it('should not create a user with an existing email', async () => {
      await User.create({
        name: 'Existing User',
        email: 'existing@example.com',
        password: 'password123'
      });

      const res = await request(app)
        .post('/api/user')
        .send({
          name: 'New User',
          email: 'existing@example.com',
          password: 'newpassword'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Existing email');
    });
  });

  describe('POST /api/login', () => {
    beforeAll(async () => {
      // Create a test user before running login tests
      await request(app)
        .post('/api/user')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123'
        });
    });

    it('should login a user with correct credentials', async () => {
      const res = await request(app)
        .post('/api/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      // Add more detailed error logging
      if (res.statusCode !== 200) {
        console.error('Login failed:', res.body);
      }

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');

      const decodedToken = jwt.verify(res.body.token, JWT_SECRET);
      expect(decodedToken._id).toBe(user._id.toString());
    });

    it('should not login with incorrect password', async () => {
      await User.create({
        name: 'Wrong Password User',
        email: 'wrong@example.com',
        password: await bcrypt.hash('correctpassword', 10)
      });

      const res = await request(app)
        .post('/api/login')
        .send({
          email: 'wrong@example.com',
          password: 'wrongpassword'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Invalid password or email');
    });
  });
});