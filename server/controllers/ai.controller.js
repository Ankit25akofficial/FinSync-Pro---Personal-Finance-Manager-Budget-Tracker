import axios from 'axios';
import Transaction from '../models/Transaction.model.js';
import User from '../models/User.model.js';

const getOrCreateUser = async (clerkUserId, email, firstName, lastName) => {
  let user = await User.findOne({ clerkUserId });
  if (!user) {
    user = await User.create({
      clerkUserId,
      email,
      firstName,
      lastName,
      role: 'user'
    });
  }
  return user;
};

// AI Chatbot for finance questions
export const chatWithAI = async (req, res, next) => {
  try {
    const user = await getOrCreateUser(
      req.user.userId,
      req.user.email,
      req.user.firstName,
      req.user.lastName
    );

    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Get user's financial data for context
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const transactions = await Transaction.find({
      userId: user._id,
      date: { $gte: startOfMonth }
    });

    const monthlyIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const monthlyExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const categorySpending = {};
    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        categorySpending[t.category] = (categorySpending[t.category] || 0) + t.amount;
      });

    const context = `
      User's Financial Summary:
      - Monthly Income: ₹${monthlyIncome}
      - Monthly Expenses: ₹${monthlyExpenses}
      - Monthly Savings: ₹${monthlyIncome - monthlyExpenses}
      - Top Spending Categories: ${Object.entries(categorySpending)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([cat, amt]) => `${cat}: ₹${amt}`)
        .join(', ')}
    `;

    // If OpenAI API key is available, use it
    if (process.env.OPENAI_API_KEY) {
      try {
        const response = await axios.post(
          'https://api.openai.com/v1/chat/completions',
          {
            model: 'gpt-3.5-turbo',
            messages: [
              {
                role: 'system',
                content: 'You are a helpful personal finance assistant. Answer questions based on the user\'s financial data provided in the context.'
              },
              {
                role: 'user',
                content: `Context: ${context}\n\nUser Question: ${message}`
              }
            ],
            max_tokens: 500
          },
          {
            headers: {
              'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
              'Content-Type': 'application/json'
            }
          }
        );

        return res.json({
          success: true,
          data: {
            response: response.data.choices[0].message.content,
            context: context
          }
        });
      } catch (error) {
        console.error('OpenAI API Error:', error.message);
      }
    }

    // Fallback response without AI
    const lowerMessage = message.toLowerCase();
    let response = '';

    if (lowerMessage.includes('spend') || lowerMessage.includes('expense')) {
      response = `You have spent ₹${monthlyExpenses} this month. Your top spending category is ${Object.entries(categorySpending).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'}.`;
    } else if (lowerMessage.includes('income') || lowerMessage.includes('earn')) {
      response = `Your monthly income is ₹${monthlyIncome}.`;
    } else if (lowerMessage.includes('save') || lowerMessage.includes('saving')) {
      response = `You have saved ₹${monthlyIncome - monthlyExpenses} this month. That's ${monthlyIncome > 0 ? ((monthlyIncome - monthlyExpenses) / monthlyIncome * 100).toFixed(1) : 0}% of your income.`;
    } else if (lowerMessage.includes('category') || lowerMessage.includes('categories')) {
      const topCategories = Object.entries(categorySpending)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([cat, amt]) => `${cat} (₹${amt})`)
        .join(', ');
      response = `Your top spending categories are: ${topCategories || 'No expenses yet'}.`;
    } else {
      response = `Based on your financial data: Income ₹${monthlyIncome}, Expenses ₹${monthlyExpenses}, Savings ₹${monthlyIncome - monthlyExpenses}. How can I help you manage your finances better?`;
    }

    res.json({
      success: true,
      data: {
        response,
        context: context
      }
    });
  } catch (error) {
    next(error);
  }
};

// Auto-categorize expense using AI
export const autoCategorize = async (req, res, next) => {
  try {
    const { description } = req.body;

    if (!description) {
      return res.status(400).json({ error: 'Description is required' });
    }

    const categories = [
      'Food', 'Rent', 'Travel', 'Bills', 'Shopping', 'Entertainment',
      'Healthcare', 'Education', 'Food Delivery', 'Transport', 'Utilities', 'Subscriptions'
    ];

    // Simple keyword-based categorization (can be enhanced with AI)
    const lowerDesc = description.toLowerCase();
    let category = 'Other';

    if (lowerDesc.includes('domino') || lowerDesc.includes('pizza') || lowerDesc.includes('restaurant') || lowerDesc.includes('food') || lowerDesc.includes('dining')) {
      category = 'Food';
    } else if (lowerDesc.includes('uber') || lowerDesc.includes('ola') || lowerDesc.includes('taxi') || lowerDesc.includes('cab') || lowerDesc.includes('flight') || lowerDesc.includes('train') || lowerDesc.includes('hotel')) {
      category = 'Travel';
    } else if (lowerDesc.includes('zomato') || lowerDesc.includes('swiggy') || lowerDesc.includes('delivery') || lowerDesc.includes('food delivery')) {
      category = 'Food Delivery';
    } else if (lowerDesc.includes('metro') || lowerDesc.includes('bus') || lowerDesc.includes('auto') || lowerDesc.includes('rickshaw') || lowerDesc.includes('transport') || lowerDesc.includes('fuel') || lowerDesc.includes('petrol') || lowerDesc.includes('diesel')) {
      category = 'Transport';
    } else if (lowerDesc.includes('amazon') || lowerDesc.includes('flipkart') || lowerDesc.includes('shop') || lowerDesc.includes('mall')) {
      category = 'Shopping';
    } else if (lowerDesc.includes('netflix') || lowerDesc.includes('spotify') || lowerDesc.includes('subscription') || lowerDesc.includes('prime') || lowerDesc.includes('disney') || lowerDesc.includes('youtube premium')) {
      category = 'Subscriptions';
    } else if (lowerDesc.includes('rent') || lowerDesc.includes('house') || lowerDesc.includes('apartment')) {
      category = 'Rent';
    } else if (lowerDesc.includes('electricity') || lowerDesc.includes('water') || lowerDesc.includes('bill') || lowerDesc.includes('gas bill')) {
      category = 'Bills';
    } else if (lowerDesc.includes('internet') || lowerDesc.includes('wifi') || lowerDesc.includes('broadband') || lowerDesc.includes('mobile') || lowerDesc.includes('phone bill')) {
      category = 'Utilities';
    } else if (lowerDesc.includes('hospital') || lowerDesc.includes('doctor') || lowerDesc.includes('medicine') || lowerDesc.includes('pharmacy') || lowerDesc.includes('medical')) {
      category = 'Healthcare';
    }

    res.json({
      success: true,
      data: {
        category,
        confidence: 0.8
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get spending suggestions
export const getSpendingSuggestions = async (req, res, next) => {
  try {
    const user = await getOrCreateUser(
      req.user.userId,
      req.user.email,
      req.user.firstName,
      req.user.lastName
    );

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const transactions = await Transaction.find({
      userId: user._id,
      type: 'expense',
      date: { $gte: startOfMonth }
    });

    const categorySpending = {};
    transactions.forEach(t => {
      categorySpending[t.category] = (categorySpending[t.category] || 0) + t.amount;
    });

    const suggestions = [];
    const avgSpending = Object.values(categorySpending).reduce((a, b) => a + b, 0) / Object.keys(categorySpending).length || 0;

    Object.entries(categorySpending).forEach(([category, amount]) => {
      if (amount > avgSpending * 1.5) {
        suggestions.push({
          category,
          currentSpending: amount,
          suggestion: `Consider reducing spending in ${category}. You're spending ${((amount / Object.values(categorySpending).reduce((a, b) => a + b, 0)) * 100).toFixed(1)}% of your budget here.`,
          potentialSavings: amount * 0.2 // Suggest 20% reduction
        });
      }
    });

    res.json({
      success: true,
      data: suggestions
    });
  } catch (error) {
    next(error);
  }
};

