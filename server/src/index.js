import express from "express";
import http from "http";
import { matchesRouter } from "./routes/matches.js";
import { commentaryRouter } from "./routes/commentary.js";
import { attachWebSocketServer } from "./ws/server.js";
import { httpSecurity } from "./security/index.js";
import helmet from "helmet";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 8000;
const HOST = process.env.HOST || "0.0.0.0";
app.use(express.json());
const Server = http.createServer(app);

const corsOptions = {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.use(express.json({ limit: "1mb" }));
app.use(helmet());
app.use(...httpSecurity);
app.get("/", (req, res) => {
    res.send("Hello World!");
});
app.use("/matches", matchesRouter);
app.use('/matches/:id/commentary', commentaryRouter);

const { broadcastMatchCreated, broadcastCommentary } = attachWebSocketServer(Server);
app.locals.broadcastMatchCreated = broadcastMatchCreated;
app.locals.broadcastCommentary = broadcastCommentary;

Server.listen(PORT, HOST, () => {
    const baseUrl = HOST === '0.0.0.0' ? `http://localhost:${PORT}` : `http://${HOST}:${PORT}`;
    console.log(`Server is running on ${baseUrl}`);
    console.log(`WebSocket server is running on ${baseUrl.replace('http', 'ws')}/ws`);
});
