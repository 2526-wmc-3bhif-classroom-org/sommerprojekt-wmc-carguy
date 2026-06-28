import express from "express";
import { requireAuth } from "../auth-middleware";
import { EventService } from "./event-service";
import { EventRepository } from "./event-repository";
import { UserRepository } from "../user/user-repository";
import { ModerationService } from "../moderation/moderation-service";
import { ModerationRepository } from "../moderation/moderation-repository";
import { StatusCodes } from "http-status-codes";

const eventRepository = new EventRepository();
const eventService = new EventService(eventRepository);
const userRepository = new UserRepository();
const moderationService = new ModerationService();
const moderationRepository = new ModerationRepository();

export const eventRouter = express.Router();

eventRouter.get("/events", (req, res) => {
    try {
        const events = eventService.getEvents();
        res.json(events);
    } catch (e: any) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(e.message);
    }
});

eventRouter.post("/events", requireAuth, async (req: any, res) => {
    try {
        const { title, description, location, eventDate } = req.body;
        const uid = req.user.uid;

        if (!title || !description || !location || !eventDate) {
            return res.status(StatusCodes.BAD_REQUEST).send("All event fields are required");
        }

        const textContent = `${title} ${description} ${location}`;
        const moderation = await moderationService.moderateContent(textContent);

        if (!moderation.safe) {
            moderationRepository.logModeration("event", textContent, "blocked", moderation.reason || "Unsafe event details");
            return res.status(StatusCodes.BAD_REQUEST).send("Content blocked by AI Safety: Inappropriate language or content detected.");
        }

        moderationRepository.logModeration("event", textContent, "passed", null);

        eventService.createEvent(title.trim(), description.trim(), location.trim(), eventDate, uid);
        res.status(StatusCodes.CREATED).json({ message: "Event created successfully" });
    } catch (e: any) {
        res.status(StatusCodes.BAD_REQUEST).send(e.message);
    }
});

eventRouter.post("/events/:id/rsvp", requireAuth, (req: any, res) => {
    try {
        const eid = Number(req.params.id);
        const uid = req.user.uid;
        const { status } = req.body;

        if (isNaN(eid)) {
            return res.status(StatusCodes.BAD_REQUEST).send("Invalid event ID");
        }
        if (!status) {
            return res.status(StatusCodes.BAD_REQUEST).send("Status is required");
        }

        eventService.submitRsvp(eid, uid, status);
        res.json({ message: "RSVP updated successfully" });
    } catch (e: any) {
        res.status(StatusCodes.BAD_REQUEST).send(e.message);
    }
});

// GET /events/:id/comments
eventRouter.get("/events/:id/comments", (req, res) => {
    try {
        const eid = Number(req.params.id);
        if (isNaN(eid)) return res.status(400).send("Invalid event ID");
        const db = require('../database').DB.getInstance();
        const comments = db.prepare(`
            SELECT ec.ECID as ecid, ec.EID as eid, ec.Content as content, ec.PublishedAt as publishedAt,
                   u.UID as uid, u.Username as username
            FROM EventComment ec
            JOIN User u ON ec.UID = u.UID
            WHERE ec.EID = ?
            ORDER BY ec.PublishedAt ASC
        `).all(eid);
        res.json(comments);
    } catch (e: any) {
        res.status(500).send(e.message);
    }
});

// POST /events/:id/comments
eventRouter.post("/events/:id/comments", requireAuth, async (req: any, res) => {
    try {
        const eid = Number(req.params.id);
        const uid = req.user.uid;
        const { content } = req.body;
        if (isNaN(eid)) return res.status(400).send("Invalid event ID");
        if (!content || !content.trim()) return res.status(400).send("Content is required");
        const moderation = await moderationService.moderateContent(content);
        if (!moderation.safe) {
            moderationRepository.logModeration("event_comment", content, "blocked", moderation.reason || "Blocked");
            return res.status(400).send("Comment blocked by moderation.");
        }
        moderationRepository.logModeration("event_comment", content, "passed", null);
        const db = require('../database').DB.getInstance();
        db.prepare(`INSERT INTO EventComment (EID, UID, Content, PublishedAt) VALUES (?, ?, ?, ?)`)
          .run(eid, uid, content.trim(), new Date().toISOString());
        res.status(201).json({ message: "Comment posted" });
    } catch (e: any) {
        res.status(500).send(e.message);
    }
});
