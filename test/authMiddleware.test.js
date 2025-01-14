const { authenticateToken } = require('../middleware/authMiddleware');
const jwt = require('jsonwebtoken');

jest.mock('jsonwebtoken');  

describe('authenticateToken middleware', () => {
    it('should return an error if no token is provided', () => {
        const req = { headers: {} }; 
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        const next = jest.fn();

        authenticateToken(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);  
        expect(res.json).toHaveBeenCalledWith({ error: "No token provided." });
        expect(next).not.toHaveBeenCalled();  
    });

    it('should return an error if token is invalid or expired', () => {
        const req = { headers: { authorization: 'Bearer invalid_token' } };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        const next = jest.fn();

    
        jwt.verify.mockImplementation((token, secret, callback) => {
            callback(new Error('Invalid token'), null); 
        });

        authenticateToken(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403); 
        expect(res.json).toHaveBeenCalledWith({ error: "Invalid or expired token." });
        expect(next).not.toHaveBeenCalled();  
    });

    it('should call next() if the token is valid', () => {
        const req = { headers: { authorization: 'Bearer valid_token' } };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        const next = jest.fn();

    
        const mockUser = { id: 1, username: 'testuser' };
        jwt.verify.mockImplementation((token, secret, callback) => {
            callback(null, mockUser);  
        });

        authenticateToken(req, res, next);

        expect(next).toHaveBeenCalled();  
        expect(req.user).toEqual(mockUser); 
    });
});
