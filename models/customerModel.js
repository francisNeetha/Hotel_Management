const { query } = require("express");
const { connection } = require("../database/connection");

const customers = (callback) => {
    connection.query("SELECT * FROM customers", callback);
};

const getCustomerById = (id, callback) => {
    const query = "SELECT * FROM customers WHERE id = ?";
    connection.query(query, [id], callback);
};

const addCustomer = (data, callback) => {
    const query =
        "INSERT INTO customers (name, email, phone, address) VALUES (?, ?, ?, ?)";
    connection.query(
        query,
        [data.name, data.email, data.phone, data.address],
        callback
    );
};

const deleteCustomer = (id, callback) => {
    const query = "DELETE FROM customers WHERE id = ?";
    connection.query(query, [id], callback);
};

const updateCustomer = (query, values, callback) => {
    connection.query(query, values, callback);
};

module.exports = {
    customers,
    getCustomerById,
    addCustomer,
    deleteCustomer,
    updateCustomer,
};
