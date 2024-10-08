const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Hello World!');
});
const productsRouter = require('./routes/products');


app.use('/api', productsRouter);
app.use('/api', usersRouter);
app.use('/api', );

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
