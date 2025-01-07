const express = require("express");
const router = express.Router();
const customerController = require("../controllers/customerController");

router.get("/", customerController.customers);

router.post("/", customerController.addCustomer);

router.delete("/:id", customerController.deleteCustomer);

router.put("/:id", customerController.updateCustomer);

module.exports = router;
