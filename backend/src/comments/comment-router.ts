import express from "express";
import { CommentService } from "./comment-service";
import { CommentRepository } from "./comment-repository";
import { Comment } from "../../data/model";

const commentService = new CommentService(new CommentRepository());
export const commentRouter = express.Router();

commentRouter.get("/comments", (req, res) => {
    const result = commentService.getAllComments();
    res.json(result);
});

commentRouter.get("/comment/:id", (req, res) => {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).send("Invalid id");

    const result = commentService.getCommentById(id);
    if (!result) return res.status(404).send("Comment not found");

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

commentRouter.post("/comment", (req, res) => {
    const comment: Comment = req.body;
    commentService.createComment(comment);
    res.status(201).json({ message: "Comment created" });
});

commentRouter.post("/posts/comments", (req, res) => {
    const { content, author, post, comment: parentComment } = req.body;
    const reply: Comment = {
        cid: 0,
        content,
        author,
        post,
        parentComment,
        publishedAt: new Date(),
        likes: 0,
        dislikes: 0
    };
    commentService.createReply(reply);
    res.status(201).json({ message: "Reply created" });
});
