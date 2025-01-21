const { addReview } = require("../models/reviewModel");
//customer to input the review
const addReviewController = (req, res) => {
    const { bookingId, comments, rating } = req.body;
    const { id: customerId } = req.user; 

    
    console.log("customerId from token:", customerId);

    if (!customerId) {
        return res.status(400).json({ error: "Customer ID is missing in the request." });
    }

    if (!bookingId || !comments || !rating) {
        return res.status(400).json({ error: "All fields are required." });
    }

    addReview(bookingId, customerId, comments, rating, (err, results) => {
        if (err) {
            console.error("Error inserting review:", err);
            return res.status(500).json({ error: "An error occurred while saving the review." });
        }

        res.status(201).json({ message: "Review added successfully!", reviewId: results.insertId });
    });
};

module.exports = { addReviewController };
