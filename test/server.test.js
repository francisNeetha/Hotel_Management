const request = require("supertest");
const express = require("express");

const app = require("../server");

describe("Server Tests", () => {
    it("should return 'Home Page' for the root route", async () => {
        const res = await request(app).get("/");
        expect(res.statusCode).toBe(200);
        expect(res.text).toBe("Home Page");
    });

    it("should handle routes under /customers", async () => {
        const res = await request(app).get("/customers");
        expect(res.statusCode).toBe(200); 
    });

    it("should return a 404 for unknown routes", async () => {
        const res = await request(app).get("/unknown");
        expect(res.statusCode).toBe(404);
        expect(res.text).toBe("404 error");
    });

    it("should disable the x-powered-by header", async () => {
        const res = await request(app).get("/");
        expect(res.headers["x-powered-by"]).toBeUndefined();
    });
});
