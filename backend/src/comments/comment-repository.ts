import { DB } from "../database";
import { Comment, User } from "../../data/model";

export class CommentRepository {

    public findAllComments(): Comment[] {
        const db = DB.getInstance();
        const rows = db.prepare(`
            SELECT c.CID as cid, c.Content as content, c.PID as post, c.ParentCID as parentComment, c.PublishedAt as publishedAt, c.ImageUrls as imageUrls, c.Likes as likes, c.Dislikes as dislikes,
                   u.UID as authorUid, u.Username as authorUsername, u.PublicName as authorPublicname,
                   (
                       (SELECT IFNULL(SUM(Likes - Dislikes), 0) FROM Post WHERE UID = u.UID) + 
                       (SELECT IFNULL(SUM(Likes - Dislikes), 0) FROM Comment WHERE UID = u.UID)
                   ) as authorTotalAura
            FROM Comment c
            LEFT JOIN User u ON c.UID = u.UID
        `).all() as any[];

        return rows.map(row => ({
            cid: row.cid,
            content: row.content,
            post: { pid: row.post } as any,
            parentComment: row.parentComment ? { cid: row.parentComment } as any : undefined,
            publishedAt: row.publishedAt,
            imageUrls: row.imageUrls ? JSON.parse(row.imageUrls) : undefined,
            likes: row.likes,
            dislikes: row.dislikes,
            author: {
                uid: row.authorUid,
                username: row.authorUsername,
                publicname: row.authorPublicname,
                totalAura: row.authorTotalAura
            } as User
        })) as Comment[];
    }

    public findCommentById(id: number): Comment | undefined {
        const db = DB.getInstance();
        const row = db.prepare(`
            SELECT c.CID as cid, c.Content as content, c.PID as post, c.ParentCID as parentComment, c.PublishedAt as publishedAt, c.ImageUrls as imageUrls, c.Likes as likes, c.Dislikes as dislikes,
                   u.UID as authorUid, u.Username as authorUsername, u.PublicName as authorPublicname,
                   (
                       (SELECT IFNULL(SUM(Likes - Dislikes), 0) FROM Post WHERE UID = u.UID) + 
                       (SELECT IFNULL(SUM(Likes - Dislikes), 0) FROM Comment WHERE UID = u.UID)
                   ) as authorTotalAura
            FROM Comment c
            LEFT JOIN User u ON c.UID = u.UID
            WHERE c.CID = ?
        `).get(id) as any;

        if (!row) return undefined;

        return {
            cid: row.cid,
            content: row.content,
            post: { pid: row.post } as any,
            parentComment: row.parentComment ? { cid: row.parentComment } as any : undefined,
            publishedAt: row.publishedAt,
            imageUrls: row.imageUrls ? JSON.parse(row.imageUrls) : undefined,
            likes: row.likes,
            dislikes: row.dislikes,
            author: {
                uid: row.authorUid,
                username: row.authorUsername,
                publicname: row.authorPublicname,
                totalAura: row.authorTotalAura
            } as User
        } as Comment;
    }

    public findCommentsByPostId(postId: number): Comment[] {
        const db = DB.getInstance();
        const rows = db.prepare(`
            SELECT c.CID as cid, c.Content as content, c.PID as post, c.ParentCID as parentComment, c.PublishedAt as publishedAt, c.Likes as likes, c.Dislikes as dislikes,
                   u.UID as authorUid, u.Username as authorUsername, u.PublicName as authorPublicname,
                   (
                       (SELECT IFNULL(SUM(Likes - Dislikes), 0) FROM Post WHERE UID = u.UID) + 
                       (SELECT IFNULL(SUM(Likes - Dislikes), 0) FROM Comment WHERE UID = u.UID)
                   ) as authorTotalAura
            FROM Comment c
            LEFT JOIN User u ON c.UID = u.UID
            WHERE c.PID = ?
        `).all(postId) as any[];

        return rows.map(row => ({
            cid: row.cid,
            content: row.content,
            post: { pid: row.post } as any,
            parentComment: row.parentComment ? { cid: row.parentComment } as any : undefined,
            publishedAt: row.publishedAt,
            imageUrls: row.imageUrls ? JSON.parse(row.imageUrls) : undefined,
            likes: row.likes,
            dislikes: row.dislikes,
            author: {
                uid: row.authorUid,
                username: row.authorUsername,
                publicname: row.authorPublicname,
                totalAura: row.authorTotalAura
            } as User
        })) as Comment[];
    }

    public findRepliesByParentCommentId(parentCommentId: number): Comment[] {
        const db = DB.getInstance();
        const rows = db.prepare(`
            SELECT c.CID as cid, c.Content as content, c.PID as post, c.ParentCID as parentComment, c.PublishedAt as publishedAt, c.Likes as likes, c.Dislikes as dislikes,
                   u.UID as authorUid, u.Username as authorUsername, u.PublicName as authorPublicname,
                   (
                       (SELECT IFNULL(SUM(Likes - Dislikes), 0) FROM Post WHERE UID = u.UID) + 
                       (SELECT IFNULL(SUM(Likes - Dislikes), 0) FROM Comment WHERE UID = u.UID)
                   ) as authorTotalAura
            FROM Comment c
            LEFT JOIN User u ON c.UID = u.UID
            WHERE c.ParentCID = ?
        `).all(parentCommentId) as any[];

        return rows.map(row => ({
            cid: row.cid,
            content: row.content,
            post: { pid: row.post } as any,
            parentComment: row.parentComment ? { cid: row.parentComment } as any : undefined,
            publishedAt: row.publishedAt,
            imageUrls: row.imageUrls ? JSON.parse(row.imageUrls) : undefined,
            likes: row.likes,
            dislikes: row.dislikes,
            author: {
                uid: row.authorUid,
                username: row.authorUsername,
                publicname: row.authorPublicname,
                totalAura: row.authorTotalAura
            } as User
        })) as Comment[];
    }

    public findCommentsByUser(userId: number): Comment[] {
        const db = DB.getInstance();
        const rows = db.prepare(`
            SELECT c.CID as cid, c.Content as content, c.PID as post, c.ParentCID as parentComment, c.PublishedAt as publishedAt, c.Likes as likes, c.Dislikes as dislikes,
                   u.UID as authorUid, u.Username as authorUsername, u.PublicName as authorPublicname,
                   (
                       (SELECT IFNULL(SUM(Likes - Dislikes), 0) FROM Post WHERE UID = u.UID) + 
                       (SELECT IFNULL(SUM(Likes - Dislikes), 0) FROM Comment WHERE UID = u.UID)
                   ) as authorTotalAura
            FROM Comment c
            LEFT JOIN User u ON c.UID = u.UID
            WHERE c.UID = ?
        `).all(userId) as any[];

        return rows.map(row => ({
            cid: row.cid,
            content: row.content,
            post: { pid: row.post } as any,
            parentComment: row.parentComment ? { cid: row.parentComment } as any : undefined,
            publishedAt: row.publishedAt,
            imageUrls: row.imageUrls ? JSON.parse(row.imageUrls) : undefined,
            likes: row.likes,
            dislikes: row.dislikes,
            author: {
                uid: row.authorUid,
                username: row.authorUsername,
                publicname: row.authorPublicname,
                totalAura: row.authorTotalAura
            } as User
        })) as Comment[];
    }

    public createComment(comment: Comment): void {
        const db = DB.getInstance();
        db.prepare(`
            INSERT INTO Comment (Content, UID, PID, ParentCID, PublishedAt, ImageUrls, Likes, Dislikes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
            comment.content,
            comment.author.uid,
            comment.post.pid,
            null,
            comment.publishedAt,
            comment.imageUrls ? JSON.stringify(comment.imageUrls) : null,
            0,
            0
        );
    }

    public createReply(comment: Comment): void {
        const db = DB.getInstance();
        db.prepare(`
            INSERT INTO Comment (Content, UID, PID, ParentCID, PublishedAt, ImageUrls, Likes, Dislikes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
            comment.content,
            comment.author.uid,
            comment.post.pid,
            comment.parentComment?.cid ?? null,
            comment.publishedAt,
            comment.imageUrls ? JSON.stringify(comment.imageUrls) : null,
            0,
            0
        );
    }

    public likeComment(id: number): void {
        const db = DB.getInstance();
        db.prepare('UPDATE Comment SET Likes = Likes + 1 WHERE CID = ?').run(id);
    }

    public unlikeComment(id: number): void {
        const db = DB.getInstance();
        db.prepare('UPDATE Comment SET Likes = Likes - 1 WHERE CID = ?').run(id);
    }

    public dislikeComment(id: number): void {
        const db = DB.getInstance();
        db.prepare('UPDATE Comment SET Dislikes = Dislikes + 1 WHERE CID = ?').run(id);
    }

    public undislikeComment(id: number): void {
        const db = DB.getInstance();
        db.prepare('UPDATE Comment SET Dislikes = Dislikes - 1 WHERE CID = ?').run(id);
    }
}
