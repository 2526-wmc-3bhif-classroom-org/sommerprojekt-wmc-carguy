import express from "express";
import { CommentService } from "./comment-service";
import { CommentRepository } from "./comment-repository";
import { Comment } from "../../data/model";
import { requireAuth } from "../auth-middleware";
import { UserRepository } from "../user/user-repository";

import { ModerationService } from "../moderation/moderation-service";
import { ModerationRepository } from "../moderation/moderation-repository";

const commentService = new CommentService(new CommentRepository());
const userRepository = new UserRepository();
const moderationService = new ModerationService();
const moderationRepository = new ModerationRepository();
export const commentRouter = express.Router();

commentRouter.get("/comments", (req, res) => {
    const result = commentService.getAllComments();
    res.json(result);
});

commentRouter.get("/posts/comments/:postId", (req, res) => {
    const postId = Number(req.params.postId);
    if (isNaN(postId)) return res.status(400).send("Invalid postId");

    const result = commentService.getCommentsByPostId(postId);
    res.json(result);
});

commentRouter.get("/comment/comments/:parentCommentId", (req, res) => {
    const parentCommentId = Number(req.params.parentCommentId);
    if (isNaN(parentCommentId)) return res.status(400).send("Invalid parentCommentId");

    const result = commentService.getRepliesByParentCommentId(parentCommentId);
    res.json(result);
});

commentRouter.get("/comments/user/:userId", (req, res) => {
    const userId = Number(req.params.userId);
    if (isNaN(userId)) return res.status(400).send("Invalid userId");

    const result = commentService.getCommentsByUser(userId);
    res.json(result);
});

commentRouter.get("/comment/:id", (req, res) => {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).send("Invalid id");

    const result = commentService.getCommentById(id);
    if (!result) return res.status(404).send("Comment not found");

    res.json(result);
});

commentRouter.post("/comment", requireAuth, async (req, res) => {
    if (!req.user) return res.status(401).send("Unauthorized");
    const user = userRepository.findUserByUsername(req.user.username);
    if (!user) return res.status(401).send("User not found");

    const { content, post } = req.body;
    let { imageUrls } = req.body;

    try {
        const moderation = await moderationService.moderateContent(content, imageUrls);

        if (!moderation.safe) {
            moderationRepository.logModeration("comment", content, "blocked", moderation.reason || "Unsafe comment detected");
            return res.status(400).send("Content blocked by AI Safety: Inappropriate language or content detected.");
        }

        if (moderation.flaggedImages && moderation.flaggedImages.length > 0 && imageUrls) {
            imageUrls = imageUrls.map((img: string) => {
                if (moderation.flaggedImages?.includes(img)) {
                    return `flagged:${img}`;
                }
                return img;
            });
            moderationRepository.logModeration("comment", content, "flagged", `Flagged ${moderation.flaggedImages.length} image(s)`);
        } else {
            moderationRepository.logModeration("comment", content, "passed", null);
        }

        const comment: Comment = {
            cid: 0,
            content,
            author: user,
            post,
            imageUrls,
            publishedAt: new Date().toISOString() as any,
            likes: 0,
            dislikes: 0
        };
        commentService.createComment(comment);
        res.status(201).json({ message: "Comment created" });
    } catch (e: any) {
        res.status(500).send(e.message);
    }
});

commentRouter.post("/posts/comments", requireAuth, async (req, res) => {
    if (!req.user) return res.status(401).send("Unauthorized");
    const user = userRepository.findUserByUsername(req.user.username);
    if (!user) return res.status(401).send("User not found");

    const { content, post, comment: parentComment } = req.body;
    let { imageUrls } = req.body;

    try {
        const moderation = await moderationService.moderateContent(content, imageUrls);

        if (!moderation.safe) {
            moderationRepository.logModeration("comment", content, "blocked", moderation.reason || "Unsafe reply comment detected");
            return res.status(400).send("Content blocked by AI Safety: Inappropriate language or content detected.");
        }

        if (moderation.flaggedImages && moderation.flaggedImages.length > 0 && imageUrls) {
            imageUrls = imageUrls.map((img: string) => {
                if (moderation.flaggedImages?.includes(img)) {
                    return `flagged:${img}`;
                }
                return img;
            });
            moderationRepository.logModeration("comment", content, "flagged", `Flagged ${moderation.flaggedImages.length} image(s)`);
        } else {
            moderationRepository.logModeration("comment", content, "passed", null);
        }

        const reply: Comment = {
            cid: 0,
            content,
            author: user,
            post,
            parentComment,
            imageUrls,
            publishedAt: new Date().toISOString() as any,
            likes: 0,
            dislikes: 0
        };
        commentService.createReply(reply);
        res.status(201).json({ message: "Reply created" });
    } catch (e: any) {
        res.status(500).send(e.message);
    }
});

commentRouter.patch("/comments/:id/like", requireAuth, (req, res) => {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).send("Invalid comment ID");
    commentService.likeComment(id);
    res.json({ message: "Comment liked" });
});

commentRouter.patch("/comments/:id/unlike", requireAuth, (req, res) => {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).send("Invalid comment ID");
    commentService.unlikeComment(id);
    res.json({ message: "Comment unliked" });
});

commentRouter.patch("/comments/:id/dislike", requireAuth, (req, res) => {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).send("Invalid comment ID");
    commentService.dislikeComment(id);
    res.json({ message: "Comment disliked" });
});

commentRouter.patch("/comments/:id/undislike", requireAuth, (req, res) => {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).send("Invalid comment ID");
    commentService.undislikeComment(id);
    res.json({ message: "Comment undisliked" });
});
