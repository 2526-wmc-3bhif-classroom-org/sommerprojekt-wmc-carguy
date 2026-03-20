import { CommentRepository } from "./comment-repository";
import {DB} from "../database";

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
}