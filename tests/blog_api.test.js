const request = require("supertest");
const app = require("../app");

describe("GET /api/blogs", () => {
    it("should return the correct number of blogs in JSON format", async () => {
        // The number expected
        const expectedNumberOfBlogs = 6;

        const response = await request(app).get("/api/blogs");

        // Check the status code 200 (OK)
        expect(response.statusCode).toBe(200);

        // Check the response in JSON format
        expect(response.headers["content-type"]).toContain("application/json");

        // Check the amount of blogs
        expect(response.body).toHaveLength(expectedNumberOfBlogs);
    });
});
