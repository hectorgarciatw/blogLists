const express = require("express");
const Blog = require("../models/blog");
const User = require("../models/user");

const { tokenExtractor, userExtractor } = require("../utils/middleware");

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
router.post("/", tokenExtractor, userExtractor, async (request, response, next) => {
    try {
        const { title, author, url, likes } = request.body;

        // Verificar que el usuario está presente en la solicitud
        const user = request.user;
        if (!user) {
            return response.status(401).json({ error: "Token missing or invalid" });
        }

        // Crear un nuevo blog con la información recibida
        const blog = new Blog({
            title,
            author,
            url,
            likes: likes || 0, // likes es opcional, por defecto será 0
            user: user.id, // Asociar el blog al usuario autenticado
        });

        // Guardar el blog en la base de datos
        const savedBlog = await blog.save();

        // Asociar el nuevo blog con el usuario y guardar el usuario
        user.blogs = user.blogs.concat(savedBlog._id);
        await user.save();

        // Devolver el blog creado como respuesta
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
