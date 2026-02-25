const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function connectDB() {
  try {
    await prisma.$connect();
    console.log('✅ Connected to MongoDB via Prisma');
    console.log(`📦 Database: ${process.env.MONGO_URL?.split('/').pop() || 'monolith-ecommerce'}`);
    return prisma;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
}

async function disconnectDB() {
  try {
    await prisma.$disconnect();
    console.log('✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error disconnecting from database:', error);
  }
}

module.exports = {
  prisma,
  connectDB,
  disconnectDB
};


