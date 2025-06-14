const express = require('express');
const QRCode = require('qrcode');
const router = express.Router();

router.post('/generate', async (req, res) => {
  const { data } = req.body;
  try {
    const qr = await QRCode.toDataURL(JSON.stringify(data));
    res.json({ qr });
  } catch (err) {
    res.status(500).json({ error: 'QR generation failed' });
  }
});

module.exports = router;
