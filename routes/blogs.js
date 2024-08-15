const express = require("express");
const Blog = require("../models/blog");

const router = express.Router();

// GET route to fetch all blogs
router.get("/", (request, response, next) => {
    Blog.find({})
        .then((blogs) => {
            response.json(blogs);
        })
        .catch((error) => next(error)); // Pass any errors to the error handler
});

// POST route to create a new blog
router.post("/", (request, response, next) => {
    const blog = new Blog(request.body);

    blog.save()
        .then((result) => {
            response.status(201).json(result);
        })
        .catch((error) => next(error)); // Pass any errors to the error handler
});

module.exports = router;
