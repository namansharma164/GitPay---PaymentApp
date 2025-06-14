//routes/qr.js
const express = require('express');
const router = express.Router();
const qr = require('qr-image');
const authMiddleware = require('../middleware/auth');
const User = require('../models/User');

router.get('/generate', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('email');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const payload = {
      email: user.email,
    };

    const jsonPayload = JSON.stringify(payload);
    console.log("Generating QR Code with this exact data:", jsonPayload);

    // Generate and send the image.
    const qr_code = qr.image(jsonPayload, { type: 'png', margin: 1 });
    res.type('png');
    qr_code.pipe(res);

  } catch (err) {
    console.error('QR Generation Error:', err);
    res.status(500).json({ error: 'Error generating QR code' });
  }
});

module.exports = router;
