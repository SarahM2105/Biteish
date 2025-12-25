require("dotenv").config();
const bcrypt = require('bcrypt');
const {prisma} = require("../prismaClient");

async function register(req, res) {
    try{
        const {name, email, password, role} = req.body;

        if (!name || !email || !password) {
            return res.status(400).send({error: 'Please enter a valid email/password'});
        }

        const existingUser = await prisma.user.findUnique({where: {email}});
        if (existingUser) {
            return res.status(409).send({error: 'email already in use (ask if user wnats to log in or something)'});
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: role || undefined,
            },
            select: {id: true, name: true, email: true, role: true},
        });
            return res.status(201).json({message: 'User registered successfully.', user: newUser});
        }
        catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Server error"});
        }
    }

const jwt = require("jsonwebtoken");
async function login(req, res) {
    try {
        if (!req.body) {
            return res.status(400).send({error: 'missing body'});
        }
        const email = req.body.email;
        const password = req.body.password;

        if (!email || !password) {
            return res.status(400).send({error: 'Please enter a valid email/password'});
        }
        const existingUser = await prisma.user.findUnique({where: {email}});
        if (!existingUser) {
            return res.status(401).json({error: 'User does not exist'});
        }

        const passwordMatch = await bcrypt.compare(password, existingUser.password);
        if (!passwordMatch) {
            return res.status(401).json({error: 'invalid email or password '});
        }

        const token = jwt.sign(
            {userId: existingUser.id, role: existingUser.role},
            process.env.JWT_SECRET,
            {expiresIn: process.env.JWT_EXPIRES_IN || "3d"},
        );
        return res.status(200).json({
            message: "successful login",
            token,
            user: {id: existingUser.id, name: existingUser.name, email: existingUser.email, role: existingUser.role},
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({message: "Server error"});
    }
}

module.exports =  {register, login} ;