
import { WebSocket, WebSocketServer } from "ws";

import {
    trackConnection,
    wsRateLimiter
} from "../security/websocketSecurity.js";

import {
    handshakeSecurity
} from "../security/handshakeSecurity.js";

const matchSubscribers = new Map();
const allowedOrigins = new Set([
    "http://localhost:5173",
    "http://127.0.0.1:5173"
]);

// --------------------
// Subscription helpers
// --------------------

function subscribe(matchId, socket) {
    if (!matchSubscribers.has(matchId)) {
        matchSubscribers.set(matchId, new Set());
    }

    matchSubscribers.get(matchId).add(socket);
}

function unsubscribe(matchId, socket) {
    const subscribers = matchSubscribers.get(matchId);

    if (!subscribers) return;

    subscribers.delete(socket);

    if (subscribers.size === 0) {
        matchSubscribers.delete(matchId);
    }
}

function cleanupSubscriptions(socket) {
    for (const matchId of socket.subscriptions) {
        unsubscribe(matchId, socket);
    }

    socket.subscriptions.clear();
}

// --------------------
// Sending helpers
// --------------------

function sendJson(socket, payload) {
    if (socket.readyState !== WebSocket.OPEN) return;

    socket.send(JSON.stringify(payload));
}

// --------------------
// Broadcast helpers
// --------------------

function broadcastToAll(wss, payload) {
    for (const client of wss.clients) {
        sendJson(client, payload);
    }
}

function broadcastToMatch(matchId, payload) {
    const subscribers = matchSubscribers.get(matchId);

    if (!subscribers || subscribers.size === 0) return;

    for (const client of subscribers) {
        if (client.readyState !== WebSocket.OPEN) continue;

        sendJson(client, payload);
    }
}

// --------------------
// Incoming message handler
// --------------------

function handleMessage(socket, data) {
    let message;

    try {
        message = JSON.parse(data.toString());
    } catch {
        sendJson(socket, {
            type: "error",
            message: "Invalid JSON"
        });
        return;
    }

    if (
        !message ||
        typeof message !== "object" ||
        Array.isArray(message)
    ) {
        sendJson(socket, {
            type: "error",
            message: "Invalid message format"
        });
        return;
    }

    // Subscribe to a match
    if (
        message.type === "subscribe" &&
        Number.isSafeInteger(message.matchId) &&
        message.matchId > 0
    ) {
        subscribe(message.matchId, socket);
        socket.subscriptions.add(message.matchId);

        sendJson(socket, {
            type: "subscribed",
            matchId: message.matchId
        });

        return;
    }

    // Unsubscribe from a match
    if (
        message.type === "unsubscribe" &&
        Number.isSafeInteger(message.matchId) &&
        message.matchId > 0
    ) {
        unsubscribe(message.matchId, socket);
        socket.subscriptions.delete(message.matchId);

        sendJson(socket, {
            type: "unsubscribed",
            matchId: message.matchId
        });

        return;
    }

    sendJson(socket, {
        type: "error",
        message: "Unsupported message type or invalid matchId"
    });
}

// --------------------
// WebSocket server
// --------------------

export function attachWebSocketServer(server) {

    const wss = new WebSocketServer({
        noServer: true,
        maxPayload: 1024 * 1024
    });

    const checkHandshake = handshakeSecurity({
        path: "/ws",
        windowMs: 10_000,
        maxAttempts: 10
    });

    // HTTP upgrade handling
    server.on("upgrade", (request, socket, head) => {

        // Validate browser origin
        const origin = request.headers.origin;

        if (!origin || !allowedOrigins.has(origin)) {
            console.warn(`Rejected WebSocket origin: ${origin || "missing"}`);

            const body = "WebSocket origin not allowed";

            socket.end(
                "HTTP/1.1 403 Forbidden\r\n" +
                "Connection: close\r\n" +
                "Content-Type: text/plain\r\n" +
                `Content-Length: ${Buffer.byteLength(body)}\r\n` +
                "\r\n" +
                body
            );

            return;
        }

        // Handshake security checks
        const allowed = checkHandshake(request, socket);

        if (!allowed) return;

        // Upgrade HTTP connection to WebSocket
        wss.handleUpgrade(request, socket, head, (ws) => {
            wss.emit("connection", ws, request);
        });

    });

    // Established connections
    wss.on("connection", (socket, request) => {

        const ip = request.socket.remoteAddress;

        const releaseConnection = trackConnection(ip, 5);

        if (!releaseConnection) {
            socket.close(1008, "Connection limit exceeded");
            return;
        }

        const allowMessage = wsRateLimiter({
            windowMs: 2000,
            maxMessages: 5
        });

        socket.subscriptions = new Set();
        socket.isAlive = true;

        // Heartbeat response
        socket.on("pong", () => {
            socket.isAlive = true;
        });

        sendJson(socket, {
            type: "welcome"
        });

        // Incoming messages
        socket.on("message", (data) => {
            if (!allowMessage()) {
                socket.close(1008, "Rate limit exceeded");
                return;
            }

            handleMessage(socket, data);
        });

        // Connection cleanup
        socket.on("close", () => {
            cleanupSubscriptions(socket);
            releaseConnection();

            console.log(`Disconnected: ${ip}`);
        });

        socket.on("error", (error) => {
            console.error(`WebSocket error (${ip}):`, error);
        });

        console.log(`Connected: ${ip}`);
    });

    // --------------------
    // Heartbeat interval
    // --------------------

    const interval = setInterval(() => {
        for (const client of wss.clients) {

            if (client.isAlive === false) {
                client.terminate();
                continue;
            }

            client.isAlive = false;

            if (client.readyState === WebSocket.OPEN) {
                client.ping();
            }
        }
    }, 30_000);

    interval.unref();

    wss.on("close", () => {
        clearInterval(interval);
    });

    // --------------------
    // Public broadcasters
    // --------------------

    function broadcastMatchCreated(match) {
        broadcastToAll(wss, {
            type: "match_created",
            data: match
        });
    }

    function broadcastCommentary(matchId, commentary) {
        broadcastToMatch(matchId, {
            type: "commentary_created",
            matchId,
            data: commentary
        });
    }

    return {
        broadcastMatchCreated,
        broadcastCommentary,
        wss
    };
}
