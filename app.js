const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const connectDB = require('./db');
const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send('Hello World!');
});

// OpenAPI spekifikatsiyasini qo'shish
const swaggerOptions = {
    swaggerDefinition: {
      openapi: '3.0.0',
      info: {
        title: 'Test project',
            version: '1.0.0',
            description: 'Test project uchun API endpointlari',
        },
        servers: [
        {
          url: 'http://localhost:3000/api',
        },
      ],
    },
    apis: ['./openapi.yaml'], 
  };

  const swaggerDocs = swaggerJsDoc(swaggerOptions);
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));


const productsRouter = require('./routes/products');
const authRouter = require('./routes/authRoutes');
connectDB()
  .then(() => console.log('Connected to MongoDB'))
  .catch((e) => console.error('Error connecting to MongoDB:', e));
  const morgan = require('morgan');

app.use(morgan('dev'));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Serverda xatolik yuz berdi!');
});

app.use('/api', productsRouter);
app.use('/api', authRouter);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
