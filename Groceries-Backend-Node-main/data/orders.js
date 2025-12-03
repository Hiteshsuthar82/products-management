// 20 orders with order items (productIndex references products array)
module.exports = [
  {
    orderItems: [
      { productIndex: 0, name: 'Organic Bananas', quantity: 2, price: 2.99 },
      { productIndex: 2, name: 'Whole Milk Gallon', quantity: 1, price: 4.29 }
    ],
    totalPrice: 10.27,
    paymentInfo: {
      method: 'online',
      status: 'paid',
      paymentReference: 'PAY_001_2024',
      paidAt: new Date('2024-01-10T14:30:00Z')
    },
    orderStatus: 'delivered',
    deliveredAt: new Date('2024-01-12T16:45:00Z'),
    createdAt: new Date('2024-01-10T14:30:00Z')
  },
  {
    orderItems: [
      { productIndex: 4, name: 'Grass-Fed Ground Beef', quantity: 1, price: 8.99 },
      { productIndex: 1, name: 'Fresh Spinach Leaves', quantity: 2, price: 3.99 }
    ],
    totalPrice: 16.97,
    paymentInfo: {
      method: 'cash',
      status: 'pending',
      paymentReference: '',
      paidAt: null
    },
    orderStatus: 'confirmed',
    deliveredAt: null,
    createdAt: new Date('2024-01-11T09:15:00Z')
  },
  {
    orderItems: [
      { productIndex: 7, name: 'Extra Virgin Olive Oil', quantity: 1, price: 9.99 },
      { productIndex: 6, name: 'Organic Brown Rice', quantity: 2, price: 4.99 },
      { productIndex: 3, name: 'Free Range Eggs', quantity: 1, price: 5.99 }
    ],
    totalPrice: 25.96,
    paymentInfo: {
      method: 'online',
      status: 'paid',
      paymentReference: 'PAY_002_2024',
      paidAt: new Date('2024-01-12T11:20:00Z')
    },
    orderStatus: 'shipped',
    deliveredAt: null,
    createdAt: new Date('2024-01-12T11:20:00Z')
  },
  {
    orderItems: [
      { productIndex: 11, name: 'Mixed Nuts Trail Mix', quantity: 1, price: 7.99 },
      { productIndex: 10, name: 'Organic Dark Chocolate', quantity: 2, price: 3.99 }
    ],
    totalPrice: 15.97,
    paymentInfo: {
      method: 'online',
      status: 'paid',
      paymentReference: 'PAY_003_2024',
      paidAt: new Date('2024-01-13T15:45:00Z')
    },
    orderStatus: 'delivered',
    deliveredAt: new Date('2024-01-15T10:30:00Z'),
    createdAt: new Date('2024-01-13T15:45:00Z')
  },
  {
    orderItems: [
      { productIndex: 15, name: 'Artisan Sourdough Bread', quantity: 1, price: 4.99 },
      { productIndex: 16, name: 'Chocolate Chip Cookies', quantity: 1, price: 6.99 }
    ],
    totalPrice: 11.98,
    paymentInfo: {
      method: 'cash',
      status: 'pending',
      paymentReference: '',
      paidAt: null
    },
    orderStatus: 'processing',
    deliveredAt: null,
    createdAt: new Date('2024-01-14T08:30:00Z')
  },
  {
    orderItems: [
      { productIndex: 5, name: 'Wild Caught Salmon Fillet', quantity: 2, price: 12.99 },
      { productIndex: 12, name: 'Frozen Blueberries', quantity: 1, price: 5.99 }
    ],
    totalPrice: 31.97,
    paymentInfo: {
      method: 'online',
      status: 'paid',
      paymentReference: 'PAY_004_2024',
      paidAt: new Date('2024-01-15T12:15:00Z')
    },
    orderStatus: 'confirmed',
    deliveredAt: null,
    createdAt: new Date('2024-01-15T12:15:00Z')
  },
  {
    orderItems: [
      { productIndex: 9, name: 'Sparkling Water Variety Pack', quantity: 2, price: 6.99 },
      { productIndex: 8, name: 'Fresh Orange Juice', quantity: 1, price: 4.49 }
    ],
    totalPrice: 18.47,
    paymentInfo: {
      method: 'online',
      status: 'paid',
      paymentReference: 'PAY_005_2024',
      paidAt: new Date('2024-01-16T14:20:00Z')
    },
    orderStatus: 'delivered',
    deliveredAt: new Date('2024-01-18T16:00:00Z'),
    createdAt: new Date('2024-01-16T14:20:00Z')
  },
  {
    orderItems: [
      { productIndex: 17, name: 'Organic Protein Powder', quantity: 1, price: 24.99 }
    ],
    totalPrice: 24.99,
    paymentInfo: {
      method: 'cash',
      status: 'pending',
      paymentReference: '',
      paidAt: null
    },
    orderStatus: 'pending',
    deliveredAt: null,
    createdAt: new Date('2024-01-17T10:45:00Z')
  },
  {
    orderItems: [
      { productIndex: 19, name: 'Premium Paper Towels', quantity: 1, price: 8.99 },
      { productIndex: 18, name: 'Multivitamin Gummies', quantity: 1, price: 12.99 }
    ],
    totalPrice: 21.98,
    paymentInfo: {
      method: 'online',
      status: 'paid',
      paymentReference: 'PAY_006_2024',
      paidAt: new Date('2024-01-18T13:30:00Z')
    },
    orderStatus: 'shipped',
    deliveredAt: null,
    createdAt: new Date('2024-01-18T13:30:00Z')
  },
  {
    orderItems: [
      { productIndex: 13, name: 'Frozen Vegetable Medley', quantity: 3, price: 3.49 },
      { productIndex: 14, name: 'Eco-Friendly Dish Soap', quantity: 1, price: 3.99 }
    ],
    totalPrice: 14.46,
    paymentInfo: {
      method: 'online',
      status: 'paid',
      paymentReference: 'PAY_007_2024',
      paidAt: new Date('2024-01-19T09:15:00Z')
    },
    orderStatus: 'confirmed',
    deliveredAt: null,
    createdAt: new Date('2024-01-19T09:15:00Z')
  },
  {
    orderItems: [
      { productIndex: 0, name: 'Organic Bananas', quantity: 3, price: 2.99 },
      { productIndex: 1, name: 'Fresh Spinach Leaves', quantity: 1, price: 3.99 },
      { productIndex: 2, name: 'Whole Milk Gallon', quantity: 1, price: 4.29 }
    ],
    totalPrice: 17.25,
    paymentInfo: {
      method: 'cash',
      status: 'pending',
      paymentReference: '',
      paidAt: null
    },
    orderStatus: 'processing',
    deliveredAt: null,
    createdAt: new Date('2024-01-20T11:00:00Z')
  },
  {
    orderItems: [
      { productIndex: 4, name: 'Grass-Fed Ground Beef', quantity: 2, price: 8.99 },
      { productIndex: 3, name: 'Free Range Eggs', quantity: 1, price: 5.99 }
    ],
    totalPrice: 23.97,
    paymentInfo: {
      method: 'online',
      status: 'paid',
      paymentReference: 'PAY_008_2024',
      paidAt: new Date('2024-01-21T16:45:00Z')
    },
    orderStatus: 'delivered',
    deliveredAt: new Date('2024-01-23T14:20:00Z'),
    createdAt: new Date('2024-01-21T16:45:00Z')
  },
  {
    orderItems: [
      { productIndex: 6, name: 'Organic Brown Rice', quantity: 1, price: 4.99 },
      { productIndex: 7, name: 'Extra Virgin Olive Oil', quantity: 1, price: 9.99 }
    ],
    totalPrice: 14.98,
    paymentInfo: {
      method: 'online',
      status: 'paid',
      paymentReference: 'PAY_009_2024',
      paidAt: new Date('2024-01-22T12:30:00Z')
    },
    orderStatus: 'shipped',
    deliveredAt: null,
    createdAt: new Date('2024-01-22T12:30:00Z')
  },
  {
    orderItems: [
      { productIndex: 10, name: 'Organic Dark Chocolate', quantity: 4, price: 3.99 },
      { productIndex: 11, name: 'Mixed Nuts Trail Mix', quantity: 1, price: 7.99 }
    ],
    totalPrice: 23.95,
    paymentInfo: {
      method: 'cash',
      status: 'pending',
      paymentReference: '',
      paidAt: null
    },
    orderStatus: 'confirmed',
    deliveredAt: null,
    createdAt: new Date('2024-01-23T14:15:00Z')
  },
  {
    orderItems: [
      { productIndex: 15, name: 'Artisan Sourdough Bread', quantity: 2, price: 4.99 },
      { productIndex: 8, name: 'Fresh Orange Juice', quantity: 1, price: 4.49 }
    ],
    totalPrice: 14.47,
    paymentInfo: {
      method: 'online',
      status: 'paid',
      paymentReference: 'PAY_010_2024',
      paidAt: new Date('2024-01-24T10:20:00Z')
    },
    orderStatus: 'processing',
    deliveredAt: null,
    createdAt: new Date('2024-01-24T10:20:00Z')
  },
  {
    orderItems: [
      { productIndex: 5, name: 'Wild Caught Salmon Fillet', quantity: 1, price: 12.99 },
      { productIndex: 12, name: 'Frozen Blueberries', quantity: 2, price: 5.99 },
      { productIndex: 13, name: 'Frozen Vegetable Medley', quantity: 1, price: 3.49 }
    ],
    totalPrice: 28.46,
    paymentInfo: {
      method: 'online',
      status: 'paid',
      paymentReference: 'PAY_011_2024',
      paidAt: new Date('2024-01-25T15:40:00Z')
    },
    orderStatus: 'confirmed',
    deliveredAt: null,
    createdAt: new Date('2024-01-25T15:40:00Z')
  },
  {
    orderItems: [
      { productIndex: 17, name: 'Organic Protein Powder', quantity: 1, price: 24.99 },
      { productIndex: 18, name: 'Multivitamin Gummies', quantity: 1, price: 12.99 }
    ],
    totalPrice: 37.98,
    paymentInfo: {
      method: 'cash',
      status: 'pending',
      paymentReference: '',
      paidAt: null
    },
    orderStatus: 'pending',
    deliveredAt: null,
    createdAt: new Date('2024-01-26T09:30:00Z')
  },
  {
    orderItems: [
      { productIndex: 9, name: 'Sparkling Water Variety Pack', quantity: 1, price: 6.99 },
      { productIndex: 16, name: 'Chocolate Chip Cookies', quantity: 2, price: 6.99 }
    ],
    totalPrice: 20.97,
    paymentInfo: {
      method: 'online',
      status: 'paid',
      paymentReference: 'PAY_012_2024',
      paidAt: new Date('2024-01-27T13:25:00Z')
    },
    orderStatus: 'delivered',
    deliveredAt: new Date('2024-01-29T11:15:00Z'),
    createdAt: new Date('2024-01-27T13:25:00Z')
  },
  {
    orderItems: [
      { productIndex: 19, name: 'Premium Paper Towels', quantity: 2, price: 8.99 },
      { productIndex: 14, name: 'Eco-Friendly Dish Soap', quantity: 2, price: 3.99 }
    ],
    totalPrice: 25.96,
    paymentInfo: {
      method: 'online',
      status: 'paid',
      paymentReference: 'PAY_013_2024',
      paidAt: new Date('2024-01-28T16:50:00Z')
    },
    orderStatus: 'shipped',
    deliveredAt: null,
    createdAt: new Date('2024-01-28T16:50:00Z')
  },
  {
    orderItems: [
      { productIndex: 0, name: 'Organic Bananas', quantity: 1, price: 2.99 },
      { productIndex: 2, name: 'Whole Milk Gallon', quantity: 2, price: 4.29 },
      { productIndex: 3, name: 'Free Range Eggs', quantity: 1, price: 5.99 }
    ],
    totalPrice: 17.56,
    paymentInfo: {
      method: 'cash',
      status: 'pending',
      paymentReference: '',
      paidAt: null
    },
    orderStatus: 'confirmed',
    deliveredAt: null,
    createdAt: new Date('2024-01-29T08:45:00Z')
  }
];
