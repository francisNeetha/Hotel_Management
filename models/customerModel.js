const { query } = require("express");
const { connection } = require("../database/connection");

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

        connection.query(sql, values, (err, results) => {
            if (err) {
                reject(new Error(err.message || "An unknown error occurred"));
            } 
            if (results.affectedRows === 0) {
                return resolve(null);
            }
            resolve(results);
            
            
        });
    });
};

const customers = (callback) => {
    connection.query("SELECT * FROM customers", callback);
};

const getCustomerById = (id, callback) => {
    const query = "SELECT * FROM customers WHERE id = ?";
    connection.query(query, [id], callback);
};

const addCustomer = (data, callback) => {
    const query =
        "INSERT INTO customers (name, email, phone, address, password, role) VALUES (?, ?, ?, ?, ?, ?)";
    connection.query(
        query,
        [data.name, data.email, data.phone, data.address, data.password,  data.role],
        callback
    );
};

const addCustomers = (customer) => {
    return new Promise((resolve, reject) => {
        const query = "INSERT INTO customers (name, email, password, phone, address, role) VALUES (?, ?, ?, ?, ?, ?)";
        connection.query(
            query,
            [customer.name, customer.email, customer.password, customer.phone, customer.address, customer.role],
            (err, results) => {
                if (err) {
                    return reject(new Error(err.message || "Database Error"));
                }
                resolve(results);
            }
            
        );
    });
};

const deleteCustomer = (id, callback) => {
    const query = "DELETE FROM customers WHERE id = ?";
    connection.query(query, [id], callback);
};

const updateCustomer = (query, values, callback) => {
    connection.query(query, values, callback);
};

const getAdminByEmail = (email, callback) => {
    const query = "SELECT * FROM staff WHERE email = ?";
    connection.query(query, [email], (err, results) => {
        if (err) return callback(err);
        callback(null, results[0]); 
    });
};

const getAllCustomers = (callback) => {
    const query = "SELECT * FROM staff";
    connection.query(query, (err, results) => {
        if (err) {
            return callback(err, null);
        }
        callback(null, results);
    });
};

const getCustomerByEmail = (email, callback) => {
    const query = "SELECT * FROM customers WHERE email = ?";
    connection.query(query, [email], (err, results) => {
        if (err) return callback(err);
        callback(null, results[0]); 
    });
};

module.exports = {
    customers,
    getCustomerById,
    addCustomer,
    deleteCustomer,
    updateCustomer,
   getAdminByEmail,
   getCustomerByEmail,
   getAllCustomers, 
   addCustomers, 
    createBooking
};
