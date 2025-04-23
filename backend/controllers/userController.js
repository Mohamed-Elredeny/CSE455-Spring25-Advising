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
        console.log('Registration attempt for email:', email, 'with name:', name);

        // First check if user exists
        let user = await userModel.findOne({ email });
        if (user) {
            console.log('User already exists with email:', email);
            return res.status(400).json("There exists a user with email!");
        }

        // Then validate required fields
        if (!name || !email || !password) {
            console.log('Missing required fields');
            return res.status(400).json("All fields are required...");
        }

        // Validate email format
        if (!validator.isEmail(email)) {
            console.log('Invalid email format:', email);
            return res.status(400).json("A legit email format must be provided...");
        }

        // Validate password strength
        if (!validator.isStrongPassword(password)) {
            console.log('Password does not meet strength requirements');
            return res.status(400).json("You must use strong password...");
        }

        // Create and save user
        user = new userModel({ 
            name: name.trim(), 
            email: email.trim(), 
            password 
        });
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
        await user.save();

        // Generate token and send response
        const token = createToken(user._id);
        console.log('Registration successful for email:', email, 'with ID:', user._id);
        res.status(200).json({ 
            token,
            user: {
                _id: user._id,
                username: user.name,
                email: user.email,
                first_name: user.name.split(' ')[0],
                last_name: user.name.split(' ').slice(1).join(' '),
                fullname: user.name
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('Login attempt for email:', email);
        
        // Find user
        const user = await userModel.findOne({ email });
        if (!user) {
            console.log('User not found for email:', email);
            return res.status(401).json("Invalid email or password!");
        }

        // Compare password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            console.log('Invalid password for user:', email);
            return res.status(401).json("Invalid email or password!");
        }

        // Create token and send response
        const token = createToken(user._id);
        console.log('Login successful for user:', email, 'with ID:', user._id);
        res.status(200).json({ 
            token,
            user: {
                _id: user._id,
                username: user.name,
                email: user.email,
                first_name: user.name.split(' ')[0],
                last_name: user.name.split(' ').slice(1).join(' '),
                fullname: user.name
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const findUser = async (req, res) => {
    const userId = req.params.userId;
    try {
        let user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json("User not found!");
        }
        res.status(200).json(user);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const getAllUsers = async (req, res) => {
    try {
        let users = await userModel.find();
        if (!users) {
            return res.status(404).json("No available users!");
        }
        res.status(200).json(users);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = { registerUser, loginUser, findUser, getAllUsers };