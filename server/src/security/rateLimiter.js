
const requests = new Map();

export function slidingWindow({
    windowMs,
    maxRequests,
    keyGenerator = (req) => req.ip,
    message = "Too many requests."
}) {
    return (req, res, next) => {

        const key = keyGenerator(req);
        const now = Date.now();
        const windowStart = now - windowMs;

        let timestamps = requests.get(key) || [];

        // Remove requests outside the current window
        timestamps = timestamps.filter(
            timestamp => timestamp > windowStart
        );

        if (timestamps.length >= maxRequests) {
            const retryAfter = Math.ceil(
                (timestamps[0] + windowMs - now) / 1000
            );

            res.setHeader("Retry-After", retryAfter);

            return res.status(429).json({
                error: message,
                retryAfter
            });
        }

        timestamps.push(now);
        requests.set(key, timestamps);

        next();
    };
}
