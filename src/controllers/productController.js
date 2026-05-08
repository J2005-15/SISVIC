const { Product, Category } = require('../models');

// Obtener todos los productos
const getProducts = async (req, res, next) => {
  try {
    const products = await Product.findAll({
      include: [{
        model: Category,
        attributes: ['id', 'name']
      }],
      order: [['name', 'ASC']]
    });
    res.json({ products });
  } catch (error) {
    next(error);
  }
};

// Obtener un producto por ID
const getProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id, {
      include: [{
        model: Category,
        attributes: ['id', 'name']
      }]
    });
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    res.json({ product });
  } catch (error) {
    next(error);
  }
};

// Crear un nuevo producto
const createProduct = async (req, res, next) => {
  try {
    const { name, description, price, stock, categoryId } = req.body;
    const product = await Product.create({
      name,
      description,
      price,
      stock,
      categoryId
    });
    res.status(201).json({
      message: 'Producto creado exitosamente',
      product
    });
  } catch (error) {
    next(error);
  }
};

// Actualizar un producto
const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, price, stock, categoryId } = req.body;
    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    await product.update({ name, description, price, stock, categoryId });
    res.json({
      message: 'Producto actualizado exitosamente',
      product
    });
  } catch (error) {
    next(error);
  }
};

// Eliminar un producto
const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    await product.destroy();
    res.json({ message: 'Producto eliminado exitosamente' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct
};