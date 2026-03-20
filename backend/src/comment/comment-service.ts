import { CommentRepository } from "./comment-repository";
import {DB} from "../database";
import {Comment} from "../../data/model";

export class CommentService{

    constructor(private commentRepository:CommentRepository){
    }

   public getAllComments():Comment[]{
        return this.commentRepository.getAllComments();
    }

    public getCommentById(id: number) : Comment{
        return this.commentRepository.getCommentById(id);
    }

    public getCommentByPostId(id: number):Comment[]{
        return this.commentRepository.getCommentsByPost(id);
    }

    public getCommentsByParentComment(id: number) : Comment[]{
        return this.commentRepository.getCommentsByParentComment(id);
    }

    public createCommentOnPost(comment: Comment){
        return this.commentRepository.createCommentOnPost(comment);
    }

    public createCommentOnComment(comment: Comment){
        return this.commentRepository.createCommentOnComment(comment);
    }
}