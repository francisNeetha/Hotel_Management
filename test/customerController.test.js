const customerModel = require("../models/customerModel"); 
const customerController = require("../controllers/customerController");
const jwt = require('jsonwebtoken');


jest.mock("../models/customerModel"); 

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

    it("should update a customer's details successfully", () => {
        const mockId = 1;
        const mockData = { name: "Updated Customer", email: "updated@example.com", phone: "1234567890",address: "mesatu 45",password: "hfrhnmdj", role:"customer" };
        const mockResult = { affectedRows: 1 };

        customerModel.updateCustomer.mockImplementation((id, data, callback) => {
            callback(null, mockResult);
        });

        const req = { params: { id: mockId }, body: mockData };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        customerController.updateCustomer(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ message: "Customer updated successfully." });
    });


    it("should return an error when updating a customer fails", () => {
        const mockId = 1;
        const mockData = { name: "Updated Customer", email: "updated@example.com", phone: "1234567890", address: "meskatu 45" ,password: "hfrhnmdj", role:"customer"};

        customerModel.updateCustomer.mockImplementation((id, data, callback) => {
            callback(new Error("Database error"), null);
        });

        const req = { params: { id: mockId }, body: mockData };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        customerController.updateCustomer(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: "Failed to update customer." });
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

    it("should update a customer successfully", () => {
        const mockId = 1;
        const mockData = { name: "Updated Name", phone: "9876543210" };
        const mockResult = { affectedRows: 1 };

        customerModel.updateCustomer.mockImplementation((query, values, callback) => {
            callback(null, mockResult);
        });

        const req = { params: { id: mockId }, body: mockData };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        customerController.updateCustomer(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ message: "Customer updated successfully." });
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

    it("should login successfully as admin", () => {
        const mockAdmin = { id: 1, email: "admin@example.com", password: "adminpass" };
        const mockCustomers = [
            { id: 1, name: "John Doe", email: "john@example.com" }
        ];

        customerModel.getAdminByEmail.mockImplementation((email, callback) => {
            callback(null, mockAdmin);
        });
        customerModel.customers.mockImplementation((callback) => {
            callback(null, mockCustomers);
        });

        const req = { body: { email: "admin@example.com", password: "adminpass" } };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        customerController.login(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: "Login successful.",
            role: "admin",
            token: expect.any(String),
            customers: mockCustomers
        });
    });
    
    it("should return an error if login credentials are incorrect", () => {
        const mockCustomer = { id: 1, email: "john@example.com", password: "customerpass" };

        customerModel.getCustomerByEmail.mockImplementation((email, callback) => {
            callback(null, mockCustomer);
        });

        const req = { body: { email: "john@example.com", password: "wrongpass" } };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        customerController.login(req, res);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: "Invalid credentials." });
    });

    it("should return 401 if the password is incorrect during login", () => {
        const mockCustomer = { id: 1, email: "customer@example.com", password: "correctPassword" };
        
        customerModel.getCustomerByEmail.mockImplementation((email, callback) => {
            callback(null, mockCustomer); 
        });
    
        const req = { body: { email: "customer@example.com", password: "wrongPassword" } };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
    
        customerController.login(req, res);
    
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: "Invalid credentials." });
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

    it("should return 401 if the customer password is incorrect", () => {
        const mockCustomer = { id: 1, email: "customer@example.com", password: "correctPassword" };
    
        customerModel.getCustomerByEmail.mockImplementation((email, callback) => {
            callback(null, mockCustomer); 
        });
    
        const req = { body: { email: "customer@example.com", password: "wrongPassword" } };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
    
        customerController.login(req, res);
    
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: "Invalid credentials." });
    });
    

    it("should return 200 if admin logs in successfully", () => {
        const mockAdmin = { id: 1, email: "admin@example.com", password: "adminPassword" };
    
        customerModel.getAdminByEmail.mockImplementation((email, callback) => {
            callback(null, mockAdmin); 
        });
    
        const req = { body: { email: "admin@example.com", password: "adminPassword" } };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
    
        customerController.login(req, res);
    
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                message: "Login successful.",
                role: "admin",
                customers: expect.anything(), 
            })
        );
    });

    it("should return 201 and a token if the signup is successful", async () => {
        const newCustomer = { name: "John Doe", email: "john@example.com", phone: "1234567890", password: "password123" };
    
        customerModel.addCustomers.mockResolvedValue({ insertId: 1 }); 
    
        const req = { body: newCustomer };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
    
        await customerController.signup(req, res);
    
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Customer registered successfully.", token: expect.any(String) }));
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
    
    
    it("should return 401 if the password is incorrect", async () => {
        const customer = { id: 1, email: "user@example.com", password: "password" };
    
        customerModel.getCustomerByEmail.mockImplementation((email, callback) => {
            callback(null, customer); 
        });
    
        const req = { body: { email: "user@example.com", password: "wrongpassword" } };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
    
        await customerController.login(req, res);
    
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: "Invalid credentials." });
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

        await customerController.customers(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: "Failed to fetch customers." });
    });

    


    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    

    
});
