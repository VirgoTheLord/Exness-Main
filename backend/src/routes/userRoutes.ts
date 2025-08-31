import express from "express";
import { User } from "../types/allTypes";
import { users } from "../data";
import jwt from "jsonwebtoken";

const userRouter = express.Router();
const secret = "1234";

userRouter.post("/signup", (req, res) => {
  const { email, password } = req.body;
  try {
    const user = users.find((f) => f.email === email);
    if (user) {
      console.log("User Already Exists");
      return res.status(400).json({ message: "User exists, login" });
    }
    const newUser: User = {
      id: users.length + 1,
      email,
      password,
      balance: 0,
    };
    users.push(newUser);

    return res.status(200).json({ message: "User Signed Up succesfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

userRouter.post("/login", (req, res) => {
  const { email, password } = req.body;
  try {
    const user = users.find(
      (f) => f.email === email && f.password === password
    );
    if (!user) {
      console.log("User does not exist yet");
      return res.status(400).json({ message: "User has not signed up yet" });
    }
    const token = jwt.sign(
      { user: { email: user.email, id: user.id } },
      secret
    );
    console.log("Login Successfully");
    return res.status(200).json({ message: "Logged In", token: token });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

userRouter.get("/getBalance", (req, res) => {
  const { id } = (req as any).query;
  try {
    const user = users.find((f) => f.id === id);
    if (!user) {
      console.log("No user found");
      return res.status(400).json({ message: "Id is wrong or does not exist" });
    }
    const balance = user.balance;
    return res
      .status(200)
      .json({ message: "Balance Fetched", balance: balance });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

export default userRouter;
