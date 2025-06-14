const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/send', authMiddleware, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { toEmail, amount } = req.body;
    const numericAmount = Number(amount);

    if (!toEmail || !numericAmount || numericAmount <= 0) {
      await session.abortTransaction();
      return res.status(400).json({ error: 'Invalid recipient or amount.' });
    }

    const fromUser = await User.findById(req.userId).session(session);
    if (fromUser.balance < numericAmount) {
      await session.abortTransaction();
      return res.status(400).json({ error: 'Insufficient funds.' });
    }

    const toUser = await User.findOne({ email: toEmail }).session(session);
    if (!toUser) {
      await session.abortTransaction();
      return res.status(404).json({ error: 'Recipient not found.' });
    }

    if (fromUser.email === toUser.email) {
      await session.abortTransaction();
      return res.status(400).json({ error: 'You cannot send money to yourself.' });
    }

    fromUser.balance -= numericAmount;
    toUser.balance += numericAmount;

    await fromUser.save({ session });
    await toUser.save({ session });

    const transaction = new Transaction({
      from: fromUser._id,
      to: toUser._id,
      amount: numericAmount,
      status: 'completed',
    });
    await transaction.save({ session });

    await session.commitTransaction();
    res.json({ message: 'Transaction successful' });

  } catch (err) {
    await session.abortTransaction();
    console.error('Transaction Error:', err);
    res.status(500).json({ error: 'Transaction failed due to a server error.' });
  } finally {
    session.endSession();
  }
});


// REQUEST MONEY ENDPOINT 
router.post('/request', authMiddleware, async (req, res) => {
  const { fromEmail, amount } = req.body;
  const numericAmount = Number(amount);

  if (!fromEmail || !numericAmount || numericAmount <= 0) {
    return res.status(400).json({ error: 'Invalid email or amount.' });
  }

  try {
    const fromUser = await User.findOne({ email: fromEmail });
    if (!fromUser) {
      return res.status(404).json({ error: 'User to request from not found.' });
    }
    
    const toUser = await User.findById(req.userId);

    if (fromUser.email === toUser.email) {
      return res.status(400).json({ error: 'You cannot request money from yourself.' });
    }

    const transaction = new Transaction({
      from: fromUser._id, 
      to: toUser._id,     
      amount: numericAmount,
      status: 'pending', 
    });

    await transaction.save();
    res.status(201).json({ message: 'Money request sent successfully.' });

  } catch (err) {
    console.error('Request Money Error:', err);
    res.status(500).json({ error: 'Server error while sending request.' });
  }
});


// APPROVE A PENDING REQUEST
router.post('/request/:id/approve', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const transaction = await Transaction.findById(id).session(session);
    if (!transaction) {
      await session.abortTransaction();
      return res.status(404).json({ error: 'Request not found.' });
    }
   
    if (transaction.from.toString() !== req.userId) {
      await session.abortTransaction();
      return res.status(403).json({ error: 'You are not authorized to approve this request.' });
    }
    if (transaction.status !== 'pending') {
      await session.abortTransaction();
      return res.status(400).json({ error: 'This request is no longer pending.' });
    }

    
    const fromUser = await User.findById(req.userId).session(session);
    const toUser = await User.findById(transaction.to).session(session);
    
    if (fromUser.balance < transaction.amount) {
      await session.abortTransaction();
      return res.status(400).json({ error: 'Insufficient funds to approve request.' });
    }
    
    fromUser.balance -= transaction.amount;
    toUser.balance += transaction.amount;
    transaction.status = 'completed';

    await fromUser.save({ session });
    await toUser.save({ session });
    await transaction.save({ session });

    await session.commitTransaction();
    res.json({ message: 'Request approved and transaction completed.' });
  } catch(err) {
    await session.abortTransaction();
    console.error('Approve Request Error:', err);
    res.status(500).json({ error: 'Failed to approve request.' });
  } finally {
    session.endSession();
  }
});


// DECLINE A PENDING REQUEST 
router.post('/request/:id/decline', authMiddleware, async (req, res) => {
    const { id } = req.params;
    try {
        const transaction = await Transaction.findById(id);
        if (!transaction) {
            return res.status(404).json({ error: 'Request not found.' });
        }
        if (transaction.from.toString() !== req.userId) {
            return res.status(403).json({ error: 'You are not authorized to decline this request.' });
        }
        if (transaction.status !== 'pending') {
            return res.status(400).json({ error: 'This request is no longer pending.' });
        }
        
        transaction.status = 'declined';
        await transaction.save();
        
        res.json({ message: 'Request declined.' });
    } catch (err) {
        console.error('Decline Request Error:', err);
        res.status(500).json({ error: 'Failed to decline request.' });
    }
});


// GET RECENT TRANSACTIONS 
router.get('/recent', authMiddleware, async (req, res) => {
  try {
    const transactions = await Transaction.find({
      $or: [{ from: req.userId }, { to: req.userId }]
    })
    .sort({ timestamp: -1 })
    .limit(20)
    .populate('from', 'firstName lastName')
    .populate('to', 'firstName lastName');
    
    
    
    const formattedTransactions = transactions
      .filter(tx => tx.from && tx.to) 
      .map(tx => {
        const isSender = tx.from._id.toString() === req.userId;
        const otherParty = isSender ? tx.to : tx.from;
        let description = '';

        if (tx.status === 'completed') {
          description = isSender ? `Payment to ${otherParty.firstName}` : `Payment from ${otherParty.firstName}`;
        } else if (tx.status === 'pending') {
          description = isSender ? `You have a pending request to ${otherParty.firstName}` : `Request from ${otherParty.firstName}`;
        } else if (tx.status === 'declined') {
          description = isSender ? `Your request to ${otherParty.firstName} was declined` : `You declined a request from ${otherParty.firstName}`;
        }

        return {
          id: tx._id,
          description: description,
          date: tx.timestamp.toISOString().split('T')[0],
          amount: tx.amount,
          type: isSender ? 'debit' : 'credit',
          status: tx.status,
          otherParty: {
            firstName: otherParty.firstName,
            lastName: otherParty.lastName,
          }
        };
      });

    res.json(formattedTransactions);
  } catch (err) {
    console.error('History Fetch Error:', err)
    res.status(500).json({ error: 'Could not fetch transaction history' });
  }
});

module.exports = router;


// REQUESTS FOR NOTIFICATION BELL 
router.get('/pending', authMiddleware, async (req, res) => {
  try {
    
    
    const pendingRequests = await Transaction.find({
      from: req.userId,
      status: 'pending'
    })
    .sort({ timestamp: -1 })
    .populate('to', 'firstName lastName email'); 

    res.json(pendingRequests);
  } catch (err) {
    console.error('Fetch Pending Requests Error:', err);
    res.status(500).json({ error: 'Could not fetch pending requests.' });
  }
});


module.exports = router;