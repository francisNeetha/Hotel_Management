const express = require("express");
const router = express.Router();
const customerController = require("../controllers/customerController");
const { authenticateToken } = require("../middleware/authMiddleware");

router.get("/", customerController.customers);

router.get("/:id", customerController.getCustomerById);

router.post("/", customerController.addCustomer);

router.post("/login", customerController.login);

router.post("/signup", customerController.signup);

 router.post("/book-room", authenticateToken, customerController.bookRoom);

router.delete("/:id", customerController.deleteCustomer);

router.put("/:id", customerController.updateCustomer);

module.exports = router;
