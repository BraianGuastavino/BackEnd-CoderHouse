import express from 'express';
import fs from 'fs';

const app = express();
const PORT = 8080;
const productsPath = 'products.json';
const cartsPath = 'carts.json';

app.use(express.json());

// Carga productos desde JSON
function loadProducts() {
  try {
    const data = fs.readFileSync(productsPath, 'utf8');
    return JSON.parse(data) || [];
  } catch (error) {
    return [];
  }
}

// Cargar carrito desde JSON
function loadCarts() {
  try {
    const data = fs.readFileSync(cartsPath, 'utf8');
    return JSON.parse(data) || [];
  } catch (error) {
    return [];
  }
}

// Rutas para productos
const productsRouter = express.Router();

// Listar todos los productos
productsRouter.get('/', (req, res) => {
  const { limit } = req.query;
  const products = loadProducts();

  if (limit) {
    res.json(products.slice(0, parseInt(limit)));
  } else {
    res.json(products);
  }
});

// Traer un producto por ID
productsRouter.get('/:pid', (req, res) => {
  const { pid } = req.params;
  const products = loadProducts();
  const product = products.find((p) => p.id === pid);

  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ error: 'Producto no encontrado' });
  }
});

// Agregar un nuevo producto
productsRouter.post('/', (req, res) => {
  const { title, description, code, price, stock, category, thumbnails } = req.body;
  if (!title || !description || !code || !price || !stock || !category) {
    res.status(400).json({ error: 'Todos los campos son obligatorios' });
    return;
  }

  const products = loadProducts();

  // Generar un ID único
  const id = Date.now().toString();

  const newProduct = {
    id,
    title,
    description,
    code,
    price,
    status: true,
    stock,
    category,
    thumbnails,
  };

  products.push(newProduct);
  fs.writeFileSync(productsPath, JSON.stringify(products, null, 2));

  res.status(201).json(newProduct);
});

// Actualizar un producto por ID
productsRouter.put('/:pid', (req, res) => {
  const { pid } = req.params;
  const updatedProductData = req.body;

  const products = loadProducts();
  const existingProductIndex = products.findIndex((p) => p.id === pid);

  if (existingProductIndex === -1) {
    res.status(404).json({ error: 'Producto no encontrado' });
  } else {
    updatedProductData.id = pid;
    products[existingProductIndex] = updatedProductData;

    fs.writeFileSync(productsPath, JSON.stringify(products, null, 2));
    res.json(updatedProductData);
  }
});

// Eliminar un producto por ID
productsRouter.delete('/:pid', (req, res) => {
  const { pid } = req.params;

  const products = loadProducts();
  const updatedProducts = products.filter((p) => p.id !== pid);

  if (products.length === updatedProducts.length) {
    res.status(404).json({ error: 'Producto no encontrado' });
  } else {
    fs.writeFileSync(productsPath, JSON.stringify(updatedProducts, null, 2));
    res.json({ message: 'Producto eliminado correctamente' });
  }
});

app.use('/api/products', productsRouter);

// Rutas para carritos
const cartsRouter = express.Router();

// Crear un nuevo carrito
cartsRouter.post('/', (req, res) => {
  const carts = loadCarts();

  const id = Date.now().toString();

  const newCart = {
    id,
    products: [],
  };

  carts.push(newCart);
  fs.writeFileSync(cartsPath, JSON.stringify(carts, null, 2));

  res.status(201).json(newCart);
});

// Listar productos de un carrito por ID de carrito
cartsRouter.get('/:cid', (req, res) => {
  const { cid } = req.params;
  const carts = loadCarts();
  const cart = carts.find((c) => c.id === cid);

  if (cart) {
    res.json(cart.products);
  } else {
    res.status(404).json({ error: 'Carrito no encontrado' });
  }
});

// Agregar un producto a un carrito
cartsRouter.post('/:cid/product/:pid', (req, res) => {
  const { cid, pid } = req.params;
  const { quantity } = req.body;

  if (!quantity || isNaN(quantity) || quantity <= 0) {
    res.status(400).json({ error: 'La cantidad debe ser un número positivo' });
    return;
  }

  const carts = loadCarts();
  const cartIndex = carts.findIndex((c) => c.id === cid);

  if (cartIndex === -1) {
    res.status(404).json({ error: 'Carrito no encontrado' });
    return;
  }

  const products = loadProducts();
  const product = products.find((p) => p.id === pid);

  if (!product) {
    res.status(404).json({ error: 'Producto no encontrado' });
    return;
  }

  const cart = carts[cartIndex];
  const existingCartItemIndex = cart.products.findIndex((item) => item.product === pid);

  if (existingCartItemIndex === -1) {
    cart.products.push({ product: pid, quantity });
  } else {
    cart.products[existingCartItemIndex].quantity += quantity;
  }

  fs.writeFileSync(cartsPath, JSON.stringify(carts, null, 2));

  res.status(201).json(cart);
});

app.use('/api/carts', cartsRouter);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});


