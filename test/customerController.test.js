const customerModel = require("../models/customerModel"); 
const customerController = require("../controllers/customerController");
const jwt = require('jsonwebtoken');
const { getCustomerBookings } = require("../controllers/customerController");
const { getAllBookings } = require("../controllers/customerController");
const { updateCustomer } = require("../controllers/customerController");
const bcrypt = require("bcrypt");
const { login } = require("../controllers/customerController");
jest.mock("../models/customerModel"); 
jest.mock("bcrypt");
jest.mock("jsonwebtoken");

afterEach(() => {
    jest.clearAllMocks();
});

afterAll(() => {
    jest.resetAllMocks();
});


describe("Customer Controller Tests", () => {
    
    it("should fetch all customers", () => {
        const mockData = [
            { id: 3, name: "Greasy Burger", email: "Greasy@gmail.com", phone: "9986665452", address: "Keskuskatu 45" }
        ];

        customerModel.customers.mockImplementation((callback) => {
            callback(null, mockData);
        });

        const req = {};
        const res = {
            writeHead: jest.fn(),
            end: jest.fn(),
        };

        customerController.customers(req, res);

        expect(res.writeHead).toHaveBeenCalledWith(200, { "Content-Type": "application/json" });
        expect(res.end).toHaveBeenCalledWith(JSON.stringify(mockData));
    });

    it("should return an error when fetching customers fails", () => {
        customerModel.customers.mockImplementation((callback) => {
            callback(new Error("Database error"), null);
        });

        const req = {};
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        customerController.customers(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: "Failed to fetch customers." });
    });

    it("should retrieve a customer by ID successfully", () => {
        const mockId = 1;
        const mockResult = [
            { id: mockId, name: "John Doe", email: "john@example.com", phone: "1234567890", address: "meskatu 45" }
        ];

        customerModel.getCustomerById.mockImplementation((id, callback) => {
            callback(null, mockResult);
        });

        const req = { params: { id: mockId } };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        customerController.getCustomerById(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(mockResult[0]);
    });

    it("should return an error when database fails", () => {
        const mockId = 1;

        customerModel.getCustomerById.mockImplementation((id, callback) => {
            callback(new Error("Database error"), null);
        });

        const req = { params: { id: mockId } };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        customerController.getCustomerById(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: "Failed to retrieve customer." });
    });

    it("should add a new customer successfully", () => {
        const mockData = { name: "John Doe", email: "john@example.com", phone: "9876543210", address: "meskatu 45" ,password: "hfrhnmdj", role:"customer" };
        const mockResult = { insertId: 1 };

        customerModel.addCustomer.mockImplementation((data, callback) => {
            callback(null, mockResult);
        });

        const req = { body: mockData };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        customerController.addCustomer(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({ message: "Customer added successfully", customerId: 1 });
        
    });

    it("should delete a customer successfully", () => {
        const mockId = 1;
        const mockResult = { affectedRows: 1 };

        customerModel.deleteCustomer.mockImplementation((id, callback) => {
            callback(null, mockResult);
        });

        const req = { params: { id: mockId } };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        customerController.deleteCustomer(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ message: "Customer deleted successfully." });
    });

    it("should return an error when deleting a customer fails", () => {
        const mockId = 1;

        customerModel.deleteCustomer.mockImplementation((id, callback) => {
            callback(new Error("Database error"), null);
        });

        const req = { params: { id: mockId } };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        customerController.deleteCustomer(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: "Failed to delete customer." });
    });

    it("should return an error if customer not found during deletion", () => {
        const mockId = 1;
        const mockResult = { affectedRows: 0 };

        customerModel.deleteCustomer.mockImplementation((id, callback) => {
            callback(null, mockResult);
        });

        const req = { params: { id: mockId } };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        customerController.deleteCustomer(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ error: "Customer not found." });
    });

    it("should return an error when updating a customer with no data", () => {
        const mockId = 1;
        const mockData = {}; 
    
        const req = { params: { id: mockId }, body: mockData };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
    
        customerController.updateCustomer(req, res);
    
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: "At least one field is required to update." });  
    });

    it("should return an error if customer not found when fetching by ID", () => {
        const mockId = 999; 
    
        customerModel.getCustomerById.mockImplementation((id, callback) => {
            callback(null, []); 
        });
    
        const req = { params: { id: mockId } };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
    
        customerController.getCustomerById(req, res);
    
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ error: "Customer not found." });
    });

    it("should return an error when the email is already taken", () => {
        const mockData = { name: "Jane Doe", email: "john@example.com", phone: "9876543210", address: "123 Main St", password:"password123", role:"customer" }; 
    
        
        customerModel.addCustomer.mockImplementation((data, callback) => {
            callback(new Error("Email already in use"), null);
        });
    
        const req = { body: mockData };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
    
        customerController.addCustomer(req, res);
    
        expect(res.status).toHaveBeenCalledWith(500);  
        expect(res.json).toHaveBeenCalledWith({ error: "Email already in use." });
    });

    it("should return an error if customer not found while deleting", () => {
        const mockId = 1;
        const mockResult = { affectedRows: 0 };

        customerModel.deleteCustomer.mockImplementation((id, callback) => {
            callback(null, mockResult);
        });

        const req = { params: { id: mockId } };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        customerController.deleteCustomer(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ error: "Customer not found." });
    });

    

    it("should return an error when no fields are provided for update", () => {
        const mockId = 1;
        const mockData = {}; 

        const req = { params: { id: mockId }, body: mockData };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        customerController.updateCustomer(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: "At least one field is required to update." });
    });

    it("should return 400 if email or password is missing during login", () => {
        const req = { body: { email: "", password: "password" } }; 
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
    
        customerController.login(req, res);
    
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: "Email and password are required." });
    });

    it("should return 400 if required fields are missing", async () => {
        const invalidCustomer = { email: "john@example.com", phone: "1234567890", password: "password123" }; 
    
        const req = { body: invalidCustomer };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
    
        await customerController.signup(req, res);
    
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: "All fields are required." });
    });

    it("should return 500 if an error occurs during database insertion", async () => {
        const newCustomer = { name: "John Doe", email: "john@example.com", phone: "1234567890", password: "password123" };
    
        customerModel.addCustomers.mockRejectedValue(new Error("Database error")); 
    
        const req = { body: newCustomer };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
    
        await customerController.signup(req, res);
    
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: "An error occurred during signup." });
    });

    it("should return 400 if password is missing", async () => {
        const invalidCustomer = { name: "John Doe", email: "john@example.com", phone: "1234567890" }; 
    
        const req = { body: invalidCustomer };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
    
        await customerController.signup(req, res);
    
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: "All fields are required." });
    });

    it("should return 400 if any required fields are missing", async () => {
        const invalidBookingData = { 
            num_of_room: 2, 
            num_of_guest: 4, 
            checkin_date: "2025-01-20", 
        };
    
        const req = { 
            body: invalidBookingData,
            user: { id: 1 },
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
    
        await customerController.bookRoom(req, res);
    
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: "All fields are required." });
    });

    it("should return 400 when any required field is missing", async () => {
        const bookingData = { 
            num_of_room: 2, 
            num_of_guest: 4, 
            checkin_date: "2025-01-20", 
            room_id: 1 
        };
    
        const req = { 
            body: bookingData,
            user: { id: 1 }, 
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
    
        await customerController.bookRoom(req, res);
    
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: "All fields are required." });
    });
    

    it("should return 500 when there is an error while booking the room", async () => {
        const bookingData = { 
            num_of_room: 2, 
            num_of_guest: 4, 
            checkin_date: "2025-01-20", 
            checkout_date: "2025-01-25", 
            room_id: 1 
        };
    
        const req = { 
            body: bookingData,
            user: { id: 1 },
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
    
        customerModel.createBooking.mockRejectedValue(new Error("Database error"));
    
        await customerController.bookRoom(req, res);
    
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: "Failed to book room." });
    });

    it("should successfully book the room and return 201 status", async () => {
        const bookingData = { 
            num_of_room: 1, 
            num_of_guest: 2, 
            checkin_date: "2025-01-20", 
            checkout_date: "2025-01-25", 
            room_id: 1 
        };
    
        const req = { 
            body: bookingData,
            user: { id: 1 }, 
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
    
        customerModel.createBooking.mockResolvedValue({ insertId: 123 });
    
        await customerController.bookRoom(req, res);
    
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
            message: "Room booked successfully!",
            bookingId: 123
        });
    });
    
    
    it('should return 500 if there is an error fetching customers', async () => {
        const mockError = new Error('Database error');
        customerModel.customers.mockImplementationOnce((callback) => {
            callback(mockError, null); 
        });

        const req = {};
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        customerController.customers(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: "Failed to fetch customers." });
    }); 
    
    let req, res;

    beforeEach(() => {
        req = {
            user: { id: 1 }, 
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(), 
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should return customer bookings successfully", () => {
        const mockBookings = [
            { id: 1, bookingDate: "2025-01-20", customerId: 1 },
            { id: 2, bookingDate: "2025-01-21", customerId: 1 },
        ];

        customerModel.getBookingsByCustomerId.mockImplementation((customerId, callback) => {
            callback(null, mockBookings);
        });

        getCustomerBookings(req, res);

        expect(customerModel.getBookingsByCustomerId).toHaveBeenCalledWith(
            req.user.id,
            expect.any(Function)
        );
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(mockBookings);
    });

    it("should return 500 if there is an error retrieving bookings", () => {
        customerModel.getBookingsByCustomerId.mockImplementation((customerId, callback) => {
            callback(new Error("Database error"), null); 
        });

        getCustomerBookings(req, res);

        expect(customerModel.getBookingsByCustomerId).toHaveBeenCalledWith(
            req.user.id,
            expect.any(Function)
        );
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: "Failed to fetch customer bookings." });
    });

    it("should return 500 if no bookings are found", () => {
        customerModel.getBookingsByCustomerId.mockImplementation((customerId, callback) => {
            callback(null, null); 
        });

        getCustomerBookings(req, res);

        expect(customerModel.getBookingsByCustomerId).toHaveBeenCalledWith(
            req.user.id,
            expect.any(Function)
        );
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: "Failed to fetch customer bookings." });
    });
});


describe("getAllBookings", () => {
    let req, res;

    beforeEach(() => {
        req = {}; 
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(), 
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should return all bookings successfully", () => {
        const mockBookings = [
            { id: 1, bookingDate: "2025-01-20", customerId: 1 },
            { id: 2, bookingDate: "2025-01-21", customerId: 2 },
        ];

        customerModel.getBookings.mockImplementation((callback) => {
            callback(null, mockBookings); 
        });

        getAllBookings(req, res);

        expect(customerModel.getBookings).toHaveBeenCalledWith(expect.any(Function));
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(mockBookings);
    });

    it("should return 500 if there is an error retrieving bookings", () => {
        customerModel.getBookings.mockImplementation((callback) => {
            callback(new Error("Database error"), null);
        });

        getAllBookings(req, res);

        expect(customerModel.getBookings).toHaveBeenCalledWith(expect.any(Function));
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: "Failed to fetch bookings." });
    });

    it("should return 500 if no bookings are found", () => {
        customerModel.getBookings.mockImplementation((callback) => {
            callback(null, null); 
        });

        getAllBookings(req, res);

        expect(customerModel.getBookings).toHaveBeenCalledWith(expect.any(Function));
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: "Failed to fetch bookings." });
    });
});


describe("updateCustomer", () => {
    let req, res;

    beforeEach(() => {
        req = {
            params: { id: "1" },
            body: {},
            user: {},
        };

        res = {
            status: jest.fn().mockReturnThis(), 
            json: jest.fn(), 
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should return 400 if no fields are provided for update", () => {
        req.body = {};

        updateCustomer(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: "At least one field is required to update." });
    });

    it("should return 403 if a customer tries to update another customer's data", () => {
        req.user = { role: "customer", id: 2 }; 
        req.params.id = "1"; 
        req.body = { name: "New Name" };

        updateCustomer(req, res);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({ error: "You are not authorized to update this customer." });
    });

    it("should return 403 if an unauthorized role tries to update a customer", () => {
        req.user = { role: "guest" }; 
        req.body = { name: "New Name" };

        updateCustomer(req, res);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({ error: "Unauthorized role." });
    });

    it("should return 404 if the customer is not found during update", () => {
        req.user = { role: "admin" }; 
        req.body = { name: "New Name" };

        customerModel.updateCustomer.mockImplementation((query, values, callback) => {
            callback(null, { affectedRows: 0 }); 
        });

        updateCustomer(req, res);

        expect(customerModel.updateCustomer).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ error: "Customer not found." });
    });

    it("should update customer successfully for an admin", () => {
        req.user = { role: "admin" }; 
        req.body = { name: "New Name" };

        customerModel.updateCustomer.mockImplementation((query, values, callback) => {
            callback(null, { affectedRows: 1 }); 
        });

        updateCustomer(req, res);

        expect(customerModel.updateCustomer).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ message: "Customer updated successfully." });
    });

    it("should update customer successfully for the logged-in customer", () => {
        req.user = { role: "customer", id: 1 }; 
        req.params.id = "1"; 
        req.body = { email: "newemail@example.com" };

        customerModel.updateCustomer.mockImplementation((query, values, callback) => {
            callback(null, { affectedRows: 1 }); 
        });

        updateCustomer(req, res);

        expect(customerModel.updateCustomer).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ message: "Your data updated successfully." });
    });

    it("should return 500 if there is an error during the update", () => {
        req.user = { role: "admin" }; 
        req.body = { name: "New Name" };

        customerModel.updateCustomer.mockImplementation((query, values, callback) => {
            callback(new Error("Database error"), null); 
        });

        updateCustomer(req, res);

        expect(customerModel.updateCustomer).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: "Failed to update customer." });
    });
});

describe("login", () => {
    let req, res;

    beforeEach(() => {
        req = {
            body: {},
        };

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(), 
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should return 400 if email or password is missing", () => {
        req.body = { email: "", password: "" };

        login(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: "Email and password are required." });
    });

    it("should return 500 if there is a database error when fetching admin", () => {
        req.body = { email: "admin@example.com", password: "password" };

        customerModel.getAdminByEmail.mockImplementation((email, callback) => {
            callback(new Error("Database error"), null);
        });

        login(req, res);

        expect(customerModel.getAdminByEmail).toHaveBeenCalledWith("admin@example.com", expect.any(Function));
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: "Database error." });
    });

    it("should return 500 if there is an error comparing admin passwords", () => {
        req.body = { email: "admin@example.com", password: "password" };

        customerModel.getAdminByEmail.mockImplementation((email, callback) => {
            callback(null, { id: 1, email: "admin@example.com", password: "hashedPassword" });
        });

        bcrypt.compare.mockImplementation((plainText, hash, callback) => {
            callback(new Error("Compare error"), null);
        });

        login(req, res);

        expect(bcrypt.compare).toHaveBeenCalledWith("password", "hashedPassword", expect.any(Function));
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: "Error comparing passwords." });
    });

    it("should return 401 if admin password is invalid", () => {
        req.body = { email: "admin@example.com", password: "password" };

        customerModel.getAdminByEmail.mockImplementation((email, callback) => {
            callback(null, { id: 1, email: "admin@example.com", password: "hashedPassword" });
        });

        bcrypt.compare.mockImplementation((plainText, hash, callback) => {
            callback(null, false); 
        });

        login(req, res);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: "Invalid credentials." });
    });

    it("should return 500 if fetching customers for admin fails", () => {
        req.body = { email: "admin@example.com", password: "password" };

        customerModel.getAdminByEmail.mockImplementation((email, callback) => {
            callback(null, { id: 1, email: "admin@example.com", password: "hashedPassword" });
        });

        bcrypt.compare.mockImplementation((plainText, hash, callback) => {
            callback(null, true); 
        });

        jwt.sign.mockReturnValue("adminToken");

        customerModel.customers.mockImplementation((callback) => {
            callback(new Error("Database error"), null);
        });

        login(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: "Failed to fetch customers." });
    });

    it("should return 200 and admin token with customers on successful admin login", () => {
        req.body = { email: "admin@example.com", password: "password" };

        customerModel.getAdminByEmail.mockImplementation((email, callback) => {
            callback(null, { id: 1, email: "admin@example.com", password: "hashedPassword" });
        });

        bcrypt.compare.mockImplementation((plainText, hash, callback) => {
            callback(null, true); 
        });

        jwt.sign.mockReturnValue("adminToken");

        customerModel.customers.mockImplementation((callback) => {
            callback(null, [{ id: 1, name: "Customer 1" }]);
        });

        login(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: "Login successful.",
            role: "admin",
            token: "adminToken",
            customers: [{ id: 1, name: "Customer 1" }],
        });
    });

    it("should return 404 if customer is not found", () => {
        req.body = { email: "user@example.com", password: "password" };

        customerModel.getAdminByEmail.mockImplementation((email, callback) => {
            callback(null, null); 
        });

        customerModel.getCustomerByEmail.mockImplementation((email, callback) => {
            callback(null, null); 
        });

        login(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ error: "User not found." });
    });

    it("should return 200 and customer token on successful customer login", () => {
        req.body = { email: "user@example.com", password: "password" };

        customerModel.getAdminByEmail.mockImplementation((email, callback) => {
            callback(null, null); 
        });

        customerModel.getCustomerByEmail.mockImplementation((email, callback) => {
            callback(null, { id: 2, email: "user@example.com", password: "hashedPassword" });
        });

        bcrypt.compare.mockImplementation((plainText, hash, callback) => {
            callback(null, true); 
        });

        jwt.sign.mockReturnValue("customerToken");

        login(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: "Login successful.",
            role: "customer",
            token: "customerToken",
            customer: { id: 2, email: "user@example.com", password: "hashedPassword" },
        });
    });
});



