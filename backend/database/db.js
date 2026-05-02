// In-memory database for development
// In production, replace with PostgreSQL, MongoDB, or your preferred database

const database = {
  users: [],
  posts: [],
  stories: [],
  issues: [],
  events: [],
  products: [],
  comments: [],
  notifications: [],
  likes: [],
  follows: [],
  eventParticipants: [],
  achievements: [],
  pointsTransactions: []
};

// Initialize with sample data
function initDatabase() {
  console.log('🗄️  Initializing database...');
  
  // Clear all sample users - user can create their own account
  database.users = [];

  // Keep products for the marketplace
  database.products = [
    {
      id: '1',
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
      id: '2',
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
      id: '3',
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
      id: '4',
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
      id: '5',
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
      id: '6',
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
      id: '7',
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
      id: '8',
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

  // Clear all sample posts - user will create their own
  database.posts = [];

  // Clear all sample events - user will create their own
  database.events = [];

  // Clear all sample issues - user will report their own
  database.issues = [];

  console.log('✅ Database initialized - ready for user data');
  console.log(`   - ${database.users.length} users (empty - ready for signup)`);
  console.log(`   - ${database.products.length} products (marketplace items)`);
  console.log(`   - ${database.posts.length} posts (empty - ready for user posts)`);
  console.log(`   - ${database.events.length} events (empty - ready for user events)`);
  console.log(`   - ${database.issues.length} issues (empty - ready for user reports)`);
}

// Helper functions
function generateId() {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

module.exports = {
  database,
  initDatabase,
  generateId
};
