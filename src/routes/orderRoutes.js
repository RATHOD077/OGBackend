const express = require('express');
const { clientAuth } = require('../middleware/auth');
const { createOrder, getOrder } = require('../controllers/orderController');

const router = express.Router();

router.post('/', clientAuth, createOrder);
router.get('/:order_id', clientAuth, getOrder);

module.exports = router;