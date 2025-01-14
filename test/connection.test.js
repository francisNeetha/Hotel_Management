const { connection, closeConnection } = require('../database/connection'); 
const mysql = require('mysql');
jest.mock('mysql', () => ({
    createConnection: jest.fn(() => ({
        connect: jest.fn(),
        end: jest.fn(),
    })),
}));

jest.mock('mysql');

describe("closeConnection", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should call connection.end() when connection exists", () => {
        closeConnection();

        expect(connection.end).toHaveBeenCalled();
    });
});
