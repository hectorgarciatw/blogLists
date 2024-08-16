const express = require("express");
const Blog = require("../models/blog");
const User = require("../models/user");

const router = express.Router();

// GET route to fetch all blogs
router.get("/", async (request, response, next) => {
    try {
        // Obtener todos los blogs y popular el campo 'user'
        const blogs = await Blog.find({}).populate("user", "username name");

        response.json(blogs);
    } catch (error) {
        next(error);
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

        response.status(204).end();
    } catch (error) {
        next(error);
    }
});

// POST route to create a new blog
router.post("/", async (request, response, next) => {
    try {
        const { title, author, url, likes } = request.body;

        // The fist user in DB is the owner
        const user = await User.findOne({});
        if (!user) {
            return response.status(400).json({ error: "No users found in the database" });
        }

        const blog = new Blog({
            title,
            author,
            url,
            likes,
            user: user._id,
        });

        const savedBlog = await blog.save();

        // Add the blog in the user array
        user.blogs = user.blogs.concat(savedBlog._id);
        await user.save();

        response.status(201).json(savedBlog);
    } catch (error) {
        next(error);
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
