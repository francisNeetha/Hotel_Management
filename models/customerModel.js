const { query } = require("express");
const {connection} = require("../database/connection");

const customers = (callback) => {
    connection.query("SELECT * FROM customers", callback);
}

const addCustomer = (data, callback) => {
    const query = "INSERT INTO customers (id, name, email, phone, address) VALUES (?, ?, ?, ?, ?)";
    connection.query(query, [data.id, data.name, data.email, data.phone, data.address], callback);
};

const deleteCustomer = (id, callback) => {
    const query = "DELETE FROM customers WHERE id = ?";
    connection.query(query, [id], callback);
};

const updateCustomer = (query, values, callback) => {
    connection.query(query, values, callback);
};


module.exports = {customers,
    addCustomer,
    deleteCustomer,
    updateCustomer
}