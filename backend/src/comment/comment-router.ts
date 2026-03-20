import express from "express";
import {CommentService} from "./comment-service";
import {CommentRepository} from "./comment-repository";
import {Comment, Post, User} from "../../data/model";

export const commentRouter = express.Router();

const commentService = new CommentService(new CommentRepository());

commentRouter.get("/comments", (req, res) => {

    const result = commentService.getAllComments();
    res.json(result);

})

commentRouter.get("/comment/:id", (req, res) => {

    const id = Number(req.params.id);

    if (typeof id !== "number") {
        return res.status(400).send("Invalid id");
    }
    else{

        const result = commentService.getCommentById(id);
        res.json(result);
    }

})

commentRouter.get("/posts/comments/:postId", (req, res) => {

    const postId = Number(req.params.id);

    const result = commentService.getCommentByPostId(postId);

    if (typeof postId !== "number") {
        return res.status(400).send("Invalid id");
    }
    else{

        res.json(result);
    }

})

commentRouter.get("/comment/comments/:parentCommentId", (req, res) => {

    const parentCommentId = Number(req.params.id);

    const result = commentService.getCommentsByParentComment(parentCommentId);

    if (typeof parentCommentId !== "number") {
        return res.status(400).send("Invalid id");
    }
    else{

        res.json(result);
    }
})

commentRouter.put("/comment", (req, res) => {
    const content: string = req.body.content;
    const author: User = req.body.author;
    const post: Post = req.body.post;
    const publishedAt: Date = new Date(Date.now());

    const comment: Comment = {
        cid: 0,
        content: content,
        author: author,
        post: post,
        publishedAt: publishedAt,
        likes: 0,
        dislikes: 0
    };

    commentService.createCommentOnPost(comment);
})

commentRouter.put("/posts/comments", (req, res) => {
    const content: string = req.body.content;
    const author: User = req.body.author;
    const post: Post = req.body.post;
    const publishedAt: Date = new Date(Date.now());
    const parentComment = req.body.comment;

    const comment: Comment = {
        cid: 0,
        content: content,
        author: author,
        post: post,
        publishedAt: publishedAt,
        parentComment: parentComment,
        likes: 0,
        dislikes: 0
    };

    commentService.createCommentOnComment(comment);
})