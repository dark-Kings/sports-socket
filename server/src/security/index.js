
import { slidingWindow } from "./rateLimiter.js";
import { detectBot } from "./botDetection.js";
import { shield } from "./shield.js";

export const httpSecurity = [
    shield,

    detectBot,

    slidingWindow({
        windowMs: 10 * 1000,
        maxRequests: 50,
        message: "Too many HTTP requests."
    })
];
