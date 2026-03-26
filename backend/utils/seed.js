/**
 * seed.js — Populate the database with demo data for testing
 * Run: node utils/seed.js
 */
require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ DB Connected');
};

const User = require('../models/User');
const Product = require('../models/Product');

const seed = async () => {
  await connectDB();

  // Clear existing data
  await User.deleteMany({});
  await Product.deleteMany({});
  console.log('🗑️  Cleared existing data');

  // Create admin user
  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@store.com',
    password: 'admin123',
    role: 'admin',
    phone: '9876543210',
  });

  await User.create([
    { name: 'Ravi Cashier', email: 'staff@store.com', password: 'staff123', role: 'staff', phone: '9876543211', createdBy: admin._id },
    { name: 'Audit Manager', email: 'authority@store.com', password: 'auth123', role: 'authority', phone: '9876543212', createdBy: admin._id },
  ]);
  console.log('👥 Users created');

  // Create sample products
  const products = [
    { name: 'Tata Salt 1kg', category: 'Other', barcode: '8901234567890', mrp: 25, sellingPrice: 23, gstRate: 0, stock: 100, unit: 'pcs', createdBy: admin._id },
    { name: 'Amul Full Cream Milk 500ml', category: 'Dairy', barcode: '8901462100013', mrp: 30, sellingPrice: 30, gstRate: 5, stock: 50, unit: 'pcs', createdBy: admin._id },
    { name: 'Basmati Rice 5kg', category: 'Grains & Pulses', mrp: 450, sellingPrice: 420, gstRate: 5, stock: 30, unit: 'pcs', createdBy: admin._id },
    { name: 'Aashirvaad Atta 10kg', category: 'Grains & Pulses', mrp: 380, sellingPrice: 360, gstRate: 0, stock: 25, unit: 'pcs', createdBy: admin._id },
    { name: 'Fortune Sunflower Oil 1L', category: 'Oils & Ghee', barcode: '8901030859398', mrp: 155, sellingPrice: 148, gstRate: 5, stock: 40, unit: 'pcs', createdBy: admin._id },
    { name: 'Ariel Detergent 1kg', category: 'Cleaning', mrp: 290, sellingPrice: 275, gstRate: 18, stock: 20, unit: 'pcs', createdBy: admin._id },
    { name: 'Maggi Noodles 70g', category: 'Packaged Food', barcode: '8901058000534', mrp: 14, sellingPrice: 14, gstRate: 12, stock: 200, unit: 'pcs', createdBy: admin._id },
    { name: 'Bournvita 500g', category: 'Beverages', mrp: 290, sellingPrice: 280, gstRate: 18, stock: 15, unit: 'pcs', createdBy: admin._id },
    { name: 'Dettol Soap 75g', category: 'Personal Care', mrp: 45, sellingPrice: 42, gstRate: 18, stock: 60, unit: 'pcs', createdBy: admin._id },
    { name: 'MDH Garam Masala 100g', category: 'Spices', mrp: 95, sellingPrice: 90, gstRate: 5, stock: 8, lowStockThreshold: 10, unit: 'pcs', createdBy: admin._id },
    { name: 'Parle-G Biscuits 100g', category: 'Snacks', barcode: '8901719112012', mrp: 10, sellingPrice: 10, gstRate: 12, stock: 150, unit: 'pcs', createdBy: admin._id },
    { name: 'Toor Dal 1kg', category: 'Grains & Pulses', mrp: 160, sellingPrice: 152, gstRate: 0, stock: 5, lowStockThreshold: 10, unit: 'pcs', createdBy: admin._id },
  ];

  await Product.insertMany(products);
  console.log(`📦 ${products.length} products created`);

  console.log('\n✅ Seed complete!');
  console.log('📧 Admin:     admin@store.com     / admin123');
  console.log('📧 Staff:     staff@store.com     / staff123');
  console.log('📧 Authority: authority@store.com / auth123');

  process.exit(0);
};

seed().catch(err => { console.error(err); process.exit(1); });
