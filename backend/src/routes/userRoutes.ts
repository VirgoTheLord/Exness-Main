import express from "express";

import jwt from "jsonwebtoken";
import { prisma } from "../config/db";

const userRouter = express.Router();
userRouter.post("/signup", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });
    if (user) {
      console.log("User Already Exists");
      return res.status(400).json({ message: "User exists, login" });
    }
    await prisma.user.create({
      data: {
        email: email,
        password: password,
      },
    });

    return res.status(200).json({ message: "User Signed Up succesfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

userRouter.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });
    if (!user) {
      console.log("User does not exist yet");
      return res.status(400).json({ message: "User has not signed up yet" });
    }
    const token = jwt.sign(
      { user: { email: user.email, id: user.id } },
      process.env.JWT_SECRET as string
    );
    console.log("Login Successfully");
    return res.status(200).json({ message: "Logged In", token: token });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

userRouter.get("/getBalance", async (req, res) => {
  const { id } = (req as any).query;
  try {
    const user = await prisma.user.findUnique({
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
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

export default userRouter;
