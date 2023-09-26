import express from 'express';
import fs from 'fs';

const app = express();
const PORT = 8080;
const productsPath = 'products.json';

app.use(express.json());

function loadProducts() {
  try {
    const data = fs.readFileSync(productsPath, 'utf8');
    return JSON.parse(data) || [];
  } catch (error) {
    return [];
  }
}

app.get('/products', (req, res) => {
  const { limit } = req.query;
  const products = loadProducts();
  
  if (limit) {
    res.json(products.slice(0, parseInt(limit)));
  } else {
    res.json(products);
  }
});

app.get('/products/:id', (req, res) => {
  const { id } = req.params;
  const products = loadProducts();
  const product = products.find((p) => p.id === id);

  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ error: 'Producto no encontrado' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});


