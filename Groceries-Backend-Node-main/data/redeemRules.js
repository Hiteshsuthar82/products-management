const redeemRules = [
  {
    name: "Small Order Bonus",
    description: "Earn points for orders over $50",
    minOrderValue: 50,
    redeemPoints: 10,
    isActive: true
  },
  {
    name: "Medium Order Bonus",
    description: "Earn points for orders over $100",
    minOrderValue: 100,
    redeemPoints: 25,
    isActive: true
  },
  {
    name: "Large Order Bonus",
    description: "Earn points for orders over $200",
    minOrderValue: 200,
    redeemPoints: 60,
    isActive: true
  },
  {
    name: "Premium Order Bonus",
    description: "Earn points for orders over $500",
    minOrderValue: 500,
    redeemPoints: 150,
    isActive: true
  },
  {
    name: "VIP Order Bonus",
    description: "Earn points for orders over $1000",
    minOrderValue: 1000,
    redeemPoints: 300,
    isActive: true
  }
];

module.exports = redeemRules;
