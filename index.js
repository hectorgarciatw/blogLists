const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");
const logger = require("./utils/logger");
const config = require("./utils/config");
const blogsRouter = require("./routes/blogs");
const middleware = require("./utils/middleware"); // Importar los middlewares

// Load environment for MongoDB password
require("dotenv").config();

const app = express();
app.use(express.static(path.join(__dirname, "dist")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Use the custom request logger middleware
app.use(middleware.requestLogger);

morgan.token("body", (req) => {
    return JSON.stringify(req.body);
});

mongoose.set("strictQuery", false);

mongoose
    .connect(config.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => {
        console.log("Connected to MongoDB");
    })
    .catch((error) => {
        console.error("Error connecting to MongoDB:", error.message);
        process.exit(1);
    });

// Use the blogsRouter for all routes under /api/blogs
app.use("/api/blogs", blogsRouter);

// Use the unknown endpoint middleware
app.use(middleware.unknownEndpoint);

// Use the error handler middleware
app.use(middleware.errorHandler);

// Start the server
const PORT = config.PORT || 3003;
app.listen(PORT, () => {
    logger.info(`Server running on port ${config.PORT}`);
});
