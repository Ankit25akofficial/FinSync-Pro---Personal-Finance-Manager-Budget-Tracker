import Transaction from '../models/Transaction.model.js';
import Budget from '../models/Budget.model.js';
import User from '../models/User.model.js';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';

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

// Export transactions as Excel
export const exportExcel = async (req, res, next) => {
  try {
    const user = await getOrCreateUser(
      req.user.userId,
      req.user.email,
      req.user.firstName,
      req.user.lastName
    );

    const { startDate, endDate } = req.query;
    const query = { userId: user._id };
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const transactions = await Transaction.find(query).sort({ date: -1 });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Transactions');

    worksheet.columns = [
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Type', key: 'type', width: 10 },
      { header: 'Category', key: 'category', width: 15 },
      { header: 'Amount', key: 'amount', width: 15 },
      { header: 'Description', key: 'description', width: 30 },
      { header: 'Payment Method', key: 'paymentMethod', width: 15 }
    ];

    transactions.forEach(transaction => {
      worksheet.addRow({
        date: transaction.date.toLocaleDateString(),
        type: transaction.type,
        category: transaction.category,
        amount: transaction.amount,
        description: transaction.description || '',
        paymentMethod: transaction.paymentMethod || ''
      });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=transactions-${Date.now()}.xlsx`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    next(error);
  }
};

// Export transactions as CSV
export const exportCSV = async (req, res, next) => {
  try {
    const user = await getOrCreateUser(
      req.user.userId,
      req.user.email,
      req.user.firstName,
      req.user.lastName
    );

    const { startDate, endDate } = req.query;
    const query = { userId: user._id };
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const transactions = await Transaction.find(query).sort({ date: -1 });

    let csv = 'Date,Type,Category,Amount,Description,Payment Method\n';
    transactions.forEach(t => {
      csv += `${t.date.toLocaleDateString()},${t.type},${t.category},${t.amount},"${t.description || ''}",${t.paymentMethod || ''}\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=transactions-${Date.now()}.csv`);
    res.send(csv);
  } catch (error) {
    next(error);
  }
};

// Export transactions as PDF
export const exportPDF = async (req, res, next) => {
  try {
    const user = await getOrCreateUser(
      req.user.userId,
      req.user.email,
      req.user.firstName,
      req.user.lastName
    );

    const { startDate, endDate } = req.query;
    const query = { userId: user._id };
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const transactions = await Transaction.find(query).sort({ date: -1 });

    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=transactions-${Date.now()}.pdf`);

    doc.pipe(res);

    doc.fontSize(20).text('Transaction Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Generated on: ${new Date().toLocaleDateString()}`);
    doc.moveDown();

    transactions.forEach((t, index) => {
      doc.fontSize(10)
        .text(`${index + 1}. ${t.date.toLocaleDateString()} - ${t.type.toUpperCase()} - ${t.category}`, { continued: false })
        .text(`   Amount: ₹${t.amount}`, { indent: 20 })
        .text(`   Description: ${t.description || 'N/A'}`, { indent: 20 });
      doc.moveDown(0.5);
    });

    doc.end();
  } catch (error) {
    next(error);
  }
};

