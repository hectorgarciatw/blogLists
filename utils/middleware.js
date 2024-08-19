const jwt = require("jsonwebtoken");
const logger = require("./logger");
const User = require("../models/user");

// Middleware para extraer el token
const tokenExtractor = (request, response, next) => {
    const authorization = request.get("authorization");
    if (authorization && authorization.toLowerCase().startsWith("bearer ")) {
        request.token = authorization.substring(7);
    }
    next();
};

// Middleware para extraer y verificar el usuario basado en el token
const userExtractor = async (request, response, next) => {
    try {
        const token = request.token;
        if (token) {
            const decodedToken = jwt.verify(token, process.env.SECRET);
            console.log("Decoded token:", decodedToken);
            request.user = await User.findById(decodedToken.id);
            console.log("User found:", request.user);
        } else {
            return response.status(401).json({ error: "Token missing or invalid" });
        }
        next();
    } catch (error) {
        next(error);
    }
};

// Middleware para registrar las solicitudes
const requestLogger = (request, response, next) => {
    logger.info("Method:", request.method);
    logger.info("Path:  ", request.path);
    logger.info("Body:  ", request.body);
    logger.info("---");
    next();
};

// Middleware para manejar puntos finales desconocidos
const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: "unknown endpoint" });
};

// Middleware para manejar errores
const errorHandler = (error, request, response, next) => {
    logger.error(error.message);

    if (error.name === "CastError") {
        return response.status(400).send({ error: "malformatted id" });
    } else if (error.name === "ValidationError") {
        return response.status(400).json({ error: error.message });
    } else if (error.name === "MongoServerError" && error.code === 11000) {
        return response.status(400).json({ error: "Username must be unique" });
    }

    next(error);
};

module.exports = {
    tokenExtractor,
    userExtractor,
    requestLogger,
    unknownEndpoint,
    errorHandler,
};
