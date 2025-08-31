"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ioredis_1 = __importDefault(require("ioredis"));
const redis = new ioredis_1.default();
const orderRouter = express_1.default.Router();
redis.subscribe("trades");
redis.on("message", (channel, message) => {
    const trade = JSON.parse(message);
    if (channel === "trades") {
    }
});
exports.default = orderRouter;
