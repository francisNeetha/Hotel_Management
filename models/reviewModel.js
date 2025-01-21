const { connection } = require("../database/connection");

const addReview = (bookingId, customerId, comments, rating, callback) => {
    const query = `
        INSERT INTO review (booking_id, customer_id, comments, created_date, rating)
        VALUES (?, ?, ?, NOW(), ?)
    `;

    const values = [bookingId, customerId, comments, rating];

    connection.query(query, values, callback);
};

module.exports = { addReview };
