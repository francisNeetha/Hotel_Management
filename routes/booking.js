const express = require("express");
const router = express.Router();
const customerController = require("../controllers/customerController");
const { auth, adminOnly } = require("../middleware/authMiddleware");

router.get("/admin/booking", auth, adminOnly, customerController.getAllBookings);

router.get("/customer/booking", auth, customerController.getCustomerBookings);

module.exports = router;