
import { checkHandshakeLimit } from "./handshakeLimiter.js";

function rejectHandshake(socket, status, message, retryAfter) {

    const statusText = {
        400: "Bad Request",
        403: "Forbidden",
        404: "Not Found",
        429: "Too Many Requests",
        503: "Service Unavailable"
    };

    const headers = [
        `HTTP/1.1 ${status} ${statusText[status]}`,
        "Connection: close",
        "Content-Type: application/json",
        "Cache-Control: no-store"
    ];

    if (retryAfter !== undefined) {
        headers.push(`Retry-After: ${retryAfter}`);
    }

    const body = JSON.stringify({
        error: message
    });

    headers.push(`Content-Length: ${Buffer.byteLength(body)}`);
    headers.push("", body);

    socket.end(headers.join("\r\n"));
}

export function handshakeSecurity({
    path = "/ws",
    windowMs = 10_000,
    maxAttempts = 10
} = {}) {

    return function handleHandshake(req, socket) {

        if (socket.destroyed) return false;

        // Only GET requests are accepted
        if (req.method !== "GET") {
            rejectHandshake(socket, 400, "Invalid HTTP method");
            return false;
        }

        // Validate requested WebSocket path
        let pathname;

        try {
            pathname = new URL(
                req.url,
                "http://localhost"
            ).pathname;
        } catch {
            rejectHandshake(socket, 400, "Invalid request URL");
            return false;
        }

        if (pathname !== path) {
            rejectHandshake(socket, 404, "WebSocket endpoint not found");
            return false;
        }

        // Get client IP (direct connection)
        const ip = socket.remoteAddress;

        if (!ip) {
            rejectHandshake(socket, 403, "Unable to identify client");
            return false;
        }

        // Check handshake rate limit
        const decision = checkHandshakeLimit(ip, {
            windowMs,
            maxAttempts
        });

        if (!decision.allowed) {

            console.warn(
                `WebSocket handshake rate limit exceeded: ${ip}`
            );

            rejectHandshake(
                socket,
                429,
                "Too many WebSocket connection attempts",
                decision.retryAfter
            );

            return false;
        }

        return true;
    };
}
