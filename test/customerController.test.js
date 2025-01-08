const customerModel = require("../models/customerModel"); 
const customerController = require("../controllers/customerController");

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
        const mockData = { name: "John Doe", email: "john@example.com", phone: "9876543210", address: "meskatu 45" };
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

    it("should return an error when adding a customer fails", () => {
        const mockData = { name: "John Doe", email: "john@example.com", phone: "9876543210", address: "meskatu 45" };

        customerModel.addCustomer.mockImplementation((data, callback) => {
            callback(new Error("Database error"), null);
        });

        const req = { body: mockData };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        customerController.addCustomer(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: "Failed to add customer." });
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
        const mockId = 999;
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
        const mockData = { name: "Updated Customer", email: "updated@example.com", phone: "1234567890",address: "mesatu 45" };
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
        const mockData = { name: "Updated Customer", email: "updated@example.com", phone: "1234567890", address: "meskatu 45" };

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
    
});
