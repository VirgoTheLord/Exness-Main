"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("../config/db");
const userRouter = express_1.default.Router();
userRouter.post("/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        const user = yield db_1.prisma.user.findUnique({
            where: {
                email: email,
            },
        });
        if (user) {
            console.log("User Already Exists");
            return res.status(400).json({ message: "User exists, login" });
        }
        yield db_1.prisma.user.create({
            data: {
                email: email,
                password: password,
            },
        });
        return res.status(200).json({ message: "User Signed Up succesfully" });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}));
userRouter.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        const user = yield db_1.prisma.user.findUnique({
            where: {
                email: email,
            },
        });
        if (!user) {
            console.log("User does not exist yet");
            return res.status(400).json({ message: "User has not signed up yet" });
        }
        const token = jsonwebtoken_1.default.sign({ user: { email: user.email, id: user.id } }, process.env.JWT_SECRET);
        console.log("Login Successfully");
        return res.status(200).json({ message: "Logged In", token: token });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}));
userRouter.get("/getBalance", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.query;
    try {
        const user = yield db_1.prisma.user.findUnique({
            where: {
                id: id,
            },
        });
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
}));
exports.default = userRouter;
