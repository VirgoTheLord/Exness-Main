"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const data_1 = require("../data");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const userRouter = express_1.default.Router();
const secret = "1234";
userRouter.post("/signup", (req, res) => {
    const { email, password } = req.body;
    try {
        const user = data_1.users.find((f) => f.email === email);
        if (user) {
            console.log("User Already Exists");
            return res.status(400).json({ message: "User exists, login" });
        }
        const newUser = {
            id: data_1.users.length + 1,
            email,
            password,
            balance: 0,
        };
        data_1.users.push(newUser);
        return res.status(200).json({ message: "User Signed Up succesfully" });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
});
userRouter.post("/login", (req, res) => {
    const { email, password } = req.body;
    try {
        const user = data_1.users.find((f) => f.email === email && f.password === password);
        if (!user) {
            console.log("User does not exist yet");
            return res.status(400).json({ message: "User has not signed up yet" });
        }
        const token = jsonwebtoken_1.default.sign({ user: { email: user.email, id: user.id } }, secret);
        console.log("Login Successfully");
        return res.status(200).json({ message: "Logged In", token: token });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});
userRouter.get("/getBalance", (req, res) => {
    const { id } = req.query;
    try {
        const user = data_1.users.find((f) => f.id === id);
        if (!user) {
            console.log("No user found");
            return res.status(400).json({ message: "Id is wrong or does not exist" });
        }
        const balance = user.balance;
        return res
            .status(200)
            .json({ message: "Balance Fetched", balance: balance });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});
exports.default = userRouter;
