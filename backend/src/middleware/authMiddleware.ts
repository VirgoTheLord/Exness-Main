import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export default function verifyToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const token = req.headers["token"];
    if (!token) {
      return res.status(400).json({ message: "No token" });
    }

    const decoded = jwt.verify(
      token as string,
      process.env.JWT_SECRET as string
    );
    (req as any).user = decoded;
    next();
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
