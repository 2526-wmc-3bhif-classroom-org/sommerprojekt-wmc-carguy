import express from "express";
import { PostService } from "./post-service";
import { PostRepository } from "./post-repository";
import { Post } from "../../data/model";
import { requireAuth } from "../auth-middleware";
import { UserRepository } from "../user/user-repository";

const postService = new PostService(new PostRepository());
const userRepository = new UserRepository();
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

postRouter.get("/posts/:id", (req, res) => {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).send("Invalid id");

    const result = postService.getPostById(id);
    if (!result) return res.status(404).send("Post not found");

    res.json(result);
});

postRouter.get("/posts/:id/replies", (req, res) => {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).send("Invalid id");

    const result = postService.getRepliesByParentId(id);
    res.json(result);
});

postRouter.post("/post", requireAuth, (req, res) => {
    if (!req.user) return res.status(401).send("Unauthorized");
    const user = userRepository.findUserByUsername(req.user.username);
    if (!user) return res.status(401).send("User not found");

    const post: Post = req.body;
    post.author = user;

    postService.createPost(post);
    res.status(201).json({ message: "Post created" });
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
