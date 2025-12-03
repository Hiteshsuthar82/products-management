const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Country = require('./models/Country');
const Currency = require('./models/Currency');

// Load environment variables
dotenv.config({ path: './config.env' });

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected...');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

// Create default admin user
const createAdmin = async () => {
  try {
    console.log('🔐 Creating default admin user...\n');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ 
      $or: [
        { email: 'admin@grocery.com' },
        { role: 'admin' }
      ]
    });

    if (existingAdmin) {
      console.log('⚠️  Admin user already exists!');
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Name: ${existingAdmin.name}`);
      console.log(`   Role: ${existingAdmin.role}`);
      console.log('\n💡 To create a new admin, delete the existing one first or use a different email.');
      return;
    }

    // Get first country and currency for admin
    const country = await Country.findOne();
    const currency = await Currency.findOne();

    // Create default admin
    const adminData = {
      name: 'Admin User',
      email: 'admin@grocery.com',
      password: 'admin123', // Will be hashed by pre-save middleware
      role: 'admin',
      phone: '+15550000001', // Format: +[country code][number]
      isActive: true,
      avatar: ''
    };

    // Add country and currency if they exist
    if (country) adminData.country = country._id;
    if (currency) adminData.currency = currency._id;

    const admin = await User.create(adminData);

    console.log('✅ Default admin user created successfully!\n');
    console.log('📋 Admin Credentials:');
    console.log('   Email: admin@grocery.com');
    console.log('   Password: admin123');
    console.log('   Role: admin');
    console.log('   Phone: +15550000001');
    console.log('\n⚠️  IMPORTANT: Change the default password after first login!');
    console.log('   Note: Admin passwords are stored in plain text (as per your auth logic)');

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    throw error;
  }
};

// Main function
const main = async () => {
  await connectDB();
  await createAdmin();
  mongoose.connection.close();
  console.log('\n✅ Process completed!');
  process.exit(0);
};

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
