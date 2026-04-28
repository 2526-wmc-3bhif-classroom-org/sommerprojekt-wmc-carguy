import { Comment } from "../../data/model";
import { CommentRepository } from "./comment-repository";

export class CommentService {
    constructor(private commentRepository: CommentRepository) {}

    public getAllComments(): Comment[] {
        return this.commentRepository.findAllComments();
    }

    public getCommentById(id: number): Comment | undefined {
        return this.commentRepository.findCommentById(id);
    }

    public getCommentsByPostId(postId: number): Comment[] {
        return this.commentRepository.findCommentsByPostId(postId);
    }

    public getRepliesByParentCommentId(parentCommentId: number): Comment[] {
        return this.commentRepository.findRepliesByParentCommentId(parentCommentId);
    }

    public createComment(comment: Comment): void {
        this.commentRepository.createComment(comment);
    }

    public createReply(comment: Comment): void {
        this.commentRepository.createReply(comment);
    }
}
