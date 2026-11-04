
export function shield(req, res, next) {

    const path = req.path;
    const method = req.method;

    // Block unexpected HTTP methods
    const allowedMethods = [
        "GET",
        "POST",
        "PUT",
        "PATCH",
        "DELETE",
        "OPTIONS"
    ];

    if (!allowedMethods.includes(method)) {
        return res.status(405).json({
            error: "Method not allowed."
        });
    }

    // Block suspicious path patterns
    const suspiciousPatterns = [
        /\.\.\//,
        /<script/i,
        /%3Cscript/i
    ];

    if (suspiciousPatterns.some(pattern => pattern.test(path))) {
        return res.status(403).json({
            error: "Suspicious request blocked."
        });
    }

    next();
}
