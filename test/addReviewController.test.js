const { addReviewController } = require("../controllers/reviewController");
const { addReview } = require("../models/reviewModel");

jest.mock("../models/reviewModel"); 

describe("addReviewController", () => {
    let req, res;

    beforeEach(() => {
        req = {
            body: {},
            user: {}
        };

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
    });

    it("should return 400 if customerId is missing", () => {
        req.user = {}; 

        addReviewController(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            error: "Customer ID is missing in the request."
        });
    });

    it("should return 400 if required fields are missing", () => {
        req.user = { id: 24 }; 
        req.body = {};

        addReviewController(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            error: "All fields are required."
        });
    });

    it("should return 201 and reviewId on successful review insertion", () => {
        req.user = { id: 24 };
        req.body = {
            bookingId: 1,
            comments: "Great stay!",
            rating: 5
        };

        const mockResults = { insertId: 101 };
        addReview.mockImplementation((bookingId, customerId, comments, rating, callback) => {
            callback(null, mockResults); 
        });

        addReviewController(req, res);

        expect(addReview).toHaveBeenCalledWith(
            1,
            24,
            "Great stay!",
            5,
            expect.any(Function)
        );
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
            message: "Review added successfully!",
            reviewId: 101
        });
    });

    it("should return 500 if there is a database error", () => {
        req.user = { id: 24 };
        req.body = {
            bookingId: 1,
            comments: "Great stay!",
            rating: 5
        };

        addReview.mockImplementation((bookingId, customerId, comments, rating, callback) => {
            callback(new Error("Database error"), null); 
        });

        addReviewController(req, res);

        expect(addReview).toHaveBeenCalledWith(
            1,
            24,
            "Great stay!",
            5,
            expect.any(Function)
        );
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            error: "An error occurred while saving the review."
        });
    });
});
