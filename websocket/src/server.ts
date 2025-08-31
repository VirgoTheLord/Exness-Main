import Redis from "ioredis";
import WebSocket, { WebSocketServer } from "ws";

const redis = new Redis();
const wss = new WebSocketServer({ port: 4000 });

redis.subscribe("trades", (err) => {
  if (!err) {
    console.log("Connected to PUBSUB");
  }
});

redis.on("message", (channel, message) => {
  if (channel === "trades") {
    console.log(message);
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }
});
