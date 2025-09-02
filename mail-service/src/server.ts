import Redis from "ioredis";
import dotenv from "dotenv";
dotenv.config();

import { sendMail } from "./mail.js";

console.log("SMTP_HOST:", process.env.SMTP_HOST);
console.log("SMTP_PORT:", process.env.SMTP_PORT);
console.log("EMAIL_USER:", process.env.EMAIL_USER);

const redis = new Redis();
const TARGET_EMAIL = process.env.TARGET_EMAIL as string;

const processQueue = async () => {
  while (true) {
    try {
      const message = await redis.rpop("order_notifications");
      if (!message) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        continue;
      }

      const { userId, message: text, timestamp } = JSON.parse(message);
      const subject = `Order Notification for User ${userId}`;
      await sendMail(TARGET_EMAIL, subject, text);
      console.log(`Notification sent for user ${userId}`);
    } catch (err) {
      console.error("Error processing queue item:", err);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
};

processQueue();
