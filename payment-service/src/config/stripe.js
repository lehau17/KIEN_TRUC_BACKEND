const Stripe = require('stripe');
require('dotenv').config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_51RP3KlRBrdlMwluluj3XpIJ2NeEnAXzYpoDKgdlyuAvYmvzTATtCJrYuxoMX3OljuXwkzYH5sceljhDX31WAeVvR00CbnKuC61", {
    apiVersion: '2023-10-16',
});

module.exports = stripe;
