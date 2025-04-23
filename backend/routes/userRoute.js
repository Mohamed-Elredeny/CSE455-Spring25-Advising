const express = require('express');
const { registerUser, loginUser, findUser, getAllUsers } = require('../controllers/userController');
const auth = require('../middleware/auth');

const routes = express.Router();

routes.post("/register", registerUser);
routes.post("/login", loginUser);
routes.get("/:userId", auth, findUser);
routes.get("/", auth, getAllUsers);

module.exports = routes;