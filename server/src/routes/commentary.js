
import { Router } from "express";
import { eq, desc } from "drizzle-orm";

import { matchIdParamSchema } from "../validation/matches.js";

import {
    createCommentarySchema,
    listCommentaryQuerySchema
} from "../validation/commentary.js";

import { db } from "../db/db.js";
import { commentary, matches } from "../db/schema.js";

const MAX_LIMIT = 100;

export const commentaryRouter = Router({ mergeParams: true });

// GET commentary for a specific match
commentaryRouter.get("/", async (req, res) => {

    const paramsResult = matchIdParamSchema.safeParse(req.params);

    if (!paramsResult.success) {
        return res.status(400).json({
            error: "Invalid match ID.",
            details: paramsResult.error.issues
        });
    }

    const queryResult = listCommentaryQuerySchema.safeParse(req.query);

    if (!queryResult.success) {
        return res.status(400).json({
            error: "Invalid query parameters.",
            details: queryResult.error.issues
        });
    }

    try {
        const { id: matchId } = paramsResult.data;
        const { limit = 10 } = queryResult.data;

        const safeLimit = Math.min(limit, MAX_LIMIT);

        // Verify match exists
        const [match] = await db
            .select({ id: matches.id })
            .from(matches)
            .where(eq(matches.id, matchId))
            .limit(1);

        if (!match) {
            return res.status(404).json({
                error: "Match not found."
            });
        }

        const results = await db
            .select()
            .from(commentary)
            .where(eq(commentary.matchId, matchId))
            .orderBy(desc(commentary.createdAt))
            .limit(safeLimit);

        return res.status(200).json({
            data: results
        });

    } catch (error) {
        console.error("Failed to fetch commentary:", error);

        return res.status(500).json({
            error: "Failed to fetch commentary."
        });
    }
});


// POST new commentary
commentaryRouter.post("/", async (req, res) => {

    const paramsResult = matchIdParamSchema.safeParse(req.params);

    if (!paramsResult.success) {
        return res.status(400).json({
            error: "Invalid match ID.",
            details: paramsResult.error.issues
        });
    }

    const bodyResult = createCommentarySchema.safeParse(req.body);

    if (!bodyResult.success) {
        return res.status(400).json({
            error: "Invalid commentary payload.",
            details: bodyResult.error.issues
        });
    }

    try {
        const { id: matchId } = paramsResult.data;

        const { minute, ...rest } = bodyResult.data;

        // Verify match exists
        const [match] = await db
            .select({ id: matches.id })
            .from(matches)
            .where(eq(matches.id, matchId))
            .limit(1);

        if (!match) {
            return res.status(404).json({
                error: "Match not found."
            });
        }

        // Insert commentary
        const [result] = await db
            .insert(commentary)
            .values({
                matchId,
                minute,
                ...rest
            })
            .returning();

        // Broadcast after successful database insertion
        const broadcast = req.app.locals.broadcastCommentary;

        if (typeof broadcast === "function") {
            try {
                broadcast(result.matchId, result);
            } catch (broadcastError) {
                console.error(
                    "Commentary saved, but WebSocket broadcast failed:",
                    broadcastError
                );
            }
        }

        return res.status(201).json({
            message: "Commentary created successfully.",
            data: result
        });

    } catch (error) {
        console.error("Failed to create commentary:", error);

        return res.status(500).json({
            error: "Failed to create commentary."
        });
    }
});
