const express = require("express");
const router = express.Router();
const customerController = require("../controllers/customerController");
const { authenticateToken, review, adminOnly } = require("../middleware/authMiddleware");
const { verifyAdmin } = require("../middleware/authMiddleware");
const { verifyUser } = require("../middleware/authMiddleware");
const { authbooking } = require("../middleware/authMiddleware");
const { addReviewController } = require("../controllers/reviewController");
const { reviewauth } = require("../middleware/authMiddleware");
const { getAllReviews } = require("../controllers/reviewController");


router.get("/", customerController.customers);

router.get("/:id", customerController.getCustomerById);

router.post("/", customerController.addCustomer);

router.post("/login", customerController.login);

router.post("/signup", customerController.signup);

router.post("/book-room", authenticateToken, customerController.bookRoom);

router.delete("/:id",verifyAdmin, customerController.deleteCustomer);

router.put("/:id",verifyUser, customerController.updateCustomer);

router.post("/add", verifyUser, addReviewController);

module.exports = router;
