import { DB } from "../database";
import { Comment } from "../../data/model";

export class CommentRepository {

    public findAllComments(): Comment[] {
        const db = DB.getInstance();
        return db.prepare(`
            SELECT CID as cid, Content as content, UID as author, PID as post, ParentCID as parentComment, PublishedAt as publishedAt, Likes as likes, Dislikes as dislikes
            FROM Comment
        `).all() as Comment[];
    }

    public findCommentById(id: number): Comment | undefined {
        const db = DB.getInstance();
        return db.prepare(`
            SELECT CID as cid, Content as content, UID as author, PID as post, ParentCID as parentComment, PublishedAt as publishedAt, Likes as likes, Dislikes as dislikes
            FROM Comment WHERE CID = ?
        `).get(id) as Comment | undefined;
    }

    public findCommentsByPostId(postId: number): Comment[] {
        const db = DB.getInstance();
        return db.prepare(`
            SELECT CID as cid, Content as content, UID as author, PID as post, ParentCID as parentComment, PublishedAt as publishedAt, Likes as likes, Dislikes as dislikes
            FROM Comment WHERE PID = ? AND ParentCID IS NULL
        `).all(postId) as Comment[];
    }

    public findRepliesByParentCommentId(parentCommentId: number): Comment[] {
        const db = DB.getInstance();
        return db.prepare(`
            SELECT CID as cid, Content as content, UID as author, PID as post, ParentCID as parentComment, PublishedAt as publishedAt, Likes as likes, Dislikes as dislikes
            FROM Comment WHERE ParentCID = ?
        `).all(parentCommentId) as Comment[];
    }

    public createComment(comment: Comment): void {
        const db = DB.getInstance();
        db.prepare(`
            INSERT INTO Comment (Content, UID, PID, ParentCID, PublishedAt, Likes, Dislikes)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(
            comment.content,
            comment.author.uid,
            comment.post.pid,
            null,
            comment.publishedAt,
            0,
            0
        );
    }

    public createReply(comment: Comment): void {
        const db = DB.getInstance();
        db.prepare(`
            INSERT INTO Comment (Content, UID, PID, ParentCID, PublishedAt, Likes, Dislikes)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(
            comment.content,
            comment.author.uid,
            comment.post.pid,
            comment.parentComment?.cid ?? null,
            comment.publishedAt,
            0,
            0
        );
    }
}
