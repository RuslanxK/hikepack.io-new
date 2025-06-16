const express = require('express');
const axios = require('axios');
const router = express.Router();
require('dotenv').config();

const PRINTIFY_API_TOKEN = process.env.PRINTIFY_API_TOKEN;
const SHOP_ID = '22520921';

router.post('/create-order', async (req, res) => {
  try {
    const {
      line_items,
      shipping_method,
      send_shipping_notification,
      address_to,
      external_id,
      label,
    } = req.body;

    console.log(line_items)

    // Validate and sanitize line items
    const safeLineItems = line_items.map((item) => ({
      product_id: String(item.product_id).trim(),
      variant_id: item.variant_id,
      quantity: item.quantity,
    }));

    const payload = {
      external_id,
      label,
      line_items: safeLineItems,
      shipping_method,
      send_shipping_notification,
      address_to,
    };

    const response = await axios.post(
      `https://api.printify.com/v1/shops/${SHOP_ID}/orders.json`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${PRINTIFY_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    res.status(201).json(response.data);
  } catch (error) {
    console.error('Printify Order Error:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Failed to create order',
      details: error.response?.data || error.message,
    });
  }
});

module.exports = router;
