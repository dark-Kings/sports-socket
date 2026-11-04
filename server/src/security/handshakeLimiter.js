
const attempts = new Map();

export function checkHandshakeLimit(
    ip,
    {
        windowMs = 10_000,
        maxAttempts = 10
    } = {}
) {
    const now = Date.now();
    const windowStart = now - windowMs;

    let timestamps = attempts.get(ip) || [];

    // Remove expired handshake attempts
    timestamps = timestamps.filter(
        timestamp => timestamp > windowStart
    );

    if (timestamps.length >= maxAttempts) {

        const retryAfter = Math.ceil(
            (timestamps[0] + windowMs - now) / 1000
        );

        attempts.set(ip, timestamps);

        return {
            allowed: false,
            retryAfter
        };
    }

    timestamps.push(now);
    attempts.set(ip, timestamps);

    return {
        allowed: true,
        remaining: maxAttempts - timestamps.length
    };
}

// Periodically clean up expired IP records
const cleanupInterval = setInterval(() => {

    const now = Date.now();
    const windowMs = 10_000;

    for (const [ip, timestamps] of attempts.entries()) {

        const active = timestamps.filter(
            timestamp => timestamp > now - windowMs
        );

        if (active.length === 0) {
            attempts.delete(ip);
        } else {
            attempts.set(ip, active);
        }
    }

}, 60_000);

// Don't keep the Node.js process alive just for cleanup
cleanupInterval.unref();
