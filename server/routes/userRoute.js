const express = require('express');
const { registerUser, loginUser, findUser, getAllUsers } = require('../controllers/userController');

const routes = express.Router();

routes.post("/register", registerUser );
routes.post("/login", loginUser );
routes.get("/:userId", findUser );
routes.get("/", getAllUsers)

module.exports = routes;