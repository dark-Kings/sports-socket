
const connections = new Map();

export function trackConnection(ip, maxConnections = 5) {

    const current = connections.get(ip) || 0;

    if (current >= maxConnections) {
        return null;
    }

    connections.set(ip, current + 1);

    let released = false;

    return () => {
        if (released) return;
        released = true;

        const count = connections.get(ip) || 0;

        if (count <= 1) {
            connections.delete(ip);
        } else {
            connections.set(ip, count - 1);
        }
    };
}

export function wsRateLimiter({
    windowMs = 2000,
    maxMessages = 5
} = {}) {

    const messages = [];

    return function allowMessage() {

        const now = Date.now();
        const windowStart = now - windowMs;

        while (
            messages.length &&
            messages[0] <= windowStart
        ) {
            messages.shift();
        }

        if (messages.length >= maxMessages) {
            return false;
        }

        messages.push(now);
        return true;
    };
}
