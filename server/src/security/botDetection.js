
const suspiciousAgents = [
    /sqlmap/i,
    /nikto/i,
    /masscan/i,
    /nmap/i,
    /zgrab/i
];

const allowedAgents = [
    /googlebot/i,
    /bingbot/i,
    /facebookexternalhit/i
];

export function detectBot(req, res, next) {

    const userAgent = req.get("user-agent") || "";

    // Allow known search engine and preview crawlers
    if (allowedAgents.some(pattern => pattern.test(userAgent))) {
        return next();
    }

    // Block known suspicious scanning tools
    const suspicious = suspiciousAgents.some(
        pattern => pattern.test(userAgent)
    );

    if (suspicious) {
        return res.status(403).json({
            error: "Suspicious client detected."
        });
    }

    // Reject requests with no User-Agent
    if (!userAgent.trim()) {
        return res.status(403).json({
            error: "Invalid client."
        });
    }

    next();
}
