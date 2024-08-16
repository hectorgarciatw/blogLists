const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/user");

const router = express.Router();

router.get("/", async (request, response, next) => {
    try {
        const users = await User.find({}).populate("blogs", "title author url likes");
        response.json(users);
    } catch (error) {
        next(error);
    }
});

router.post("/users", async (request, response, next) => {
    try {
        const { username, name, password } = request.body;

        // Validación de campos
        if (!username || !password) {
            return response.status(400).json({ error: "Username and password are required" });
        }
        if (username.length < 3 || password.length < 3) {
            return response.status(400).json({ error: "Username and password must be at least 3 characters long" });
        }

        // Verificar si el username ya existe
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return response.status(400).json({ error: "Username must be unique" });
        }

        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        const user = new User({
            username,
            name,
            password: passwordHash,
        });

        const savedUser = await user.save();
        response.status(201).json(savedUser);
    } catch (error) {
        next(error);
    }
});

router.post("/login", async (request, response, next) => {
    try {
        const { username, password } = request.body;

        const user = await User.findOne({ username });
        if (!user) {
            return response.status(401).json({ error: "Invalid username or password" });
        }

        const isPasswordCorrect = await user.comparePassword(password);
        if (!isPasswordCorrect) {
            return response.status(401).json({ error: "Invalid username or password" });
        }

        response.status(200).json({ message: "Login successful" });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
