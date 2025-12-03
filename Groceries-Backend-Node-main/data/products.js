// Comprehensive grocery products with proper category references
// categoryIndex refers to the index in the categories array (parent + subcategories)
module.exports = [
  // Fresh Produce - Vegetables (categoryIndex: 10)
  {
    name: 'Organic Carrots',
    description: 'Fresh organic carrots, crisp and sweet. Perfect for snacking, cooking, or juicing. Rich in beta-carotene and fiber.',
    price: 2.49,
    originalPrice: 2.99,
    categoryIndex: 10, // Vegetables subcategory
    brand: 'Green Valley Farms',
    stock: 200,
    weight: 1.5,
    dimensions: { length: 15, width: 3, height: 3 },
    colors: ['Orange'],
    sizes: ['Medium'],
    isActive: true,
    featured: true,
    discount: 17,
    images: [
      { public_id: 'carrots_organic_1', url: '/images/carrots-organic.jpg' },
      { public_id: 'carrots_organic_2', url: '/images/carrots-organic-2.jpg' }
    ],
    tags: ['organic', 'fresh', 'vegetables', 'beta-carotene', 'fiber'],
    ratings: { average: 4.6, count: 89 }
  },
  {
    name: 'Fresh Broccoli Crowns',
    description: 'Premium fresh broccoli crowns, perfect for steaming, roasting, or stir-frying. Packed with vitamins C and K.',
    price: 3.99,
    originalPrice: 4.49,
    categoryIndex: 10, // Vegetables subcategory
    brand: 'Farm Fresh Produce',
    stock: 120,
    weight: 1.2,
    dimensions: { length: 12, width: 8, height: 6 },
    colors: ['Green'],
    sizes: ['Large'],
    isActive: true,
    featured: false,
    discount: 11,
    images: [
      { public_id: 'broccoli_fresh_1', url: '/images/broccoli-fresh.jpg' }
    ],
    tags: ['fresh', 'broccoli', 'vitamin c', 'vitamin k', 'healthy'],
    ratings: { average: 4.4, count: 67 }
  },

  // Fresh Produce - Fruits (categoryIndex: 11)
  {
    name: 'Organic Bananas',
    description: 'Fresh organic bananas, perfect for snacking or baking. Rich in potassium and natural sweetness.',
    price: 2.99,
    originalPrice: 3.49,
    categoryIndex: 11, // Fruits subcategory
    brand: 'Organic Valley',
    stock: 150,
    weight: 2.0,
    dimensions: { length: 20, width: 4, height: 4 },
    colors: ['Yellow'],
    sizes: ['Medium'],
    isActive: true,
    featured: true,
    discount: 14,
    images: [
      { public_id: 'bananas_organic_1', url: '/images/bananas-organic.jpg' }
    ],
    tags: ['organic', 'fresh', 'fruit', 'potassium', 'sweet'],
    ratings: { average: 4.5, count: 123 }
  },
  {
    name: 'Fresh Strawberries',
    description: 'Sweet, juicy strawberries perfect for desserts, smoothies, or fresh eating. Rich in vitamin C and antioxidants.',
    price: 4.99,
    originalPrice: 5.99,
    categoryIndex: 11, // Fruits subcategory
    brand: 'Berry Best Farms',
    stock: 80,
    weight: 1.0,
    dimensions: { length: 10, width: 8, height: 6 },
    colors: ['Red'],
    sizes: ['Medium'],
    isActive: true,
    featured: true,
    discount: 17,
    images: [
      { public_id: 'strawberries_fresh_1', url: '/images/strawberries-fresh.jpg' }
    ],
    tags: ['fresh', 'strawberries', 'vitamin c', 'antioxidants', 'sweet'],
    ratings: { average: 4.7, count: 156 }
  },

  // Dairy & Eggs - Milk & Cream (categoryIndex: 12)
  {
    name: 'Whole Milk Gallon',
    description: 'Fresh whole milk from local dairy farms. Perfect for drinking, cereal, and baking.',
    price: 4.29,
    originalPrice: 4.79,
    categoryIndex: 12, // Milk & Cream subcategory
    brand: 'Farm Fresh Dairy',
    stock: 120,
    weight: 3.8,
    dimensions: { length: 12, width: 6, height: 8 },
    colors: ['White'],
    sizes: ['1 Gallon'],
    isActive: true,
    featured: true,
    discount: 10,
    images: [
      { public_id: 'milk_whole_1', url: '/images/milk-whole.jpg' }
    ],
    tags: ['dairy', 'whole milk', 'calcium', 'fresh', 'local'],
    ratings: { average: 4.7, count: 245 }
  },
  {
    name: 'Organic Almond Milk',
    description: 'Creamy organic almond milk, perfect for lactose-free diets. Rich in vitamin E and naturally sweet.',
    price: 5.99,
    originalPrice: 6.49,
    categoryIndex: 12, // Milk & Cream subcategory
    brand: 'Nature\'s Own',
    stock: 90,
    weight: 1.9,
    dimensions: { length: 10, width: 5, height: 7 },
    colors: ['White'],
    sizes: ['64 fl oz'],
    isActive: true,
    featured: false,
    discount: 8,
    images: [
      { public_id: 'almond_milk_1', url: '/images/almond-milk.jpg' }
    ],
    tags: ['organic', 'almond milk', 'lactose-free', 'vitamin e', 'plant-based'],
    ratings: { average: 4.3, count: 78 }
  },

  // Dairy & Eggs - Cheese (categoryIndex: 13)
  {
    name: 'Aged Cheddar Cheese',
    description: 'Premium aged cheddar cheese, sharp and flavorful. Perfect for sandwiches, crackers, or cooking.',
    price: 8.99,
    originalPrice: 9.99,
    categoryIndex: 13, // Cheese subcategory
    brand: 'Cheese Masters',
    stock: 60,
    weight: 0.5,
    dimensions: { length: 8, width: 4, height: 2 },
    colors: ['Yellow'],
    sizes: ['8 oz'],
    isActive: true,
    featured: true,
    discount: 10,
    images: [
      { public_id: 'cheddar_aged_1', url: '/images/cheddar-aged.jpg' }
    ],
    tags: ['aged', 'cheddar', 'sharp', 'premium', 'cheese'],
    ratings: { average: 4.8, count: 92 }
  },

  // Dairy & Eggs - Eggs (categoryIndex: 15)
  {
    name: 'Free Range Eggs',
    description: 'Fresh free-range eggs from happy hens. Perfect for breakfast, baking, and cooking.',
    price: 5.99,
    originalPrice: 6.49,
    categoryIndex: 15, // Eggs subcategory
    brand: 'Happy Hens Farm',
    stock: 90,
    weight: 0.7,
    dimensions: { length: 6, width: 4, height: 2 },
    colors: ['Brown'],
    sizes: ['Large'],
    isActive: true,
    featured: false,
    discount: 8,
    images: [
      { public_id: 'eggs_free_range_1', url: '/images/eggs-free-range.jpg' }
    ],
    tags: ['free-range', 'protein', 'fresh', 'eggs', 'organic'],
    ratings: { average: 4.6, count: 132 }
  },

  // Meat & Seafood - Beef (categoryIndex: 16)
  {
    name: 'Grass-Fed Ground Beef',
    description: 'Premium grass-fed ground beef, 85% lean. Perfect for burgers, tacos, and pasta dishes.',
    price: 8.99,
    originalPrice: 9.99,
    categoryIndex: 16, // Beef subcategory
    brand: 'Prairie Prime',
    stock: 50,
    weight: 1.0,
    dimensions: { length: 6, width: 4, height: 2 },
    colors: ['Red'],
    sizes: ['1 lb'],
    isActive: true,
    featured: true,
    discount: 10,
    images: [
      { public_id: 'beef_ground_1', url: '/images/beef-ground.jpg' }
    ],
    tags: ['grass-fed', 'beef', 'protein', 'lean', 'premium'],
    ratings: { average: 4.8, count: 67 }
  },

  // Meat & Seafood - Seafood (categoryIndex: 19)
  {
    name: 'Wild Caught Salmon Fillet',
    description: 'Fresh wild-caught salmon fillet, rich in omega-3 fatty acids. Perfect for grilling or baking.',
    price: 12.99,
    originalPrice: 14.99,
    categoryIndex: 19, // Seafood subcategory
    brand: 'Ocean Fresh',
    stock: 30,
    weight: 0.5,
    dimensions: { length: 8, width: 4, height: 1 },
    colors: ['Pink'],
    sizes: ['8 oz'],
    isActive: true,
    featured: false,
    discount: 13,
    images: [
      { public_id: 'salmon_wild_1', url: '/images/salmon-wild.jpg' }
    ],
    tags: ['wild-caught', 'salmon', 'omega-3', 'seafood', 'fresh'],
    ratings: { average: 4.5, count: 89 }
  },

  // Pantry Staples - Rice & Grains (categoryIndex: 20)
  {
    name: 'Organic Brown Rice',
    description: 'Premium organic brown rice, whole grain and nutritious. Perfect for healthy meals and side dishes.',
    price: 4.99,
    originalPrice: 5.99,
    categoryIndex: 20, // Rice & Grains subcategory
    brand: 'Nature\'s Best',
    stock: 200,
    weight: 2.0,
    dimensions: { length: 8, width: 6, height: 3 },
    colors: ['Brown'],
    sizes: ['2 lbs'],
    isActive: true,
    featured: false,
    discount: 17,
    images: [
      { public_id: 'rice_brown_1', url: '/images/rice-brown.jpg' }
    ],
    tags: ['organic', 'brown rice', 'whole grain', 'healthy', 'nutritious'],
    ratings: { average: 4.3, count: 141 }
  },

  // Pantry Staples - Oils & Vinegars (categoryIndex: 22)
  {
    name: 'Extra Virgin Olive Oil',
    description: 'Premium extra virgin olive oil, cold-pressed from the finest olives. Perfect for cooking and dressing.',
    price: 9.99,
    originalPrice: 11.99,
    categoryIndex: 22, // Oils & Vinegars subcategory
    brand: 'Mediterranean Gold',
    stock: 75,
    weight: 0.5,
    dimensions: { length: 8, width: 3, height: 8 },
    colors: ['Green'],
    sizes: ['500ml'],
    isActive: true,
    featured: true,
    discount: 17,
    images: [
      { public_id: 'olive_oil_ev_1', url: '/images/olive-oil-ev.jpg' }
    ],
    tags: ['extra virgin', 'olive oil', 'cold-pressed', 'cooking', 'premium'],
    ratings: { average: 4.9, count: 198 }
  },

  // Beverages - Juices (categoryIndex: 24)
  {
    name: 'Fresh Orange Juice',
    description: 'Freshly squeezed orange juice with no added sugar. Packed with vitamin C and natural flavor.',
    price: 4.49,
    originalPrice: 4.99,
    categoryIndex: 24, // Juices subcategory
    brand: 'Sunny Grove',
    stock: 60,
    weight: 1.9,
    dimensions: { length: 10, width: 4, height: 8 },
    colors: ['Orange'],
    sizes: ['64 fl oz'],
    isActive: true,
    featured: false,
    discount: 10,
    images: [
      { public_id: 'orange_juice_1', url: '/images/orange-juice.jpg' }
    ],
    tags: ['fresh', 'orange juice', 'vitamin c', 'no sugar added', 'natural'],
    ratings: { average: 4.4, count: 129 }
  },

  // Beverages - Water (categoryIndex: 25)
  {
    name: 'Sparkling Water Variety Pack',
    description: 'Refreshing sparkling water in assorted flavors. Zero calories, zero sugar, maximum refreshment.',
    price: 6.99,
    originalPrice: 7.99,
    categoryIndex: 25, // Water subcategory
    brand: 'Crystal Springs',
    stock: 100,
    weight: 4.5,
    dimensions: { length: 12, width: 8, height: 6 },
    colors: ['Clear'],
    sizes: ['12 pack'],
    isActive: true,
    featured: true,
    discount: 13,
    images: [
      { public_id: 'sparkling_water_1', url: '/images/sparkling-water.jpg' }
    ],
    tags: ['sparkling water', 'zero calories', 'variety pack', 'refreshing', 'flavored'],
    ratings: { average: 4.2, count: 152 }
  },

  // Snacks & Confectionery - Chocolate & Candy (categoryIndex: 27)
  {
    name: 'Organic Dark Chocolate',
    description: '70% cocoa organic dark chocolate bar. Rich, smooth, and perfect for chocolate lovers.',
    price: 3.99,
    originalPrice: 4.49,
    categoryIndex: 27, // Chocolate & Candy subcategory
    brand: 'Cacao Dreams',
    stock: 85,
    weight: 0.1,
    dimensions: { length: 8, width: 4, height: 1 },
    colors: ['Brown'],
    sizes: ['3.5 oz'],
    isActive: true,
    featured: false,
    discount: 11,
    images: [
      { public_id: 'chocolate_dark_1', url: '/images/chocolate-dark.jpg' }
    ],
    tags: ['organic', 'dark chocolate', '70% cocoa', 'premium', 'smooth'],
    ratings: { average: 4.6, count: 134 }
  },

  // Snacks & Confectionery - Nuts & Seeds (categoryIndex: 26)
  {
    name: 'Mixed Nuts Trail Mix',
    description: 'Premium trail mix with almonds, cashews, walnuts, and dried fruits. Perfect healthy snack.',
    price: 7.99,
    originalPrice: 8.99,
    categoryIndex: 26, // Nuts & Seeds subcategory
    brand: 'Trail Master',
    stock: 70,
    weight: 1.0,
    dimensions: { length: 8, width: 6, height: 3 },
    colors: ['Mixed'],
    sizes: ['16 oz'],
    isActive: true,
    featured: true,
    discount: 11,
    images: [
      { public_id: 'trail_mix_1', url: '/images/trail-mix.jpg' }
    ],
    tags: ['trail mix', 'nuts', 'healthy snack', 'protein', 'dried fruits'],
    ratings: { average: 4.5, count: 86 }
  },

  // Frozen Foods - Frozen Fruits (categoryIndex: 29)
  {
    name: 'Frozen Blueberries',
    description: 'Premium frozen wild blueberries, perfect for smoothies, baking, and healthy snacking.',
    price: 5.99,
    originalPrice: 6.99,
    categoryIndex: 29, // Frozen Fruits subcategory
    brand: 'Arctic Harvest',
    stock: 95,
    weight: 2.0,
    dimensions: { length: 8, width: 6, height: 3 },
    colors: ['Blue'],
    sizes: ['2 lbs'],
    isActive: true,
    featured: false,
    discount: 14,
    images: [
      { public_id: 'blueberries_frozen_1', url: '/images/blueberries-frozen.jpg' }
    ],
    tags: ['frozen', 'blueberries', 'antioxidants', 'wild', 'smoothies'],
    ratings: { average: 4.4, count: 91 }
  },

  // Frozen Foods - Frozen Vegetables (categoryIndex: 28)
  {
    name: 'Frozen Vegetable Medley',
    description: 'Mixed frozen vegetables including broccoli, carrots, and peas. Convenient and nutritious.',
    price: 3.49,
    originalPrice: 3.99,
    categoryIndex: 28, // Frozen Vegetables subcategory
    brand: 'Garden Fresh',
    stock: 110,
    weight: 1.0,
    dimensions: { length: 8, width: 6, height: 2 },
    colors: ['Mixed'],
    sizes: ['1 lb'],
    isActive: true,
    featured: false,
    discount: 13,
    images: [
      { public_id: 'veggies_frozen_1', url: '/images/veggies-frozen.jpg' }
    ],
    tags: ['frozen', 'vegetables', 'mixed', 'convenient', 'nutritious'],
    ratings: { average: 4.1, count: 72 }
  },

  // Bakery - Bread (categoryIndex: 30)
  {
    name: 'Artisan Sourdough Bread',
    description: 'Freshly baked artisan sourdough bread with a perfect crust and soft interior.',
    price: 4.99,
    originalPrice: 5.49,
    categoryIndex: 30, // Bread subcategory
    brand: 'Baker\'s Corner',
    stock: 40,
    weight: 0.5,
    dimensions: { length: 12, width: 4, height: 4 },
    colors: ['Brown'],
    sizes: ['1 loaf'],
    isActive: true,
    featured: true,
    discount: 9,
    images: [
      { public_id: 'sourdough_artisan_1', url: '/images/sourdough-artisan.jpg' }
    ],
    tags: ['artisan', 'sourdough', 'fresh baked', 'bread', 'crusty'],
    ratings: { average: 4.7, count: 143 }
  },

  // Bakery - Cookies (categoryIndex: 33)
  {
    name: 'Chocolate Chip Cookies',
    description: 'Freshly baked chocolate chip cookies with real chocolate chips. Soft and chewy texture.',
    price: 6.99,
    originalPrice: 7.99,
    categoryIndex: 33, // Cookies subcategory
    brand: 'Sweet Treats',
    stock: 55,
    weight: 0.3,
    dimensions: { length: 8, width: 6, height: 2 },
    colors: ['Brown'],
    sizes: ['12 count'],
    isActive: true,
    featured: false,
    discount: 13,
    images: [
      { public_id: 'cookies_chocolate_1', url: '/images/cookies-chocolate.jpg' }
    ],
    tags: ['cookies', 'chocolate chip', 'fresh baked', 'sweet', 'chewy'],
    ratings: { average: 4.8, count: 167 }
  },

  // Health & Wellness - Protein & Fitness (categoryIndex: 35)
  {
    name: 'Organic Protein Powder',
    description: 'Plant-based organic protein powder with vanilla flavor. Perfect for smoothies and shakes.',
    price: 24.99,
    originalPrice: 29.99,
    categoryIndex: 35, // Protein & Fitness subcategory
    brand: 'Pure Protein',
    stock: 35,
    weight: 2.0,
    dimensions: { length: 8, width: 6, height: 8 },
    colors: ['White'],
    sizes: ['2 lbs'],
    isActive: true,
    featured: true,
    discount: 17,
    images: [
      { public_id: 'protein_powder_1', url: '/images/protein-powder.jpg' }
    ],
    tags: ['organic', 'protein powder', 'plant-based', 'vanilla', 'fitness'],
    ratings: { average: 4.5, count: 98 }
  },

  // Health & Wellness - Vitamins & Supplements (categoryIndex: 34)
  {
    name: 'Multivitamin Gummies',
    description: 'Daily multivitamin gummies with essential vitamins and minerals. Great taste, great nutrition.',
    price: 12.99,
    originalPrice: 14.99,
    categoryIndex: 34, // Vitamins & Supplements subcategory
    brand: 'Vitality Plus',
    stock: 80,
    weight: 0.2,
    dimensions: { length: 6, width: 4, height: 6 },
    colors: ['Mixed'],
    sizes: ['90 count'],
    isActive: true,
    featured: false,
    discount: 13,
    images: [
      { public_id: 'vitamins_gummies_1', url: '/images/vitamins-gummies.jpg' }
    ],
    tags: ['multivitamin', 'gummies', 'daily', 'essential vitamins', 'nutrition'],
    ratings: { average: 4.3, count: 146 }
  },

  // Household Essentials - Cleaning Supplies (categoryIndex: 36)
  {
    name: 'Eco-Friendly Dish Soap',
    description: 'Plant-based dish soap that cuts through grease while being gentle on hands and environment.',
    price: 3.99,
    originalPrice: 4.49,
    categoryIndex: 36, // Cleaning Supplies subcategory
    brand: 'Green Clean',
    stock: 120,
    weight: 0.7,
    dimensions: { length: 8, width: 3, height: 8 },
    colors: ['Green'],
    sizes: ['25 fl oz'],
    isActive: true,
    featured: false,
    discount: 11,
    images: [
      { public_id: 'dish_soap_eco_1', url: '/images/dish-soap-eco.jpg' }
    ],
    tags: ['eco-friendly', 'dish soap', 'plant-based', 'grease cutting', 'gentle'],
    ratings: { average: 4.2, count: 83 }
  },

  // Household Essentials - Paper Products (categoryIndex: 37)
  {
    name: 'Premium Paper Towels',
    description: 'Ultra-absorbent paper towels, perfect for spills, cleaning, and kitchen tasks. 2-ply strength.',
    price: 8.99,
    originalPrice: 9.99,
    categoryIndex: 37, // Paper Products subcategory
    brand: 'Clean Master',
    stock: 150,
    weight: 1.5,
    dimensions: { length: 12, width: 8, height: 6 },
    colors: ['White'],
    sizes: ['6 rolls'],
    isActive: true,
    featured: true,
    discount: 10,
    images: [
      { public_id: 'paper_towels_1', url: '/images/paper-towels.jpg' }
    ],
    tags: ['paper towels', 'ultra-absorbent', '2-ply', 'cleaning', 'spills'],
    ratings: { average: 4.4, count: 201 }
  }
];
