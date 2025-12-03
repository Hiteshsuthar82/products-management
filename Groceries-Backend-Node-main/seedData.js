const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Load env vars
dotenv.config({ path: './config.env' });

// Import models
const User = require('./models/User');
const Category = require('./models/Category');
const Product = require('./models/Product');
const Address = require('./models/Address');
const Country = require('./models/Country');
const Currency = require('./models/Currency');
const Order = require('./models/Order');
const Cart = require('./models/Cart');

// Import data
const categoriesData = require('./data/categories');
const usersData = require('./data/users');
const productsData = require('./data/products');
const addressesData = require('./data/addresses');
const countriesData = require('./data/countries');
const currenciesData = require('./data/currencies');
const ordersData = require('./data/orders');
const cartData = require('./data/cart');

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

// Clear all data
const clearData = async () => {
  try {
    await User.deleteMany();
    await Category.deleteMany();
    await Product.deleteMany();
    await Address.deleteMany();
    await Country.deleteMany();
    await Currency.deleteMany();
    await Order.deleteMany();
    await Cart.deleteMany();
    console.log('✅ All data cleared');
  } catch (error) {
    console.error('Error clearing data:', error);
  }
};

// Seed data
const seedData = async () => {
  try {
    console.log('🚀 Starting data seeding process...\n');
    // 1. Seed Currencies first
    console.log('💰 Seeding Currencies...');
    const currencies = await Currency.insertMany(currenciesData);
    console.log(`✅ ${currencies.length} currencies created`);

    // 2. Seed Countries
    console.log('🌍 Seeding Countries...');
    const countries = await Country.insertMany(countriesData);
    console.log(`✅ ${countries.length} countries created`);

    // 3. Seed Parent Categories
    console.log('📂 Seeding Parent Categories...');
    // Generate code for parent categories
    const parentCategoriesWithCode = categoriesData.parentCategories.map((cat, index) => ({
      ...cat,
      code: cat.code || `CAT-${String(index + 1).padStart(3, '0')}`
    }));
    const parentCategories = await Category.insertMany(parentCategoriesWithCode);
    console.log(`✅ ${parentCategories.length} parent categories created`);

    // 4. Seed Subcategories
    console.log('📂 Seeding Subcategories...');
    const subcategoriesData = [];
    let subcategoryIndex = 1;
    
    // Create subcategories with proper parent references and codes
    categoriesData.subcategories.forEach((subcategoryGroup, parentIndex) => {
      subcategoryGroup.forEach(subcategory => {
        subcategoriesData.push({
          name: subcategory.name,
          slug: subcategory.slug,
          icon: subcategory.icon,
          parentId: parentCategories[subcategory.parentIndex]._id,
          isActive: subcategory.isActive,
          code: subcategory.code || `SUB-${String(subcategoryIndex++).padStart(3, '0')}`
        });
      });
    });
    
    const subcategories = await Category.insertMany(subcategoriesData);
    console.log(`✅ ${subcategories.length} subcategories created`);

    // Combine all categories for product references
    const categories = [...parentCategories, ...subcategories];

    // 5. Seed Users with country and currency references
    console.log('👥 Seeding Users...');
    const usersWithReferences = usersData.map((user, index) => {
      // Format phone number to include country code if not already formatted
      let formattedPhone = user.phone;
      if (!formattedPhone.startsWith('+')) {
        // Add +1 (US country code) as default if phone doesn't start with +
        formattedPhone = `+1${formattedPhone}`;
      }
      
      return {
        ...user,
        phone: formattedPhone,
        country: countries[index % countries.length]._id,
        currency: currencies[index % currencies.length]._id
      };
    });
    const users = await User.insertMany(usersWithReferences);
    console.log(`✅ ${users.length} users created`);

    // 5.5. Create default admin if not exists
    console.log('🔐 Checking for default admin...');
    const existingAdmin = await User.findOne({ 
      $or: [
        { email: 'admin@grocery.com' },
        { role: 'admin' }
      ]
    });

    if (!existingAdmin) {
      const defaultAdmin = {
        name: 'Admin User',
        email: 'admin@grocery.com',
        password: 'admin123', // Will be hashed by pre-save middleware
        role: 'admin',
        phone: '+15550000001',
        isActive: true,
        country: countries[0]._id,
        currency: currencies[0]._id,
        avatar: ''
      };
      const admin = await User.create(defaultAdmin);
      console.log('✅ Default admin user created');
      console.log('   Email: admin@grocery.com');
      console.log('   Password: admin123');
    } else {
      console.log('ℹ️  Admin user already exists');
    }

    // 6. Seed Products with category references
    console.log('🛒 Seeding Products...');
    const productsWithCategories = productsData.map(product => {
      // Remove categoryIndex and add proper category reference
      const { categoryIndex, ...productData } = product;
      return {
        ...productData,
        category: categories[categoryIndex]._id
      };
    });
    
    const products = await Product.insertMany(productsWithCategories);
    console.log(`✅ ${products.length} products created`);

    // 7. Seed Addresses with user references
    console.log('🏠 Seeding Addresses...');
    const addressesWithUsers = addressesData.map((address, index) => {
      const { fullName, phoneNumber, addressLine1, addressLine2, countryIndex, ...rest } = address;
      return {
        ...rest,
        name: fullName,
        phone: phoneNumber.replace(/[^0-9]/g, '').slice(-10), // Extract 10 digits
        address: `${addressLine1}${addressLine2 ? ', ' + addressLine2 : ''}`,
        user: users[index % users.length]._id,
        country: countries[countryIndex].name // Use country name instead of ObjectId
      };
    });
    const addresses = await Address.insertMany(addressesWithUsers);
    console.log(`✅ ${addresses.length} addresses created`);

    // 8. Seed Cart items
    console.log('🛒 Seeding Cart Items...');
    const cartWithReferences = cartData.map((item, index) => ({
      ...item,
      user: users[index % users.length]._id,
      product: products[item.productIndex]._id
    }));
    const cartItems = await Cart.insertMany(cartWithReferences);
    console.log(`✅ ${cartItems.length} cart items created`);

    // 9. Seed Orders with references
    console.log('📦 Seeding Orders...');
    const ordersWithReferences = await Promise.all(ordersData.map(async (order, index) => {
      const customer = users.find(u => u.role === 'customer');
      const userAddress = addresses.find(a => a.user.toString() === customer._id.toString());
      
      const items = order.orderItems.map(item => {
        const product = products[item.productIndex];
        return {
          product: product._id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          selectedColor: product.colors ? product.colors[0] : '',
          selectedSize: product.sizes ? product.sizes[0] : '',
          image: product.images[0].url
        };
      });

      // Calculate pricing
      const itemsPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const shippingPrice = 5.99; // Fixed shipping cost
      const taxPrice = itemsPrice * 0.08; // 8% tax
      const totalPrice = itemsPrice + shippingPrice + taxPrice;

      // Generate unique order number
      const timestamp = Date.now().toString();
      const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      const orderNumber = `ORD${timestamp}${random}${index}`;

      return {
        orderNumber,
        user: customer._id,
        items,
        pricing: {
          itemsPrice,
          shippingPrice,
          taxPrice,
          totalPrice,
          currency: 'USD'
        },
        shippingAddress: userAddress ? {
          name: userAddress.name,
          phone: userAddress.phone,
          address: userAddress.address,
          city: userAddress.city,
          state: userAddress.state,
          postalCode: userAddress.postalCode,
          country: userAddress.country
        } : {
          name: 'John Doe',
          phone: '1234567890',
          address: '123 Main St',
          city: 'New York',
          state: 'NY',
          postalCode: '10001',
          country: 'United States'
        },
        paymentInfo: order.paymentInfo,
        orderStatus: order.orderStatus,
        shippingInfo: {
          deliveredAt: order.deliveredAt
        },
        createdAt: order.createdAt
      };
    }));
    
    const orders = await Order.insertMany(ordersWithReferences);
    console.log(`✅ ${orders.length} orders created`);

    console.log('\n🎉 All dummy data seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`Currencies: ${currencies.length}`);
    console.log(`Countries: ${countries.length}`);
    console.log(`Categories: ${categories.length} (${parentCategories.length} parent, ${subcategories.length} subcategories)`);
    console.log(`Users: ${users.length}`);
    console.log(`Products: ${products.length}`);
    console.log(`Addresses: ${addresses.length}`);
    console.log(`Cart Items: ${cartItems.length}`);
    console.log(`Orders: ${orders.length}`);

    // Update category product counts
    console.log('\n🔄 Updating category product counts...');
    for (const category of categories) {
      await category.updateProductCount();
    }
    console.log('✅ Category product counts updated');

  } catch (error) {
    console.error('❌ Error seeding data:', error);
    console.error('Stack trace:', error.stack);
    throw error;
  }
};

// Main function
const main = async () => {
  await connectDB();
  await clearData();
  await seedData();
  
  const args = process.argv.slice(2);
  
  if (args[0] === '--clear') {
    await clearData();
  } else if (args[0] === '--seed') {
    await seedData();
  } else if (args[0] === '--reset') {
    await clearData();
    await seedData();
  } else {
    console.log('Usage:');
    console.log('  npm run seed --clear   # Clear all data');
    console.log('  npm run seed --seed    # Seed data');
    console.log('  npm run seed --reset   # Clear and seed data');
  }
  
  mongoose.connection.close();
};

main().catch(error => {
  console.error('Seeding error:', error);
  process.exit(1);
});
