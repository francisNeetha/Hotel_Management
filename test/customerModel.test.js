const mysql = require("mysql"); 
const customerModel = require("../models/customerModel");
const { closeConnection } = require("../database/connection");

jest.mock("mysql", () => ({
  createConnection: jest.fn(() => ({
    query: jest.fn(), 
    end: jest.fn(),   
    connect: jest.fn(),
  })),
}));

afterAll(async () => {
  await closeConnection();
});

describe("Customer Model Tests", () => {

  it("should fetch all customers", async () => {
    const mockData = [
      { id: 3, name: "Greasy Burger", email: "Greasy@gmail.com", phone: "9986665452", address: "Keskuskatu 45" },
    ];
  
    mysql.createConnection().query.mockImplementation((query, callback) => {
      callback(null, mockData);
    });
  
    await customerModel.customers((err, result) => {
      expect(err).toBeNull();
      expect(result).toEqual(mockData);
    });
  });

  it("should add a new customer", () => {
    const mockRequestData = {
      id: 3,
      name: "Greasy Burger",
      email: "Greasy@gmail.com",
      phone: "9986665452",
      address: "Keskuskatu 45",
    };

    mysql.createConnection().query.mockImplementation((query, data, callback) => {
      callback(null, { insertId: 3 });
    });

    customerModel.addCustomer(mockRequestData, (err, result) => {
      expect(err).toBeNull();
      expect(result).toEqual({ insertId: 3 });
    });
  });

  it("should delete a customer", () => {
    const customerId = 3;

    mysql.createConnection().query.mockImplementation((query, data, callback) => {
      callback(null, { affectedRows: 1 });
    });

    customerModel.deleteCustomer(customerId, (err, result) => {
      expect(err).toBeNull();
      expect(result).toEqual({ affectedRows: 1 });
    });
  });

  it("should update a customer", () => {
    const customerId = 3;
    const updateData = {
      name: "Updated Name",
      email: "updated.email@gmail.com",
      phone: "9986665432",
      address: "New Address 123",
    };

    const query = `UPDATE customers SET name = ?, email = ?, phone = ?, address = ? WHERE id = ?`;
    const values = [
      updateData.name,
      updateData.email,
      updateData.phone,
      updateData.address,
      customerId,
    ];

    mysql.createConnection().query.mockImplementation((query, values, callback) => {
      callback(null, { affectedRows: 1 });
    });

    customerModel.updateCustomer(query, values, (err, result) => {
      expect(err).toBeNull();
      expect(result).toEqual({ affectedRows: 1 });
    });
  });

});
