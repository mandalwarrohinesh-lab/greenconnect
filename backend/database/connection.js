const mongoose = require('mongoose');

let isConnected = false;

async function connectDatabase() {
  if (isConnected) {
    console.log('📦 Using existing database connection');
    return;
  }

  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/greenconnect';
    
    console.log('🔌 Connecting to MongoDB...');
    console.log(`📍 URI: ${mongoUri.replace(/:[^:@]+@/, ':****@')}`); // Hide password in logs
    
    // Add DNS resolution options for better compatibility
    const connectionOptions = {
      serverSelectionTimeoutMS: 10000, // 10 second timeout
      socketTimeoutMS: 45000,
    };
    
    // If using SRV, add family option to prefer IPv4
    if (mongoUri.includes('mongodb+srv://')) {
      connectionOptions.family = 4; // Force IPv4
    }
    
    await mongoose.connect(mongoUri, connectionOptions);

    isConnected = true;
    
    console.log('✅ MongoDB connected successfully');
    console.log(`📍 Database: ${mongoose.connection.name}`);
    console.log(`🌐 Host: ${mongoose.connection.host}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
      isConnected = false;
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️  MongoDB disconnected');
      isConnected = false;
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('🔌 MongoDB connection closed through app termination');
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.log('💡 Troubleshooting tips:');
    console.log('   1. Check if IP is whitelisted in MongoDB Atlas');
    console.log('   2. Verify connection string is correct');
    console.log('   3. Check internet connection');
    console.log('   4. Try using standard connection string instead of SRV');
    console.log('⚠️  Falling back to in-memory database for development');
    isConnected = false;
    throw error;
  }
}

async function disconnectDatabase() {
  if (!isConnected) {
    return;
  }

  try {
    await mongoose.connection.close();
    isConnected = false;
    console.log('🔌 MongoDB disconnected');
  } catch (error) {
    console.error('❌ Error disconnecting from MongoDB:', error);
  }
}

function getConnectionStatus() {
  return {
    isConnected,
    readyState: mongoose.connection.readyState,
    host: mongoose.connection.host,
    name: mongoose.connection.name
  };
}

module.exports = {
  connectDatabase,
  disconnectDatabase,
  getConnectionStatus,
  mongoose
};
