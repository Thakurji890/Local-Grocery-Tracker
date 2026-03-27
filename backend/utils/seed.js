/**
 * seed.js — Full product catalog seed for Kirana Bill Tracker
 * 100+ real Indian grocery products across all categories
 * Run from backend/: node utils/seed.js
 * Run from Docker:   docker exec grocery_backend node utils/seed.js
 */
require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const mongoose = require("mongoose");

const connectDB = async () => {
  const uri =
    process.env.MONGO_URI || "mongodb://localhost:27017/grocery_tracker";
  await mongoose.connect(uri);
  console.log("✅ MongoDB Connected");
};

const User = require("../models/User");
const Product = require("../models/Product");

/* ─────────────────────────────────────────────────────────────
   HELPER  p(name, cat, barcode, mrp, sell, gst, stock, unit, thresh)
   barcode  — pass null if none
   thresh   — low-stock alert threshold (default 10)
───────────────────────────────────────────────────────────── */
const p = (
  name,
  cat,
  barcode,
  mrp,
  sell,
  gst,
  stock,
  unit = "pcs",
  thresh = 10,
) => ({
  name,
  category: cat,
  barcode: barcode || undefined,
  mrp,
  sellingPrice: sell,
  gstRate: gst,
  stock,
  unit,
  lowStockThreshold: thresh,
  priceIncludesGst: true,
});

/* ─────────────────────────────────────────────────────────────
   ALL PRODUCTS  (113 items)
───────────────────────────────────────────────────────────── */
const PRODUCTS = [
  // ══ GRAINS & PULSES ══
  p(
    "India Gate Basmati Rice 5kg",
    "Grains & Pulses",
    "8901234500001",
    480,
    455,
    5,
    40,
  ),
  p(
    "Daawat Extra Long Basmati 1kg",
    "Grains & Pulses",
    "8901234500002",
    110,
    105,
    5,
    60,
  ),
  p(
    "Aashirvaad Atta 10kg",
    "Grains & Pulses",
    "8901234500003",
    385,
    365,
    0,
    30,
  ),
  p("Pillsbury Maida 1kg", "Grains & Pulses", "8901234500004", 55, 52, 0, 50),
  p(
    "Tata Sampann Besan 1kg",
    "Grains & Pulses",
    "8901234500005",
    90,
    86,
    0,
    45,
  ),
  p(
    "Fortune Sooji/Rava 1kg",
    "Grains & Pulses",
    "8901234500006",
    50,
    47,
    0,
    40,
  ),
  p(
    "Tata Sampann Toor Dal 1kg",
    "Grains & Pulses",
    "8901234500007",
    165,
    158,
    0,
    35,
  ),
  p(
    "Tata Sampann Chana Dal 1kg",
    "Grains & Pulses",
    "8901234500008",
    140,
    134,
    0,
    35,
  ),
  p(
    "Tata Sampann Moong Dal 1kg",
    "Grains & Pulses",
    "8901234500009",
    155,
    148,
    0,
    30,
  ),
  p(
    "Tata Sampann Masoor Dal 1kg",
    "Grains & Pulses",
    "8901234500010",
    130,
    124,
    0,
    30,
  ),
  p("Rajma Chitra 500g", "Grains & Pulses", null, 90, 85, 0, 25),
  p("Kabuli Chana 500g", "Grains & Pulses", null, 80, 76, 0, 25),
  p("Broken Wheat / Dalia 500g", "Grains & Pulses", null, 55, 52, 0, 20),
  p("Poha (Flattened Rice) 1kg", "Grains & Pulses", null, 75, 72, 0, 30),

  // ══ DAIRY ══
  p(
    "Amul Full Cream Milk 500ml",
    "Dairy",
    "8901462100001",
    32,
    32,
    5,
    100,
    "pcs",
    20,
  ),
  p("Amul Taaza Milk 1L", "Dairy", "8901462100002", 58, 58, 5, 80, "pcs", 20),
  p(
    "Mother Dairy Milk 500ml",
    "Dairy",
    "8901462100003",
    30,
    30,
    5,
    60,
    "pcs",
    15,
  ),
  p("Amul Butter 500g", "Dairy", "8901462100004", 275, 265, 12, 40),
  p("Amul Cheese Slices 200g", "Dairy", "8901462100005", 145, 138, 12, 30),
  p("Nestlé Milkmaid 400g", "Dairy", "8901462100006", 148, 142, 12, 25),
  p("Amul Dahi 400g", "Dairy", "8901462100007", 75, 72, 5, 50),
  p("Mother Dairy Mishti Doi 100g", "Dairy", "8901462100008", 30, 28, 5, 30),
  p("Amul Ice Cream Vanilla 500ml", "Dairy", "8901462100009", 190, 180, 18, 20),
  p("Amul Ghee 500ml", "Dairy", "8901462100010", 325, 310, 5, 25),
  p("Amul Paneer 200g", "Dairy", "8901462100011", 100, 96, 5, 35),
  p("Go Cheese Cheddar 200g", "Dairy", "8901462100012", 130, 124, 12, 20),

  // ══ OILS & GHEE ══
  p(
    "Fortune Sunflower Oil 1L",
    "Oils & Ghee",
    "8901030001001",
    165,
    158,
    5,
    50,
  ),
  p("Saffola Gold Oil 1L", "Oils & Ghee", "8901030001002", 200, 192, 5, 40),
  p(
    "Patanjali Mustard Oil 1L",
    "Oils & Ghee",
    "8901030001003",
    180,
    172,
    5,
    35,
  ),
  p(
    "Dhara Refined Soyabean Oil 5L",
    "Oils & Ghee",
    "8901030001004",
    720,
    690,
    5,
    20,
  ),
  p(
    "Coconut Oil Parachute 500ml",
    "Oils & Ghee",
    "8901030001005",
    200,
    190,
    18,
    30,
  ),
  p("Patanjali Cow Ghee 1kg", "Oils & Ghee", "8901030001006", 620, 595, 5, 15),
  p(
    "Dalda Vanaspati Ghee 1kg",
    "Oils & Ghee",
    "8901030001007",
    295,
    282,
    12,
    20,
  ),

  // ══ SPICES ══
  p("MDH Garam Masala 100g", "Spices", "8902080001001", 98, 93, 5, 50),
  p("MDH Chana Masala 100g", "Spices", "8902080001002", 90, 86, 5, 45),
  p("Everest Rajma Masala 100g", "Spices", "8902080001003", 85, 81, 5, 45),
  p("Everest Chicken Masala 50g", "Spices", "8902080001004", 50, 48, 5, 40),
  p("Tata Red Chilli Powder 200g", "Spices", "8902080001005", 80, 76, 5, 55),
  p("Tata Turmeric Powder 200g", "Spices", "8902080001006", 72, 68, 5, 55),
  p("Tata Coriander Powder 200g", "Spices", "8902080001007", 60, 57, 5, 50),
  p("Shan Biryani Masala 65g", "Spices", "8902080001008", 85, 81, 5, 30),
  p("Kitchen King Masala MDH 100g", "Spices", "8902080001009", 92, 88, 5, 35),
  p("Jeera (Cumin Seeds) 100g", "Spices", null, 60, 57, 5, 40),
  p("Mustard Seeds 100g", "Spices", null, 30, 28, 5, 40),
  p("Black Pepper Powder 50g", "Spices", null, 65, 62, 5, 30),
  p("Cardamom 50g", "Spices", null, 135, 128, 5, 20),
  p("Cloves 50g", "Spices", null, 80, 76, 5, 20),
  p("Bay Leaves 20g", "Spices", null, 25, 23, 5, 30),

  // ══ BEVERAGES ══
  p("Tata Tea Premium 500g", "Beverages", "8901234600001", 235, 225, 18, 40),
  p("Red Label Tea 500g", "Beverages", "8901234600002", 260, 250, 18, 35),
  p("Bru Instant Coffee 200g", "Beverages", "8901234600003", 250, 240, 18, 30),
  p("Nescafé Classic 200g", "Beverages", "8901234600004", 340, 325, 18, 25),
  p("Horlicks Original 500g", "Beverages", "8901234600005", 310, 298, 18, 20),
  p("Bournvita 500g", "Beverages", "8901234600006", 295, 283, 18, 25),
  p("Complan Chocolate 200g", "Beverages", "8901234600007", 230, 220, 18, 20),
  p("Real Fruit Power Orange 1L", "Beverages", "8901234600008", 99, 95, 12, 30),
  p("Tropicana Apple Juice 1L", "Beverages", "8901234600009", 110, 105, 12, 25),
  p("Paper Boat Aam Panna 250ml", "Beverages", "8901234600010", 25, 24, 12, 60),
  p(
    "Minute Maid Pulpy Orange 400ml",
    "Beverages",
    "8901234600011",
    40,
    38,
    12,
    40,
  ),
  p("Coca-Cola 600ml PET", "Beverages", "8901234600012", 45, 45, 12, 80),
  p("Pepsi 600ml PET", "Beverages", "8901234600013", 45, 45, 12, 80),
  p("Sprite 600ml PET", "Beverages", "8901234600014", 45, 45, 12, 60),
  p("Frooti 200ml Tetra", "Beverages", "8901234600015", 18, 18, 12, 100),
  p("Limca 600ml PET", "Beverages", "8901234600016", 40, 40, 12, 50),

  // ══ PACKAGED FOOD ══
  p(
    "Maggi 2-Minute Noodles 70g",
    "Packaged Food",
    "8901058000001",
    14,
    14,
    12,
    200,
    "pcs",
    30,
  ),
  p(
    "Maggi Masala Noodles 4-pack",
    "Packaged Food",
    "8901058000002",
    60,
    58,
    12,
    80,
  ),
  p(
    "Yippee Noodles Magic Masala 70g",
    "Packaged Food",
    "8901058000003",
    14,
    14,
    12,
    150,
  ),
  p("Top Ramen Curry 70g", "Packaged Food", "8901058000004", 14, 14, 12, 100),
  p(
    "MDH Dal Makhani Mix 300g",
    "Packaged Food",
    "8901058000005",
    120,
    115,
    12,
    30,
  ),
  p(
    "Haldiram Chana Masala 400g",
    "Packaged Food",
    "8901058000006",
    180,
    172,
    12,
    25,
  ),
  p("MTR Poha Mix 200g", "Packaged Food", "8901058000007", 60, 57, 12, 35),
  p("MTR Upma Mix 200g", "Packaged Food", "8901058000008", 60, 57, 12, 35),
  p("Knorr Chicken Soup 43g", "Packaged Food", "8901058000009", 35, 33, 12, 40),
  p(
    "Ching's Manchow Soup 55g",
    "Packaged Food",
    "8901058000010",
    30,
    28,
    12,
    40,
  ),

  // ══ SNACKS ══
  p("Parle-G Biscuits 800g", "Snacks", "8901719001001", 75, 75, 12, 100),
  p("Britannia Good Day 90g", "Snacks", "8901719001002", 30, 30, 12, 120),
  p("Oreo Original 120g", "Snacks", "8901719001003", 50, 50, 12, 80),
  p("Bourbon Biscuits 100g", "Snacks", "8901719001004", 30, 30, 12, 100),
  p("Hide & Seek Biscuits 100g", "Snacks", "8901719001005", 45, 43, 12, 60),
  p("Kurkure Masala Munch 90g", "Snacks", "8901719001006", 30, 30, 18, 80),
  p("Lay's Classic Salted 73g", "Snacks", "8901719001007", 30, 30, 18, 80),
  p("Haldiram Bhujia Sev 200g", "Snacks", "8901719001008", 75, 72, 12, 50),
  p("Haldiram Aloo Bhujia 200g", "Snacks", "8901719001009", 75, 72, 12, 50),
  p("Bikaji Navratan Mix 400g", "Snacks", "8901719001010", 120, 115, 12, 40),
  p("Cadbury Dairy Milk 55g", "Snacks", "8901719001011", 50, 50, 18, 80),
  p("Kit Kat 38g", "Snacks", "8901719001012", 40, 40, 18, 80),
  p("5 Star Chocolate 40g", "Snacks", "8901719001013", 30, 30, 18, 100),
  p("Eclairs Toffee 50g", "Snacks", "8901719001014", 20, 20, 18, 150),
  p("Mentos Roll 30g", "Snacks", "8901719001015", 20, 20, 18, 100),

  // ══ PERSONAL CARE ══
  p(
    "Dettol Original Soap 125g",
    "Personal Care",
    "8903222001001",
    62,
    59,
    18,
    80,
  ),
  p(
    "Lifebuoy Total Soap 125g",
    "Personal Care",
    "8903222001002",
    52,
    50,
    18,
    100,
  ),
  p(
    "Lux Soft Touch Soap 100g",
    "Personal Care",
    "8903222001003",
    48,
    46,
    18,
    80,
  ),
  p(
    "Pears Pure & Gentle 125g",
    "Personal Care",
    "8903222001004",
    80,
    76,
    18,
    50,
  ),
  p(
    "Head & Shoulders Shampoo 180ml",
    "Personal Care",
    "8903222001005",
    185,
    178,
    18,
    35,
  ),
  p("Dove Shampoo 340ml", "Personal Care", "8903222001006", 295, 282, 18, 25),
  p(
    "Clinic Plus Shampoo 175ml",
    "Personal Care",
    "8903222001007",
    98,
    93,
    18,
    40,
  ),
  p(
    "Colgate MaxFresh 200g",
    "Personal Care",
    "8903222001008",
    110,
    105,
    18,
    60,
  ),
  p(
    "Pepsodent Toothpaste 200g",
    "Personal Care",
    "8903222001009",
    95,
    90,
    18,
    60,
  ),
  p(
    "Close-Up Toothpaste 200g",
    "Personal Care",
    "8903222001010",
    90,
    86,
    18,
    50,
  ),
  p(
    "Vaseline Body Lotion 200ml",
    "Personal Care",
    "8903222001011",
    195,
    186,
    18,
    30,
  ),
  p("Nivea Crème 60ml", "Personal Care", "8903222001012", 165, 158, 18, 25),
  p(
    "Parachute Hair Oil 300ml",
    "Personal Care",
    "8903222001013",
    190,
    182,
    18,
    35,
  ),

  // ══ CLEANING ══
  p(
    "Ariel Detergent Powder 1kg",
    "Cleaning",
    "8901789001001",
    295,
    282,
    18,
    30,
  ),
  p("Surf Excel Easy Wash 1kg", "Cleaning", "8901789001002", 275, 264, 18, 35),
  p("Tide Plus 1kg", "Cleaning", "8901789001003", 250, 240, 18, 35),
  p("Rin Bar Detergent 250g", "Cleaning", "8901789001004", 35, 34, 18, 100),
  p("Vim Dishwash Bar 135g", "Cleaning", "8901789001005", 30, 29, 18, 100),
  p(
    "Pril Dishwash Liquid 500ml",
    "Cleaning",
    "8901789001006",
    145,
    138,
    18,
    40,
  ),
  p("Colin Glass Cleaner 500ml", "Cleaning", "8901789001007", 170, 162, 18, 25),
  p("Dettol Floor Cleaner 1L", "Cleaning", "8901789001008", 195, 186, 18, 25),
  p("Lizol Floor Cleaner 500ml", "Cleaning", "8901789001009", 160, 152, 18, 30),
  p(
    "Harpic Toilet Cleaner 500ml",
    "Cleaning",
    "8901789001010",
    125,
    120,
    18,
    30,
  ),
  p(
    "Comfort Fabric Softener 860ml",
    "Cleaning",
    "8901789001011",
    280,
    268,
    18,
    20,
  ),
  p(
    "Good Night Liquid Refill 45ml",
    "Cleaning",
    "8901789001012",
    95,
    90,
    18,
    40,
  ),

  // ══ OTHER / STAPLES ══
  p("Tata Salt 1kg", "Other", "8900000001001", 26, 24, 0, 120),
  p("Catch Salt 1kg", "Other", "8900000001002", 22, 21, 0, 80),
  p("Saffola Oats 1kg", "Other", "8900000001003", 185, 176, 18, 30),
  p("Quaker Oats 500g", "Other", "8900000001004", 110, 105, 18, 30),
  p("Heinz Tomato Ketchup 450g", "Other", "8900000001005", 195, 186, 12, 25),
  p("Maggi Hot & Sweet Sauce 500g", "Other", "8900000001006", 130, 124, 12, 30),
  p("Kissan Jam Mixed Fruit 500g", "Other", "8900000001007", 175, 167, 12, 20),
  p("Britannia Bread 400g", "Other", "8900000001008", 50, 48, 12, 40),
  p("Modern White Bread 400g", "Other", "8900000001009", 48, 46, 12, 40),
  p("MDH Biryani Masala 15g Sachet", "Spices", null, 12, 12, 5, 200, "pcs", 30),
  p("Tata Sampann Haldi 200g", "Spices", null, 72, 68, 5, 60),
];

/* ─────────────────────────────────────────────────────────────
   SEED FUNCTION
───────────────────────────────────────────────────────────── */
const seed = async () => {
  await connectDB();

  // ── Users ──
  await User.deleteMany({});
  const admin = await User.create({
    name: "Admin User",
    email: "admin@store.com",
    password: "admin123",
    role: "admin",
    phone: "9876543210",
  });
  await User.create([
    {
      name: "Ravi Cashier",
      email: "staff@store.com",
      password: "staff123",
      role: "staff",
      phone: "9876543211",
      createdBy: admin._id,
    },
    {
      name: "Priya Manager",
      email: "staff2@store.com",
      password: "staff123",
      role: "staff",
      phone: "9876543213",
      createdBy: admin._id,
    },
    {
      name: "Audit Manager",
      email: "authority@store.com",
      password: "auth123",
      role: "authority",
      phone: "9876543212",
      createdBy: admin._id,
    },
  ]);
  console.log("👥 4 users created (1 admin, 2 staff, 1 authority)");

  // ── Products ──
  await Product.deleteMany({});
  const withAdmin = PRODUCTS.map((pr) => ({ ...pr, createdBy: admin._id }));
  await Product.insertMany(withAdmin);

  // Category breakdown
  const categories = {};
  withAdmin.forEach((pr) => {
    categories[pr.category] = (categories[pr.category] || 0) + 1;
  });
  console.log(`\n📦 ${withAdmin.length} products inserted:`);
  Object.entries(categories)
    .sort((a, b) => b[1] - a[1])
    .forEach(([cat, cnt]) =>
      console.log(`   ${cnt.toString().padStart(3)}  ${cat}`),
    );

  console.log("\n✅ Seed complete!\n");
  console.log("───────────────────────────────────");
  console.log("  DEMO ACCOUNTS");
  console.log("───────────────────────────────────");
  console.log("  👑 Admin     admin@store.com     admin123");
  console.log("  🧑 Staff     staff@store.com     staff123");
  console.log("  🧑 Staff 2   staff2@store.com    staff123");
  console.log("  🔍 Authority authority@store.com auth123");
  console.log("───────────────────────────────────\n");
  process.exit(0);
};

seed().catch((err) => {
  console.error("❌ Seed failed:", err.message);
  process.exit(1);
});
