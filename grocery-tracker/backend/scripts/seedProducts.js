const mongoose = require('mongoose');
const Product = require('../models/Product');
require('dotenv').config();

const seedProducts = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/grocery-tracker');
        console.log('Connected to MongoDB for seeding...');

        // Clear existing products if needed (Optional: uncomment to clear)
        // await Product.deleteMany({});

        const categories = ['Fruits', 'Vegetables', 'Dairy', 'Bakery', 'Beverages', 'Snacks', 'Personal Care', 'Household'];
        const gstRates = [0, 5, 12, 18];
        const demoProducts = [];

        for (let i = 1; i <= 1050; i++) {
            const category = categories[Math.floor(Math.random() * categories.length)];
            const gstRate = gstRates[Math.floor(Math.random() * gstRates.length)];
            const price = parseFloat((Math.random() * (500 - 10) + 10).toFixed(2));
            const stock = Math.floor(Math.random() * 500) + 50;

            demoProducts.push({
                name: `Demo Product ${i} - ${category}`,
                category: category,
                price: price,
                gstRate: gstRate,
                stockQuantity: stock,
                barcode: `${100000000000 + i}`
            });
        }

        await Product.insertMany(demoProducts);
        console.log('Successfully seeded 1,000+ products!');
        process.exit();
    } catch (error) {
        console.error('Error seeding products:', error);
        process.exit(1);
    }
};

seedProducts();
