import express from "express";
import { PostService } from "./post-service";
import { PostRepository } from "./post-repository";
import { Post } from "../../data/model";
import { requireAuth, optionalAuth } from "../auth-middleware";
import { UserRepository } from "../user/user-repository";

import { ModerationService } from "../moderation/moderation-service";
import { ModerationRepository } from "../moderation/moderation-repository";

const postService = new PostService(new PostRepository());
const userRepository = new UserRepository();
const moderationService = new ModerationService();
const moderationRepository = new ModerationRepository();
export const postRouter = express.Router();

postRouter.get("/posts", (req, res) => {
    const result = postService.getAllRootPosts();
    res.json(result);
});

postRouter.get("/posts/trending", (req, res) => {
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    if (isNaN(limit)) return res.status(400).send("Invalid limit");

    const result = postService.getTrendingPosts(limit);
    res.json(result);
});

postRouter.get("/posts/forum/:forumId", (req, res) => {
    const forumId = Number(req.params.forumId);
    if (isNaN(forumId)) return res.status(400).send("Invalid forumId");

    const result = postService.getPostByForum(forumId);
    res.json(result);
});

postRouter.get("/posts/user/:userId", (req, res) => {
    const userId = Number(req.params.userId);
    if (isNaN(userId)) return res.status(400).send("Invalid userId");

    const result = postService.getPostByUser(userId);
    res.json(result);
});

postRouter.get("/posts/category/:categoryId", (req, res) => {
    const categoryId = Number(req.params.categoryId);
    if (isNaN(categoryId)) return res.status(400).send("Invalid categoryId");

    const result = postService.getPostByCategory(categoryId);
    res.json(result);
});

postRouter.get("/posts/:id", optionalAuth, (req, res) => {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).send("Invalid id");

    const userId = req.user ? userRepository.findUserByUsername(req.user.username)?.uid : undefined;
    const result = postService.getPostById(id, userId);
    if (!result) return res.status(404).send("Post not found");

    res.json(result);
});

postRouter.get("/posts/:id/replies", (req, res) => {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).send("Invalid id");

    const result = postService.getRepliesByParentId(id);
    res.json(result);
});

postRouter.post("/post", requireAuth, async (req, res) => {
    if (!req.user) return res.status(401).send("Unauthorized");
    const user = userRepository.findUserByUsername(req.user.username);
    if (!user) return res.status(401).send("User not found");

    const post: Post = req.body;
    post.author = user;

    if (post.poll && post.poll.options && post.poll.options.length > 5) {
        return res.status(400).send("Polls cannot have more than 5 options.");
    }

    try {
        const textContent = `${post.title || ""} ${post.content || ""}`;
        const moderation = await moderationService.moderateContent(textContent, post.imageUrls);

        if (!moderation.safe) {
            moderationRepository.logModeration("post", textContent, "blocked", moderation.reason || "Unsafe content detected");
            return res.status(400).send(`Content blocked by AI Safety: Inappropriate language or content detected.`);
        }

        if (moderation.flaggedImages && moderation.flaggedImages.length > 0 && post.imageUrls) {
            post.imageUrls = post.imageUrls.map(img => {
                if (moderation.flaggedImages?.includes(img)) {
                    return `flagged:${img}`;
                }
                return img;
            });
            moderationRepository.logModeration("post", textContent, "flagged", `Flagged ${moderation.flaggedImages.length} image(s)`);
        } else {
            moderationRepository.logModeration("post", textContent, "passed", null);
        }

        postService.createPost(post);
        res.status(201).json({ message: "Post created" });
    } catch (e: any) {
        res.status(500).send(e.message);
    }
});

postRouter.patch("/posts/:id/like", requireAuth, (req, res) => {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).send("Invalid id");
    postService.likePost(id);
    res.status(200).json({ message: "Liked" });
});

postRouter.patch("/posts/:id/unlike", requireAuth, (req, res) => {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).send("Invalid id");
    postService.unlikePost(id);
    res.status(200).json({ message: "Unliked" });
});

postRouter.patch("/posts/:id/dislike", requireAuth, (req, res) => {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).send("Invalid id");
    postService.dislikePost(id);
    res.status(200).json({ message: "Disliked" });
});

postRouter.patch("/posts/:id/undislike", requireAuth, (req, res) => {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).send("Invalid id");
    postService.undislikePost(id);
    res.status(200).json({ message: "Undisliked" });
});

postRouter.post("/posts/:id/replies", requireAuth, (req, res) => {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).send("Invalid id");
    if (!req.user) return res.status(401).send("Unauthorized");
    const user = userRepository.findUserByUsername(req.user.username);
    if (!user) return res.status(401).send("User not found");

    const post: Post = req.body;
    post.parentPost = { pid: id } as Post;
    post.author = user;

    postService.createReply(post);
    res.status(201).json({ message: "Reply created" });
});

postRouter.post("/posts/:id/bookmark", requireAuth, (req, res) => {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).send("Invalid id");
    if (!req.user) return res.status(401).send("Unauthorized");
    const user = userRepository.findUserByUsername(req.user.username);
    if (!user) return res.status(401).send("User not found");

    postService.bookmarkPost(user.uid, id);
    res.status(200).json({ message: "Bookmarked" });
});

postRouter.delete("/posts/:id/bookmark", requireAuth, (req, res) => {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).send("Invalid id");
    if (!req.user) return res.status(401).send("Unauthorized");
    const user = userRepository.findUserByUsername(req.user.username);
    if (!user) return res.status(401).send("User not found");

    postService.unbookmarkPost(user.uid, id);
    res.status(200).json({ message: "Unbookmarked" });
});

postRouter.get("/posts/:id/bookmarked", requireAuth, (req, res) => {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).send("Invalid id");
    if (!req.user) return res.status(401).send("Unauthorized");
    const user = userRepository.findUserByUsername(req.user.username);
    if (!user) return res.status(401).send("User not found");

    const bookmarked = postService.isBookmarked(user.uid, id);
    res.json({ bookmarked });
});

postRouter.get("/users/bookmarks", requireAuth, (req, res) => {
    if (!req.user) return res.status(401).send("Unauthorized");
    const user = userRepository.findUserByUsername(req.user.username);
    if (!user) return res.status(401).send("User not found");

    const result = postService.getBookmarkedPosts(user.uid);
    res.json(result);
});

postRouter.post("/posts/:id/poll/vote", requireAuth, (req, res) => {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).send("Invalid post ID");
    const { optionIndex } = req.body;
    if (optionIndex === undefined || typeof optionIndex !== "number") {
        return res.status(400).send("Invalid option index");
    }
    if (!req.user) return res.status(401).send("Unauthorized");
    const user = userRepository.findUserByUsername(req.user.username);
    if (!user) return res.status(401).send("User not found");

    try {
        postService.recordPollVote(id, user.uid, optionIndex);
        res.status(200).json({ message: "Vote recorded successfully" });
    } catch (e: any) {
        res.status(400).send("You have already voted on this poll or the post does not exist");
    }
});
