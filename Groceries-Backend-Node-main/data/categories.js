// Comprehensive grocery store categories with proper hierarchy
module.exports = {
  // Parent Categories (10 main categories)
  parentCategories: [
  {
    name: 'Fresh Produce',
    slug: 'fresh-produce',
    icon: '🥬',
    parentId: null,
    isActive: true
  },
  {
    name: 'Dairy & Eggs',
    slug: 'dairy-eggs',
    icon: '🥛',
    parentId: null,
    isActive: true
  },
  {
    name: 'Meat & Seafood',
    slug: 'meat-seafood',
    icon: '🥩',
    parentId: null,
    isActive: true
  },
  {
    name: 'Pantry Staples',
    slug: 'pantry-staples',
    icon: '🥫',
    parentId: null,
    isActive: true
  },
  {
    name: 'Beverages',
    slug: 'beverages',
    icon: '🥤',
    parentId: null,
    isActive: true
  },
  {
    name: 'Snacks & Confectionery',
    slug: 'snacks-confectionery',
    icon: '🍪',
    parentId: null,
    isActive: true
  },
  {
    name: 'Frozen Foods',
    slug: 'frozen-foods',
    icon: '🧊',
    parentId: null,
    isActive: true
  },
  {
    name: 'Bakery',
    slug: 'bakery',
    icon: '🍞',
    parentId: null,
    isActive: true
  },
  {
    name: 'Health & Wellness',
    slug: 'health-wellness',
    icon: '💊',
    parentId: null,
    isActive: true
  },
  {
    name: 'Household Essentials',
    slug: 'household-essentials',
    icon: '🧽',
    parentId: null,
    isActive: true
  }
  ],

  // Subcategories mapped to parent categories by index
  subcategories: [
    // Fresh Produce subcategories (index 0)
    [
      {
        name: 'Vegetables',
        slug: 'vegetables',
        icon: '🥕',
        parentIndex: 0,
        isActive: true
      },
      {
        name: 'Fruits',
        slug: 'fruits',
        icon: '🍎',
        parentIndex: 0,
        isActive: true
      },
      {
        name: 'Herbs & Spices',
        slug: 'herbs-spices',
        icon: '🌿',
        parentIndex: 0,
        isActive: true
      }
    ],
    // Dairy & Eggs subcategories (index 1)
    [
      {
        name: 'Milk & Cream',
        slug: 'milk-cream',
        icon: '🥛',
        parentIndex: 1,
        isActive: true
      },
      {
        name: 'Cheese',
        slug: 'cheese',
        icon: '🧀',
        parentIndex: 1,
        isActive: true
      },
      {
        name: 'Yogurt & Dairy Alternatives',
        slug: 'yogurt-dairy-alternatives',
        icon: '🍶',
        parentIndex: 1,
        isActive: true
      },
      {
        name: 'Eggs',
        slug: 'eggs',
        icon: '🥚',
        parentIndex: 1,
        isActive: true
      }
    ],
    // Meat & Seafood subcategories (index 2)
    [
      {
        name: 'Beef',
        slug: 'beef',
        icon: '🥩',
        parentIndex: 2,
        isActive: true
      },
      {
        name: 'Pork',
        slug: 'pork',
        icon: '🐷',
        parentIndex: 2,
        isActive: true
      },
      {
        name: 'Poultry',
        slug: 'poultry',
        icon: '🐔',
        parentIndex: 2,
        isActive: true
      },
      {
        name: 'Seafood',
        slug: 'seafood',
        icon: '🐟',
        parentIndex: 2,
        isActive: true
      }
    ],
    // Pantry Staples subcategories (index 3)
    [
      {
        name: 'Rice & Grains',
        slug: 'rice-grains',
        icon: '🌾',
        parentIndex: 3,
        isActive: true
      },
      {
        name: 'Pasta & Noodles',
        slug: 'pasta-noodles',
        icon: '🍝',
        parentIndex: 3,
        isActive: true
      },
      {
        name: 'Oils & Vinegars',
        slug: 'oils-vinegars',
        icon: '🫒',
        parentIndex: 3,
        isActive: true
      },
      {
        name: 'Canned Goods',
        slug: 'canned-goods',
        icon: '🥫',
        parentIndex: 3,
        isActive: true
      },
      {
        name: 'Spices & Seasonings',
        slug: 'spices-seasonings',
        icon: '🧂',
        parentIndex: 3,
        isActive: true
      }
    ],
    // Beverages subcategories (index 4)
    [
      {
        name: 'Juices',
        slug: 'juices',
        icon: '🧃',
        parentIndex: 4,
        isActive: true
      },
      {
        name: 'Water',
        slug: 'water',
        icon: '💧',
        parentIndex: 4,
        isActive: true
      },
      {
        name: 'Soft Drinks',
        slug: 'soft-drinks',
        icon: '🥤',
        parentIndex: 4,
        isActive: true
      },
      {
        name: 'Coffee & Tea',
        slug: 'coffee-tea',
        icon: '☕',
        parentIndex: 4,
        isActive: true
      }
    ],
    // Snacks & Confectionery subcategories (index 5)
    [
      {
        name: 'Chips & Crackers',
        slug: 'chips-crackers',
        icon: '🍟',
        parentIndex: 5,
        isActive: true
      },
      {
        name: 'Nuts & Seeds',
        slug: 'nuts-seeds',
        icon: '🥜',
        parentIndex: 5,
        isActive: true
      },
      {
        name: 'Chocolate & Candy',
        slug: 'chocolate-candy',
        icon: '🍫',
        parentIndex: 5,
        isActive: true
      },
      {
        name: 'Dried Fruits',
        slug: 'dried-fruits',
        icon: '🍇',
        parentIndex: 5,
        isActive: true
      }
    ],
    // Frozen Foods subcategories (index 6)
    [
      {
        name: 'Frozen Vegetables',
        slug: 'frozen-vegetables',
        icon: '🥦',
        parentIndex: 6,
        isActive: true
      },
      {
        name: 'Frozen Fruits',
        slug: 'frozen-fruits',
        icon: '🍓',
        parentIndex: 6,
        isActive: true
      },
      {
        name: 'Frozen Meals',
        slug: 'frozen-meals',
        icon: '🍽️',
        parentIndex: 6,
        isActive: true
      },
      {
        name: 'Ice Cream & Desserts',
        slug: 'ice-cream-desserts',
        icon: '🍦',
        parentIndex: 6,
        isActive: true
      }
    ],
    // Bakery subcategories (index 7)
    [
      {
        name: 'Bread',
        slug: 'bread',
        icon: '🍞',
        parentIndex: 7,
        isActive: true
      },
      {
        name: 'Pastries',
        slug: 'pastries',
        icon: '🥐',
        parentIndex: 7,
        isActive: true
      },
      {
        name: 'Cakes & Desserts',
        slug: 'cakes-desserts',
        icon: '🎂',
        parentIndex: 7,
        isActive: true
      },
      {
        name: 'Cookies',
        slug: 'cookies',
        icon: '🍪',
        parentIndex: 7,
        isActive: true
      }
    ],
    // Health & Wellness subcategories (index 8)
    [
      {
        name: 'Vitamins & Supplements',
        slug: 'vitamins-supplements',
        icon: '💊',
        parentIndex: 8,
        isActive: true
      },
      {
        name: 'Protein & Fitness',
        slug: 'protein-fitness',
        icon: '💪',
        parentIndex: 8,
        isActive: true
      },
      {
        name: 'Organic & Natural',
        slug: 'organic-natural',
        icon: '🌱',
        parentIndex: 8,
        isActive: true
      },
      {
        name: 'Personal Care',
        slug: 'personal-care',
        icon: '🧴',
        parentIndex: 8,
        isActive: true
      }
    ],
    // Household Essentials subcategories (index 9)
    [
      {
        name: 'Cleaning Supplies',
        slug: 'cleaning-supplies',
        icon: '🧽',
        parentIndex: 9,
        isActive: true
      },
      {
        name: 'Paper Products',
        slug: 'paper-products',
        icon: '🧻',
        parentIndex: 9,
        isActive: true
      },
      {
        name: 'Laundry Care',
        slug: 'laundry-care',
        icon: '🧺',
        parentIndex: 9,
        isActive: true
      },
      {
        name: 'Kitchen Essentials',
        slug: 'kitchen-essentials',
        icon: '🍴',
        parentIndex: 9,
        isActive: true
      }
    ]
  ]
};
