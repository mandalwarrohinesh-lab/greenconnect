const { connectDatabase } = require('./connection');
const { Product } = require('./models');

const products = [
  {
    name: 'Bamboo Water Bottle',
    price: 150,
    category: 'Reusable',
    image: '🥤',
    description: 'Eco-friendly bamboo water bottle with stainless steel interior. Keep your drinks hot or cold for hours.',
    rating: 4.8,
    popular: true,
    stock: 50,
    views: 1250,
    redemptions: 89
  },
  {
    name: 'Organic Cotton Tote',
    price: 80,
    category: 'Organic',
    image: '👜',
    description: 'Sustainable cotton shopping bag made from 100% organic materials. Perfect for grocery shopping.',
    rating: 4.7,
    popular: false,
    stock: 100,
    views: 890,
    redemptions: 67
  },
  {
    name: 'Solar Power Bank',
    price: 300,
    category: 'Eco Home',
    image: '🔋',
    description: 'Solar-powered portable charger with 20000mAh capacity. Charge your devices using clean energy.',
    rating: 4.9,
    popular: true,
    stock: 30,
    views: 2100,
    redemptions: 145
  },
  {
    name: 'Reusable Food Wraps',
    price: 60,
    category: 'Reusable',
    image: '🥪',
    description: 'Beeswax food storage wraps - a sustainable alternative to plastic wrap. Set of 5 different sizes.',
    rating: 4.6,
    popular: false,
    stock: 75,
    views: 650,
    redemptions: 43
  },
  {
    name: 'Bamboo Toothbrush Set',
    price: 45,
    category: 'Organic',
    image: '🪥',
    description: 'Set of 4 bamboo toothbrushes with biodegradable packaging. Soft bristles for gentle cleaning.',
    rating: 4.5,
    popular: false,
    stock: 120,
    views: 540,
    redemptions: 78
  },
  {
    name: 'LED Smart Bulbs',
    price: 120,
    category: 'Eco Home',
    image: '💡',
    description: 'Energy-efficient smart lighting with app control. Save up to 80% on electricity costs.',
    rating: 4.8,
    popular: true,
    stock: 60,
    views: 1450,
    redemptions: 112
  },
  {
    name: 'Compost Bin',
    price: 200,
    category: 'Eco Home',
    image: '🗂️',
    description: 'Indoor composting solution with odor control. Turn food waste into nutrient-rich soil.',
    rating: 4.4,
    popular: false,
    stock: 25,
    views: 420,
    redemptions: 34
  },
  {
    name: 'Eco Cleaning Kit',
    price: 90,
    category: 'Reusable',
    image: '🧽',
    description: 'Natural cleaning supplies bundle with reusable cloths and plant-based cleaners.',
    rating: 4.7,
    popular: true,
    stock: 85,
    views: 980,
    redemptions: 91
  }
];

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seed...');
    
    await connectDatabase();
    
    // Clear existing products
    await Product.deleteMany({});
    console.log('🗑️  Cleared existing products');
    
    // Insert products
    const insertedProducts = await Product.insertMany(products);
    console.log(`✅ Inserted ${insertedProducts.length} products`);
    
    console.log('🎉 Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
}

// Run seed if called directly
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };
