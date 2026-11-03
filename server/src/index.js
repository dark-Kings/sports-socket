import express from "express";
import http from "http";
import { matchesRouter } from "./routes/matches.js";
import { attachWebSocketServer } from "./ws/server.js";

const app = express();
const PORT = process.env.PORT || 8000;
const HOST = process.env.HOST || "0.0.0.0";
app.use(express.json());
const Server = http.createServer(app);

app.get("/", (req, res) => {
    res.send("Hello World!");
});
app.use("/matches", matchesRouter);

const { broadcastMatchCreated } = attachWebSocketServer(Server);
app.locals.broadcastMatchCreated = broadcastMatchCreated;

Server.listen(PORT, HOST, () => {
    const baseUrl = HOST === '0.0.0.0' ? `http://localhost:${PORT}` : `http://${HOST}:${PORT}`;
    console.log(`Server is running on ${baseUrl}`);
    console.log(`WebSocket server is running on ${baseUrl.replace('http', 'ws')}/ws`);
});
