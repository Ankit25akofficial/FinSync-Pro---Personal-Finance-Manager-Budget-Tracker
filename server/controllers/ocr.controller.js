import Tesseract from 'tesseract.js';
import pdfParse from 'pdf-parse';
import fs from 'fs';
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

// OCR processing for images
export const processImageOCR = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const user = await getOrCreateUser(
      req.user.userId,
      req.user.email,
      req.user.firstName,
      req.user.lastName
    );

    // Process OCR
    const { data: { text } } = await Tesseract.recognize(req.file.path, 'eng', {
      logger: m => console.log(m)
    });

    // Parse text to extract transactions (simplified - you can enhance this)
    const lines = text.split('\n').filter(line => line.trim());
    const transactions = [];

    // Simple regex patterns to extract amounts and dates
    const amountPattern = /₹?\s*(\d{1,3}(?:,\d{2,3})*(?:\.\d{2})?)/g;
    const datePattern = /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/g;

    lines.forEach((line, index) => {
      const amounts = line.match(amountPattern);
      const dates = line.match(datePattern);
      
      if (amounts && amounts.length > 0) {
        const amount = parseFloat(amounts[0].replace(/[₹,]/g, ''));
        const date = dates ? new Date(dates[0]) : new Date();
        
        transactions.push({
          description: line.substring(0, 50),
          amount,
          date,
          category: 'Other', // AI categorization can be added
          type: amount > 0 ? 'expense' : 'income'
        });
      }
    });

    // Clean up file
    fs.unlinkSync(req.file.path);

    res.json({
      success: true,
      data: {
        extractedText: text,
        transactions,
        count: transactions.length
      }
    });
  } catch (error) {
    next(error);
  }
};

// PDF processing
export const processPDF = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const user = await getOrCreateUser(
      req.user.userId,
      req.user.email,
      req.user.firstName,
      req.user.lastName
    );

    const dataBuffer = fs.readFileSync(req.file.path);
    const pdfData = await pdfParse(dataBuffer);
    const text = pdfData.text;

    // Parse transactions from PDF text
    const lines = text.split('\n').filter(line => line.trim());
    const transactions = [];

    const amountPattern = /₹?\s*(\d{1,3}(?:,\d{2,3})*(?:\.\d{2})?)/g;
    const datePattern = /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/g;

    lines.forEach((line) => {
      const amounts = line.match(amountPattern);
      const dates = line.match(datePattern);
      
      if (amounts && amounts.length > 0) {
        const amount = parseFloat(amounts[0].replace(/[₹,]/g, ''));
        const date = dates ? new Date(dates[0]) : new Date();
        
        transactions.push({
          description: line.substring(0, 50),
          amount,
          date,
          category: 'Other',
          type: amount > 0 ? 'expense' : 'income'
        });
      }
    });

    // Clean up file
    fs.unlinkSync(req.file.path);

    res.json({
      success: true,
      data: {
        extractedText: text,
        transactions,
        count: transactions.length
      }
    });
  } catch (error) {
    next(error);
  }
};

// Auto-import transactions from OCR results
export const importOCRTransactions = async (req, res, next) => {
  try {
    const user = await getOrCreateUser(
      req.user.userId,
      req.user.email,
      req.user.firstName,
      req.user.lastName
    );

    const { transactions } = req.body;

    if (!Array.isArray(transactions)) {
      return res.status(400).json({ error: 'Transactions must be an array' });
    }

    const createdTransactions = await Transaction.insertMany(
      transactions.map(t => ({
        ...t,
        userId: user._id,
        aiCategorized: true
      }))
    );

    req.app.get('io').to(`user-${user._id}`).emit('transactions-imported', {
      count: createdTransactions.length
    });

    res.status(201).json({
      success: true,
      data: createdTransactions,
      count: createdTransactions.length
    });
  } catch (error) {
    next(error);
  }
};

