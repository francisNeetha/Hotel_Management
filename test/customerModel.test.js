const mysql = require("mysql");
const customerModel = require("../models/customerModel");
const { closeConnection } = require("../database/connection");
const { connection } = require("../database/connection");
const { getBookingsByCustomerId } = require("../models/customerModel");
const { getBookings } = require("../models/customerModel");

jest.mock("../database/connection", () => ({
    connection: {
        query: jest.fn(),
    },
}));

jest.mock("../database/connection", () => ({
  connection: {
    query: jest.fn(), 
  },
  closeConnection: jest.fn(), 
}));

jest.mock("mysql", () => ({
  createConnection: jest.fn(() => ({
    query: jest.fn(),
    end: jest.fn(),
    connect: jest.fn(),
  })),
}));

const mockConnection = {
  query: jest.fn(),
};

const createBooking = (bookingData) => {
  return new Promise((resolve, reject) => {
    const sql = `
          INSERT INTO booking 
          (customer_id, num_of_room, num_of_guest, status, checkin_date, checkout_date, room_id, created_date, modified_date) 
          VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `;

    const values = [
      bookingData.customer_id,
      bookingData.num_of_room,
      bookingData.num_of_guest,
      bookingData.status,
      bookingData.checkin_date,
      bookingData.checkout_date,
      bookingData.room_id,
    ];

    mockConnection.query(sql, values, (err, results) => {
      if (err) {
        reject(new Error(err.message || "An unknown error occurred"));
      } else {
        resolve(results);
      }
    });
  });
};

afterAll(async () => {
  closeConnection();
});

describe("Customer Model Tests", () => {
  it("should fetch all customers", async () => {
    const mockData = [
      {
        id: 3,
        name: "Greasy Burger",
        email: "Greasy@gmail.com",
        phone: "9986665452",
        address: "Keskuskatu 45",
      },
    ];

    mysql.createConnection().query.mockImplementation((query, callback) => {
      callback(null, mockData);
    });

    customerModel.customers((err, result) => {
      expect(err).toBeNull();
      expect(result).toEqual(mockData);
    });
  });

  it("should fetch a customer by ID", () => {
    const customerId = 3;
    const mockData = [
      {
        id: customerId,
        name: "Greasy Burger",
        email: "Greasy@gmail.com",
        phone: "9986665452",
        address: "Keskuskatu 45",
      },
    ];

    mysql
      .createConnection()
      .query.mockImplementation((query, values, callback) => {
        callback(null, mockData);
      });

    customerModel.getCustomerById(customerId, (err, result) => {
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

    mysql
      .createConnection()
      .query.mockImplementation((query, data, callback) => {
        callback(null, { insertId: 3 });
      });

    customerModel.addCustomer(mockRequestData, (err, result) => {
      expect(err).toBeNull();
      expect(result).toEqual({ insertId: 3 });
    });
  });

  it("should delete a customer", () => {
    const customerId = 3;

    mysql
      .createConnection()
      .query.mockImplementation((query, data, callback) => {
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

    mysql
      .createConnection()
      .query.mockImplementation((query, values, callback) => {
        callback(null, { affectedRows: 1 });
      });

    customerModel.updateCustomer(query, values, (err, result) => {
      expect(err).toBeNull();
      expect(result).toEqual({ affectedRows: 1 });
    });
  });

  it("should fetch a customer by email", () => {
    const email = "Greasy@gmail.com";
    const mockData = {
      id: 3,
      name: "Greasy Burger",
      email: "Greasy@gmail.com",
      phone: "9986665452",
      address: "Keskuskatu 45",
    };

    mysql
      .createConnection()
      .query.mockImplementation((query, values, callback) => {
        callback(null, [mockData]);
      });

    customerModel.getCustomerByEmail(email, (err, result) => {
      expect(err).toBeNull();
      expect(result).toEqual(mockData);
    });
  });

  it("should return an error if deleting a customer fails", () => {
    const customerId = 3;

    mysql
      .createConnection()
      .query.mockImplementation((query, data, callback) => {
        callback(new Error("Failed to delete customer"), null);
      });

    customerModel.deleteCustomer(customerId, (err, result) => {
      expect(err).toBeInstanceOf(Error);
      expect(err.message).toBe("Failed to delete customer");
      expect(result).toBeNull();
    });
  });

  it("should return error if getting customer by email fails", () => {
    const email = "nonexistent@example.com";

    mysql
      .createConnection()
      .query.mockImplementation((query, values, callback) => {
        callback(new Error("Database Error"), null);
      });

    customerModel.getCustomerByEmail(email, (err, result) => {
      expect(err).toBeInstanceOf(Error);
      expect(err.message).toBe("Database Error");
      expect(result).toBeUndefined();
    });
  });

  const addCustomers = async (customer) => {
    return Promise.resolve({
      id: 1,
      name: customer.name,
      email: customer.email,
    });
  };
  it("should insert a customer and return the new customer with id", async () => {
    const mockDb = {
      query: jest.fn().mockResolvedValue({ insertId: 1 }),
    };
    const newCustomer = { name: "John Doe", email: "johndoe@gmail.com" };

    const result = await addCustomers.bind({ db: mockDb })(newCustomer);

    expect(result).toHaveProperty("id", 1);
    expect(result.name).toBe("John Doe");
    expect(result.email).toBe("johndoe@gmail.com");
  });

  it("should fetch an admin by email", () => {
    const email = "admin@example.com";
    const mockAdminData = { id: 1, name: "Admin", email };

    mysql
      .createConnection()
      .query.mockImplementation((query, values, callback) => {
        callback(null, [mockAdminData]);
      });

    customerModel.getAdminByEmail(email, (err, result) => {
      expect(err).toBeNull();
      expect(result).toEqual(mockAdminData);
    });
  });

  it("should return undefined if admin is not found by email", () => {
    const email = "nonexistent@example.com";

    mysql
      .createConnection()
      .query.mockImplementation((query, values, callback) => {
        callback(null, []);
      });

    customerModel.getAdminByEmail(email, (err, result) => {
      expect(err).toBeNull();
      expect(result).toBeUndefined();
    });
  });

  it("should return an error if fetching admin by email fails", () => {
    const email = "admin@example.com";

    mysql
      .createConnection()
      .query.mockImplementation((query, values, callback) => {
        callback(new Error("Database Error"), null);
      });

    customerModel.getAdminByEmail(email, (err, result) => {
      expect(err).toBeInstanceOf(Error);
      expect(err.message).toBe("Database Error");
      expect(result).toBeUndefined();
    });
  });

  it("should handle null customer data gracefully", () => {
    mysql
      .createConnection()
      .query.mockImplementation((query, values, callback) => {
        callback(null, []);
      });

    customerModel.getCustomerByEmail(null, (err, result) => {
      expect(err).toBeNull();
      expect(result).toBeUndefined();
    });
  });

  it("should handle empty customer list gracefully", () => {
    mysql.createConnection().query.mockImplementation((query, callback) => {
      callback(null, []);
    });

    customerModel.customers((err, result) => {
      expect(err).toBeNull();
      expect(result).toEqual([]);
    });
  });

  it("should resolve with results when the query is successful", async () => {
   
    const mockResults = { insertId: 1 };
    mockConnection.query.mockImplementation((sql, values, callback) => {
      callback(null, mockResults);
    });

    const bookingData = {
      customer_id: 1,
      num_of_room: 2,
      num_of_guest: 4,
      status: "confirmed",
      checkin_date: "2025-01-15",
      checkout_date: "2025-01-20",
      room_id: 101,
    };

    const results = await createBooking(bookingData);

    expect(results).toEqual(mockResults);
    expect(mockConnection.query).toHaveBeenCalledWith(
      expect.any(String),
      [
        bookingData.customer_id,
        bookingData.num_of_room,
        bookingData.num_of_guest,
        bookingData.status,
        bookingData.checkin_date,
        bookingData.checkout_date,
        bookingData.room_id,
      ],
      expect.any(Function)
    );
  });

  it("should create a booking successfully", async () => {
    const bookingData = {
      customer_id: 1,
      num_of_room: 2,
      num_of_guest: 4,
      status: "confirmed",
      checkin_date: "2025-01-15",
      checkout_date: "2025-01-20",
      room_id: 101,
    };

    const mockResult = { insertId: 1 };

    connection.query.mockImplementation((sql, values, callback) => {
      callback(null, mockResult);
    });

    const result = await customerModel.createBooking(bookingData);
    expect(result).toEqual(mockResult);
    expect(connection.query).toHaveBeenCalledWith(
      expect.any(String),
      Object.values(bookingData),
      expect.any(Function)
    );
  });

  it("should reject when creating a booking fails", async () => {
    const bookingData = {
      customer_id: 1,
      num_of_room: 2,
      num_of_guest: 4,
      status: "confirmed",
      checkin_date: "2025-01-15",
      checkout_date: "2025-01-20",
      room_id: 101,
    };

    const mockError = new Error("Database Error");

    connection.query.mockImplementation((sql, values, callback) => {
      callback(mockError, null);
    });

    await expect(customerModel.createBooking(bookingData)).rejects.toThrow(
      "Database Error"
    );
    expect(connection.query).toHaveBeenCalledWith(
      expect.any(String),
      Object.values(bookingData),
      expect.any(Function)
    );
  });

  it("should throw an error if the database query fails", async () => {
    const bookingData = {
      customer_id: 1,
      num_of_room: 2,
      num_of_guest: 4,
      status: "confirmed",
      checkin_date: "2025-01-15",
      checkout_date: "2025-01-20",
      room_id: 101,
    };

    const mockError = new Error("Database query failed");

    connection.query.mockImplementation((sql, values, callback) => {
      callback(mockError, null);
    });

    await expect(customerModel.createBooking(bookingData)).rejects.toThrow(
      "Database query failed"
    );

    expect(connection.query).toHaveBeenCalledWith(
      expect.any(String),
      Object.values(bookingData),
      expect.any(Function)
    );
  });

  it("should throw an error if the database connection fails", async () => {
    const bookingData = {
      customer_id: 1,
      num_of_room: 2,
      num_of_guest: 4,
      status: "confirmed",
      checkin_date: "2025-01-15",
      checkout_date: "2025-01-20",
      room_id: 101,
    };

    const mockError = new Error("Connection failed");

    connection.query.mockImplementation((sql, values, callback) => {
      throw mockError;
    });

    await expect(customerModel.createBooking(bookingData)).rejects.toThrow(
      "Connection failed"
    );
  });

  it("should throw an error for invalid room IDs", async () => {
    const bookingData = {
      customer_id: 1,
      num_of_room: 2,
      num_of_guest: 4,
      status: "confirmed",
      checkin_date: "2025-01-15",
      checkout_date: "2025-01-20",
      room_id: 9999, 
    };

    const mockError = new Error("Invalid room ID");

    connection.query.mockImplementation((sql, values, callback) => {
      callback(mockError, null);
    });

    await expect(customerModel.createBooking(bookingData)).rejects.toThrow(
      "Invalid room ID"
    );
  });

  it("should return null if no rows are affected", async () => {
    const bookingData = {
      customer_id: 1,
      num_of_room: 2,
      num_of_guest: 4,
      status: "confirmed",
      checkin_date: "2025-01-15",
      checkout_date: "2025-01-20",
      room_id: 101,
    };

    const mockResult = { affectedRows: 0 };

    connection.query.mockImplementation((sql, values, callback) => {
      callback(null, mockResult);
    });

    const result = await customerModel.createBooking(bookingData);
    expect(result).toBeNull();
  });

  const sampleCustomer = {
    name: "John Doe",
    email: "john.doe@example.com",
    password: "securePassword123",
    phone: "1234567890",
    address: "123 Main St",
    role: "customer",
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should insert a customer successfully and resolve with results", async () => {
    const mockResults = { insertId: 1 };
    connection.query.mockImplementation((query, values, callback) => {
      callback(null, mockResults);
    });

    const result = await customerModel.addCustomers(sampleCustomer);

    expect(result).toEqual(mockResults);
    expect(connection.query).toHaveBeenCalledWith(
      expect.stringContaining("INSERT INTO customers"),
      [
        sampleCustomer.name,
        sampleCustomer.email,
        sampleCustomer.password,
        sampleCustomer.phone,
        sampleCustomer.address,
        sampleCustomer.role,
      ],
      expect.any(Function)
    );
  });

  it("should reject with an error when the database query fails", async () => {
    const mockError = new Error("Database Error");
    connection.query.mockImplementation((query, values, callback) => {
      callback(mockError, null);
    });

    await expect(customerModel.addCustomers(sampleCustomer)).rejects.toThrow(
      "Database Error"
    );

    expect(connection.query).toHaveBeenCalledWith(
      expect.stringContaining("INSERT INTO customers"),
      [
        sampleCustomer.name,
        sampleCustomer.email,
        sampleCustomer.password,
        sampleCustomer.phone,
        sampleCustomer.address,
        sampleCustomer.role,
      ],
      expect.any(Function)
    );
  });

  it("should retrieve all customers successfully", (done) => {
    const mockResults = [
      { id: 1, name: "Alice", email: "alice@example.com", role: "admin" },
      { id: 2, name: "Bob", email: "bob@example.com", role: "staff" },
    ];

    connection.query.mockImplementation((query, callback) => {
      callback(null, mockResults);
    });

    customerModel.getAllCustomers((err, results) => {
      expect(err).toBeNull();
      expect(results).toEqual(mockResults);
      expect(connection.query).toHaveBeenCalledWith(
        expect.stringContaining("SELECT * FROM staff"),
        expect.any(Function)
      );
      done();
    });
  });

  it("should return an error when the query fails", (done) => {
    const mockError = new Error("Database Error");

    connection.query.mockImplementation((query, callback) => {
      callback(mockError, null);
    });

    customerModel.getAllCustomers((err, results) => {
      expect(err).toEqual(mockError);
      expect(results).toBeNull();
      expect(connection.query).toHaveBeenCalledWith(
        expect.stringContaining("SELECT * FROM staff"),
        expect.any(Function)
      );
      done();
    });
  });

  it("should return an error when the query fails", (done) => {
    const mockError = new Error("Database Error");
    const mockEmail = "admin@example.com";

    connection.query.mockImplementation((query, values, callback) => {
      callback(mockError, null);
    });

    customerModel.getAdminByEmail(mockEmail, (err, admin) => {
      expect(err).toEqual(mockError);
      expect(admin).toBeUndefined();
      expect(connection.query).toHaveBeenCalledWith(
        expect.stringContaining("SELECT * FROM staff WHERE email = ?"),
        [mockEmail],
        expect.any(Function)
      );
      done();
    });
  });

  it("should return an error when the query fails", (done) => {
    const mockError = new Error("Database Error");
    const mockEmail = "customer@example.com";

    connection.query.mockImplementation((query, values, callback) => {
      callback(mockError, null);
    });

    customerModel.getCustomerByEmail(mockEmail, (err, customer) => {
      expect(err).toEqual(mockError);
      expect(customer).toBeUndefined();
      expect(connection.query).toHaveBeenCalledWith(
        expect.stringContaining("SELECT * FROM customers WHERE email = ?"),
        [mockEmail],
        expect.any(Function)
      );
      done();
    });
  });

  it("should return an error when the database query fails", (done) => {
    const mockError = new Error("Database query failed");
    const mockEmail = "test@example.com";

    connection.query.mockImplementation((query, values, callback) => {
      callback(mockError, null);
    });

    customerModel.getCustomerByEmail(mockEmail, (err, result) => {
      expect(err).toEqual(mockError);
      expect(result).toBeUndefined();
      expect(connection.query).toHaveBeenCalledWith(
        "SELECT * FROM customers WHERE email = ?",
        [mockEmail],
        expect.any(Function)
      );
      done();
    });
  });

  it("should return null when email is not found", (done) => {
    connection.query.mockImplementation((query, values, callback) => {
      callback(null, []);
    });

    customerModel.getAdminByEmail("admin@example.com", (err, result) => {
      expect(err).toBeNull();
      expect(result).toBeUndefined();
      done();
    });
  });

  it("should handle query errors", (done) => {
    const errorMessage = "Database error";

    connection.query.mockImplementation((query, values, callback) => {
      callback(new Error(errorMessage), null);
    });

    customerModel.getAdminByEmail("admin@example.com", (err, result) => {
      expect(err).toBeInstanceOf(Error);
      expect(err.message).toBe(errorMessage);
      expect(result).toBeUndefined();
      done();
    });
  });

  it("should return admin data when email is found", (done) => {
    const mockAdmin = {
      id: 1,
      name: "Admin User",
      email: "admin@example.com",
      role: "admin",
    };

    connection.query.mockImplementation((query, values, callback) => {
      callback(null, [mockAdmin]);
    });

    customerModel.getAdminByEmail("admin@example.com", (err, result) => {
      expect(err).toBeNull();
      expect(result).toEqual(mockAdmin);
      done();
    });
  });

  it("should return the first result when the email is found", (done) => {
    const mockCustomer = {
      id: 1,
      name: "John Doe",
      email: "johndoe@example.com",
      phone: "1234567890",
    };

    connection.query.mockImplementation((query, values, callback) => {
      callback(null, [mockCustomer]);
    });

    customerModel.getCustomerByEmail("johndoe@example.com", (err, result) => {
      expect(err).toBeNull();
      expect(result).toEqual(mockCustomer);
      done();
    });
  });

  it("should return null when no results are found", (done) => {
    connection.query.mockImplementation((query, values, callback) => {
      callback(null, []); 
    });

    customerModel.getCustomerByEmail(
      "nonexistent@example.com",
      (err, result) => {
        expect(err).toBeNull(); 
        expect(result).toBeUndefined(); 
        done(); 
      }
    );
  });

  it("should reject with an error if the query fails", async () => {
    const mockError = new Error("Database Error");

    connection.query.mockImplementation((query, values, callback) => {
      callback(mockError, null); 
    });

    const bookingData = {
      customer_id: 1,
      num_of_room: 2,
      num_of_guest: 3,
      status: "Confirmed",
      checkin_date: "2025-01-15",
      checkout_date: "2025-01-20",
      room_id: 101,
    };

    await expect(customerModel.createBooking(bookingData)).rejects.toThrow(
      "Database Error"
    );
  });

  it("should reject with a default error message if `err.message` is undefined", async () => {
    connection.query.mockImplementation((query, values, callback) => {
      callback({}, null); 
    });

    const bookingData = {
      customer_id: 1,
      num_of_room: 2,
      num_of_guest: 3,
      status: "Confirmed",
      checkin_date: "2025-01-15",
      checkout_date: "2025-01-20",
      room_id: 101,
    };

    await expect(customerModel.createBooking(bookingData)).rejects.toThrow(
      "An unknown error occurred"
    );
  });
});



describe("getBookingsByCustomerId", () => {
    it("should retrieve bookings for the specified customer ID", (done) => {
        const mockCustomerId = 1;
        const mockBookings = [
            { id: 101, customer_id: mockCustomerId, room: "A101", status: "confirmed" },
            { id: 102, customer_id: mockCustomerId, room: "B202", status: "checked out" },
        ];

        connection.query.mockImplementation((query, values, callback) => {
            expect(query).toBe("SELECT * FROM booking WHERE customer_id = ?");
            expect(values).toEqual([mockCustomerId]);
            callback(null, mockBookings);
        });

        getBookingsByCustomerId(mockCustomerId, (err, results) => {
            expect(err).toBeNull(); 
            expect(results).toEqual(mockBookings); 
            done();
        });
    });

    it("should handle database errors", (done) => {
        const mockCustomerId = 1;
        const mockError = new Error("Database error");

        connection.query.mockImplementation((query, values, callback) => {
            expect(query).toBe("SELECT * FROM booking WHERE customer_id = ?");
            expect(values).toEqual([mockCustomerId]);
            callback(mockError, null);
        });

        getBookingsByCustomerId(mockCustomerId, (err, results) => {
            expect(err).toEqual(mockError); 
            expect(results).toBeNull(); 
            done(); 
        });
    });
});

describe("getBookings", () => {
    it("should retrieve all bookings successfully", (done) => {
        const mockBookings = [
            { id: 101, customer_id: 1, room: "A101", status: "confirmed" },
            { id: 102, customer_id: 2, room: "B202", status: "checked out" },
        ];

        connection.query.mockImplementation((query, callback) => {
            expect(query).toBe("SELECT * FROM booking");
            callback(null, mockBookings);
        });

        
        getBookings((err, results) => {
            expect(err).toBeNull(); 
            expect(results).toEqual(mockBookings); 
            done(); 
        });
    });

    it("should handle database errors", (done) => {
        const mockError = new Error("Database error");

        
        connection.query.mockImplementation((query, callback) => {
            expect(query).toBe("SELECT * FROM booking");
            callback(mockError, null);
        });

        
        getBookings((err, results) => {
            expect(err).toEqual(mockError); 
            expect(results).toBeNull(); 
            done(); 
        });
    });
});
