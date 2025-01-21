const { addReview } = require("../models/reviewModel");
const { connection } = require("../database/connection");

jest.mock("../database/connection");

describe("addReview", () => {
    it("should execute the correct query with the provided values", () => {
        const bookingId = 1;
        const customerId = 24;
        const comments = "Great service!";
        const rating = 5;

        const mockCallback = jest.fn(); 

        addReview(bookingId, customerId, comments, rating, mockCallback);

        const expectedQuery = `
        INSERT INTO review (booking_id, customer_id, comments, created_date, rating)
        VALUES (?, ?, ?, NOW(), ?)
    `;
        const expectedValues = [bookingId, customerId, comments, rating];

        expect(connection.query).toHaveBeenCalledWith(
            expectedQuery,
            expectedValues,
            mockCallback
        );
    });

    it("should call the callback with an error if the query fails", () => {
        const bookingId = 1;
        const customerId = 24;
        const comments = "Great service!";
        const rating = 5;

        const mockError = new Error("Database error");
        const mockCallback = jest.fn();

        connection.query.mockImplementation((query, values, callback) => {
            callback(mockError, null);
        });

        addReview(bookingId, customerId, comments, rating, mockCallback);

        expect(mockCallback).toHaveBeenCalledWith(mockError, null);
    });

    it("should call the callback with results if the query succeeds", () => {
        const bookingId = 1;
        const customerId = 24;
        const comments = "Great service!";
        const rating = 5;

        const mockResults = { insertId: 101 };
        const mockCallback = jest.fn();

        connection.query.mockImplementation((query, values, callback) => {
            callback(null, mockResults);
        });

        addReview(bookingId, customerId, comments, rating, mockCallback);

        expect(mockCallback).toHaveBeenCalledWith(null, mockResults);
    });
});
