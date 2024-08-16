const express = require("express");
const Blog = require("../models/blog");

const router = express.Router();

// GET route to fetch all blogs
router.get("/", async (request, response, next) => {
    try {
        const blogs = await Blog.find({});
        response.json(blogs);
    } catch (error) {
        next(error); // Pass any errors to the error handler
    }
});

// DELETE route to delete a blog by ID
router.delete("/:id", async (request, response, next) => {
    try {
        const { id } = request.params;
        const deletedBlog = await Blog.findByIdAndDelete(id);

        if (!deletedBlog) {
            return response.status(404).json({ error: "Blog not found" });
        }

        response.status(204).end(); // Successful deletion returns 204 No Content
    } catch (error) {
        next(error); // Pass any errors to the error handler
    }
});

// POST route to create a new blog
router.post("/", async (request, response, next) => {
    try {
        const blog = new Blog(request.body);
        const savedBlog = await blog.save();
        response.status(201).json(savedBlog);
    } catch (error) {
        next(error); // Pass any errors to the error handler
    }
});

// PUT route to update the likes of a blog by ID
router.put("/:id/likes", async (request, response, next) => {
    try {
        const { id } = request.params;
        const { likes } = request.body;

        // Update the likes
        const updatedBlog = await Blog.findByIdAndUpdate(
            id,
            { likes },
            {
                new: true,
                runValidators: true,
            }
        );

        if (!updatedBlog) {
            return response.status(404).json({ error: "Blog not found" });
        }

        response.json(updatedBlog);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
