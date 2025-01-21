const { authenticateToken } = require('../middleware/authMiddleware');
const jwt = require('jsonwebtoken');
const { verifyAdmin } = require("../middleware/authMiddleware");
const {verifyUser} = require("../middleware/authMiddleware");
const { auth } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/authMiddleware");



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


describe("verifyAdmin middleware", () => {
    let mockReq, mockRes, mockNext;

    beforeEach(() => {
        mockReq = {
            headers: {},
        };
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        mockNext = jest.fn();
    });

    it("should return 401 if no token is provided", () => {
        verifyAdmin(mockReq, mockRes, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith({ error: "Access denied. No token provided." });
        expect(mockNext).not.toHaveBeenCalled();
    });

    it("should return 403 if user is not an admin", () => {
        mockReq.headers.authorization = "Bearer valid_token";
        jwt.verify.mockImplementation(() => ({ role: "customer" }));

        verifyAdmin(mockReq, mockRes, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(403);
        expect(mockRes.json).toHaveBeenCalledWith({ error: "Access denied. Admins only." });
        expect(mockNext).not.toHaveBeenCalled();
    });

    it("should call next() if user is an admin", () => {
        mockReq.headers.authorization = "Bearer valid_token";
        const mockAdmin = { role: "admin" };
        jwt.verify.mockImplementation(() => mockAdmin);

        verifyAdmin(mockReq, mockRes, mockNext);

        expect(mockNext).toHaveBeenCalled();
        expect(mockReq.user).toEqual(mockAdmin);
    });

    it("should return 400 if the token is invalid", () => {
        mockReq.headers.authorization = "Bearer invalid_token";
        jwt.verify.mockImplementation(() => {
            throw new Error("Invalid token");
        });

        verifyAdmin(mockReq, mockRes, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({ error: "Invalid token." });
        expect(mockNext).not.toHaveBeenCalled();
    });
});



describe("verifyAdmin middleware", () => {
    let mockReq, mockRes, mockNext;

    beforeEach(() => {
        mockReq = {
            headers: {},
        };
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        mockNext = jest.fn();
    });

    afterEach(() => {
        jest.clearAllMocks(); 
    });

    it("should return 401 if no token is provided", () => {
        verifyAdmin(mockReq, mockRes, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith({ error: "Access denied. No token provided." });
        expect(mockNext).not.toHaveBeenCalled();
    });

    it("should return 403 if user is not an admin", () => {
        mockReq.headers.authorization = "Bearer valid_token";
        jwt.verify.mockImplementation(() => ({ role: "customer" }));

        verifyAdmin(mockReq, mockRes, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(403);
        expect(mockRes.json).toHaveBeenCalledWith({ error: "Access denied. Admins only." });
        expect(mockNext).not.toHaveBeenCalled();
    });

    it("should call next() if user is an admin", () => {
        mockReq.headers.authorization = "Bearer valid_token";
        const mockAdmin = { role: "admin" };
        jwt.verify.mockImplementation(() => mockAdmin);

        verifyAdmin(mockReq, mockRes, mockNext);

        expect(mockNext).toHaveBeenCalled();
        expect(mockReq.user).toEqual(mockAdmin);
    });

    it("should return 400 if the token is invalid", () => {
        mockReq.headers.authorization = "Bearer invalid_token";
        jwt.verify.mockImplementation(() => {
            throw new Error("Invalid token");
        });

        verifyAdmin(mockReq, mockRes, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({ error: "Invalid token." });
        expect(mockNext).not.toHaveBeenCalled();
    });

    it("should return 401 if the token is an empty string", () => {
        mockReq.headers.authorization = "Bearer ";

        verifyUser(mockReq, mockRes, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith({ error: "Unauthorized. Token missing." });
        expect(mockNext).not.toHaveBeenCalled();
    });

    test("should return 401 if the authorization header is malformed", () => {
        mockReq.headers.authorization = "InvalidHeaderWithoutBearer";

        verifyUser(mockReq, mockRes, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith({ error: "Unauthorized. Token missing." });
        expect(mockNext).not.toHaveBeenCalled();
    });

    it("should handle unexpected errors during token verification", () => {
        mockReq.headers.authorization = "Bearer valid_token";

        jwt.verify.mockImplementation(() => {
            throw new Error("Unexpected error");
        });

        verifyUser(mockReq, mockRes, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith({ error: "Invalid token." });
        expect(mockNext).not.toHaveBeenCalled();
    });

    it("should handle null or undefined token after splitting", () => {
        mockReq.headers.authorization = "Bearer"; 

        verifyUser(mockReq, mockRes, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith({ error: "Unauthorized. Token missing." });
        expect(mockNext).not.toHaveBeenCalled();
    });

    it("should gracefully handle cases where req.headers is undefined", () => {
        mockReq.headers = undefined;

        verifyUser(mockReq, mockRes, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith({ error: "Unauthorized. Token missing." });
        expect(mockNext).not.toHaveBeenCalled();
    });
});

describe("auth middleware", () => {
    let mockReq, mockRes, mockNext;

    beforeEach(() => {
        mockReq = { headers: {} };
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        mockNext = jest.fn();
    });

    it("should return 401 if no token is provided", () => {
        auth(mockReq, mockRes, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith({ error: "Access denied. No token provided." });
        expect(mockNext).not.toHaveBeenCalled();
    });

    it("should return 400 if token is invalid", () => {
        mockReq.headers.authorization = "Bearer invalid_token";

        jwt.verify.mockImplementation(() => {
            throw new Error("Invalid token");
        });

        auth(mockReq, mockRes, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({ error: "Invalid token." });
        expect(mockNext).not.toHaveBeenCalled();
    });

    it("should set req.user and call next() if token is valid", () => {
        const mockUser = { id: 1, name: "Test User" };
        mockReq.headers.authorization = "Bearer valid_token";

        jwt.verify.mockImplementation(() => mockUser);

        auth(mockReq, mockRes, mockNext);

        expect(mockNext).toHaveBeenCalled();
        expect(mockReq.user).toEqual(mockUser);
        expect(mockRes.status).not.toHaveBeenCalled();
    });

    it("should handle cases where req.headers is undefined", () => {
        mockReq = {}; 

        auth(mockReq, mockRes, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith({ error: "Access denied. No token provided." });
        expect(mockNext).not.toHaveBeenCalled();
    });

    it("should handle cases where the authorization header format is incorrect", () => {
        mockReq.headers.authorization = "InvalidFormat";

        auth(mockReq, mockRes, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith({ error: "Access denied. No token provided." });
        expect(mockNext).not.toHaveBeenCalled();
    });
});

describe("adminOnly Middleware", () => {
    let mockReq, mockRes, mockNext;

    beforeEach(() => {
        mockReq = { user: {} }; 
        mockRes = {
            status: jest.fn().mockReturnThis(), 
            json: jest.fn(),
        };
        mockNext = jest.fn(); 
    });

    it("should call next() if the user role is admin", () => {
        mockReq.user.role = "admin"; 

        adminOnly(mockReq, mockRes, mockNext);

        expect(mockNext).toHaveBeenCalled(); 
        expect(mockRes.status).not.toHaveBeenCalled(); 
        expect(mockRes.json).not.toHaveBeenCalled(); 
    });

    it("should return a 403 error if the user role is not admin", () => {
        mockReq.user.role = "customer"; 

        adminOnly(mockReq, mockRes, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(403); 
        expect(mockRes.json).toHaveBeenCalledWith({
            error: "Access denied. Admins only.",
        });
        expect(mockNext).not.toHaveBeenCalled(); 
    });

    it("should return a 403 error if the user object is missing or undefined", () => {
        mockReq.user = undefined; 

        adminOnly(mockReq, mockRes, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(403); 
        expect(mockRes.json).toHaveBeenCalledWith({
            error: "Access denied. Admins only.",
        });
        expect(mockNext).not.toHaveBeenCalled(); 
    });
});





