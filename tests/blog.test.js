const { test, describe } = require("node:test");
const assert = require("node:assert");
const listHelper = require("../utils/list_helper");
const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../index");
const Blog = require("../models/blog");

test("dummy returns one", () => {
    const blogs = [];
    const result = listHelper.dummy(blogs);
    assert.strictEqual(result, 1);
});

describe("GET /api/blogs", () => {
    beforeEach(async () => {
        await Blog.deleteMany({});
    });

    it("should return blogs with id instead of _id", async () => {
        const newBlog = new Blog({
            title: "Test Blog",
            author: "Test Author",
            url: "http://testurl.com",
            likes: 5,
        });

        await newBlog.save();

        const response = await request(app).get("/api/blogs");

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveLength(1);
        expect(response.body[0].id).toBeDefined();
        expect(response.body[0]._id).toBeUndefined();
    });

    afterAll(() => {
        mongoose.connection.close();
    });
});

describe("PUT /api/blogs/:id/likes", () => {
    let initialBlog;

    beforeEach(async () => {
        await Blog.deleteMany({});

        // Insert a blog entry
        initialBlog = new Blog({
            title: "Test Blog",
            author: "Test Author",
            url: "http://testurl.com",
            likes: 10,
        });

        await initialBlog.save();
    });

    it("should update the likes of the specified blog", async () => {
        const newLikes = 20;

        const response = await request(app).put(`/api/blogs/${initialBlog._id}/likes`).send({ likes: newLikes });

        expect(response.statusCode).toBe(200);
        expect(response.body.likes).toBe(newLikes);
    });

    it("should return 404 if the blog is not found", async () => {
        const nonExistentId = new mongoose.Types.ObjectId();
        const response = await request(app).put(`/api/blogs/${nonExistentId}/likes`).send({ likes: 15 });

        expect(response.statusCode).toBe(404);
        expect(response.body.error).toBe("Blog not found");
    });

    it("should return 400 if likes is not a number", async () => {
        const invalidLikes = "not-a-number";

        const response = await request(app).put(`/api/blogs/${initialBlog._id}/likes`).send({ likes: invalidLikes });

        expect(response.statusCode).toBe(400);
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });
});

describe("total likes", () => {
    const listWithBlogs = [
        {
            _id: "5a422a851b54a676234d17f7",
            title: "React patterns",
            author: "Michael Chan",
            url: "https://reactpatterns.com/",
            likes: 7,
            __v: 0,
        },
        {
            _id: "5a422aa71b54a676234d17f8",
            title: "Go To Statement Considered Harmful",
            author: "Edsger W. Dijkstra",
            url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
            likes: 5,
            __v: 0,
        },
        {
            _id: "5a422b3a1b54a676234d17f9",
            title: "Canonical string reduction",
            author: "Edsger W. Dijkstra",
            url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
            likes: 12,
            __v: 0,
        },
        {
            _id: "5a422b891b54a676234d17fa",
            title: "First class tests",
            author: "Robert C. Martin",
            url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll",
            likes: 10,
            __v: 0,
        },
        {
            _id: "5a422ba71b54a676234d17fb",
            title: "TDD harms architecture",
            author: "Robert C. Martin",
            url: "http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html",
            likes: 0,
            __v: 0,
        },
        {
            _id: "5a422bc61b54a676234d17fc",
            title: "Type wars",
            author: "Robert C. Martin",
            url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
            likes: 2,
            __v: 0,
        },
    ];

    test("when list has blogs, equals the total likes", () => {
        const result = listHelper.totalLikes(listWithBlogs);
        assert.strictEqual(result, 36);
    });
});

describe("most blogs", () => {
    const listWithBlogs = [
        {
            _id: "5a422a851b54a676234d17f7",
            title: "React patterns",
            author: "Michael Chan",
            url: "https://reactpatterns.com/",
            likes: 7,
            __v: 0,
        },
        {
            _id: "5a422aa71b54a676234d17f8",
            title: "Go To Statement Considered Harmful",
            author: "Edsger W. Dijkstra",
            url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
            likes: 5,
            __v: 0,
        },
        {
            _id: "5a422b3a1b54a676234d17f9",
            title: "Canonical string reduction",
            author: "Edsger W. Dijkstra",
            url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
            likes: 12,
            __v: 0,
        },
        {
            _id: "5a422b891b54a676234d17fa",
            title: "First class tests",
            author: "Robert C. Martin",
            url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll",
            likes: 10,
            __v: 0,
        },
        {
            _id: "5a422ba71b54a676234d17fb",
            title: "TDD harms architecture",
            author: "Robert C. Martin",
            url: "http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html",
            likes: 0,
            __v: 0,
        },
        {
            _id: "5a422bc61b54a676234d17fc",
            title: "Type wars",
            author: "Robert C. Martin",
            url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
            likes: 2,
            __v: 0,
        },
    ];

    test("when list has multiple blogs, returns author with most blogs", () => {
        const result = listHelper.mostBlogs(listWithBlogs);
        assert.deepStrictEqual(result, { author: "Robert C. Martin", count: 3 });
    });
});

describe("most likes", () => {
    const listWithBlogs = [
        {
            _id: "5a422a851b54a676234d17f7",
            title: "React patterns",
            author: "Michael Chan",
            url: "https://reactpatterns.com/",
            likes: 7,
            __v: 0,
        },
        {
            _id: "5a422aa71b54a676234d17f8",
            title: "Go To Statement Considered Harmful",
            author: "Edsger W. Dijkstra",
            url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
            likes: 5,
            __v: 0,
        },
        {
            _id: "5a422b3a1b54a676234d17f9",
            title: "Canonical string reduction",
            author: "Edsger W. Dijkstra",
            url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
            likes: 12,
            __v: 0,
        },
        {
            _id: "5a422b891b54a676234d17fa",
            title: "First class tests",
            author: "Robert C. Martin",
            url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll",
            likes: 10,
            __v: 0,
        },
        {
            _id: "5a422ba71b54a676234d17fb",
            title: "TDD harms architecture",
            author: "Robert C. Martin",
            url: "http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html",
            likes: 0,
            __v: 0,
        },
        {
            _id: "5a422bc61b54a676234d17fc",
            title: "Type wars",
            author: "Robert C. Martin",
            url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
            likes: 2,
            __v: 0,
        },
    ];

    test("when list has multiple blogs, returns author with most likes", () => {
        const result = listHelper.mostLikes(listWithBlogs);
        assert.deepStrictEqual(result, { author: "Edsger W. Dijkstra", likes: 17 });
    });
});
