const userModel = require('../models/userModel.js');
const bcrypt = require('bcrypt');
const validator = require('validator');
const jwt = require('jsonwebtoken');

const createToken = (_id) => {
    const jwtkey = process.env.JWT_SECRET_KEY;
    return jwt.sign({ _id }, jwtkey, { expiresIn: "3d" });
};

const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        let user = await userModel.findOne({ email });
        if (user) return res.status(400).json("There exists a user with email!");
        if (!name || !email || !password) return res.status(400).json("All fields are required...");
        if (!validator.isEmail(email)) return res.status(400).json("A legit email format must be provided...");
        if (!validator.isStrongPassword(password)) return res.status(400).json("You must use strong password...");
        user = new userModel({ name, email, password });
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
        await user.save();
        const token = createToken(user._id);
        res.status(200).json({ _id: user._id, name, email, token });
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        let user = await userModel.findOne({ email });
        if (!user) {
            res.status(400).json("Invalid email or password!");
        }
        const isValidPassword = bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            res.status(400).json("Invalid email or password!");
        }
        const token = createToken(user._id);
        res.status(200).json({ _id: user._id, name: user.name, email, token });
    } catch (error) {
        console.log(error);
        res.status(500);
    }
};

const findUser = async (req, res) => {
    const userId = req.params.userId;
    try {
        let user = await userModel.findById( userId );
        if (!user){
            res.status(400).json("User not found!");
        }
        res.status(200).json(user);
    } catch (error) {
        console.log(error);
        res.status(500);
    }
};
const getAllUsers = async (req, res) => {
    try {
        let users = await userModel.find();
        if (!users){
            res.status(400).json("No available users!");
        }
        res.status(200).json(users);
    } catch (error) {
        console.log(error);
        res.status(500);
    }
};
module.exports = { registerUser, loginUser , findUser , getAllUsers };