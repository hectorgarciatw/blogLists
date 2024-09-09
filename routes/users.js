const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

const router = express.Router();

router.post("/login", async (request, response, next) => {
    try {
        const { username, password } = request.body;

        const user = await User.findOne({ username });
        if (!user) {
            return response.status(401).json({ error: "Invalid username or password" });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return response.status(401).json({ error: "Invalid username or password" });
        }

        const userForToken = {
            username: user.username,
            id: user._id,
        };

        // Generate the token with 60 minutes of life
        const token = jwt.sign(userForToken, process.env.SECRET, { expiresIn: "1h" });

        response.status(200).json({
            token,
            username: user.username,
            name: user.name,
        });
    } catch (error) {
        next(error);
    }
});

router.get("/", async (request, response, next) => {
    try {
        const users = await User.find({}).populate("blogs", "title author url likes");
        response.json(users);
    } catch (error) {
        next(error);
    }
});

// Return the users with the number of the blogs created
router.get("/users", async (request, response, next) => {
    try {
        const users = await User.aggregate([
            {
                $lookup: {
                    from: "blogs",
                    localField: "blogs",
                    foreignField: "_id",
                    as: "userBlogs",
                },
            },
            {
                $project: {
                    _id: 1,
                    username: 1,
                    blogCount: { $size: "$userBlogs" },
                },
            },
        ]);

        response.json(
            users.map((user) => ({
                id: user._id,
                username: user.username,
                blogs: user.blogCount,
            }))
        );
    } catch (error) {
        next(error);
    }
});

router.post("/users", async (request, response, next) => {
    try {
        const { username, name, password } = request.body;

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

module.exports = router;
