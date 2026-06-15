import { DB } from "../database";
import { Post, User } from "../../data/model";

export class PostRepository {

    public findAllRootPosts(): Post[] {
        const db = DB.getInstance();

        const rows = db.prepare(`
            SELECT p.PID as pid, p.Title as title, p.Content as content, p.ForumID as forum, p.ParentPID as parentPost, p.Post_Category_id as category, p.PublishedAt as publishedAt, p.ImageUrls as imageUrls, p.Likes as likes, p.Dislikes as dislikes,
                   u.UID as authorUid, u.Username as authorUsername, u.PublicName as authorPublicname,
                   (
                       (SELECT IFNULL(SUM(Likes - Dislikes), 0) FROM Post WHERE UID = u.UID) + 
                       (SELECT IFNULL(SUM(Likes - Dislikes), 0) FROM Comment WHERE UID = u.UID)
                   ) as authorTotalAura
            FROM Post p
            LEFT JOIN User u ON p.UID = u.UID
            WHERE p.ParentPID IS NULL
        `).all() as any[];
        return rows.map(row => ({
            pid: row.pid,
            title: row.title,
            content: row.content,
            forum: { forumId: row.forum } as any,
            parentPost: row.parentPost ? { pid: row.parentPost } as any : undefined,
            category: row.category ? { postCategoryId: row.category } as any : undefined,
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
        })) as Post[];
    }

    public findPostById(id: number): Post | undefined {
        const db = DB.getInstance();

        const row = db.prepare(`
            SELECT p.PID as pid, p.Title as title, p.Content as content, p.ForumID as forum, p.ParentPID as parentPost, p.Post_Category_id as category, p.PublishedAt as publishedAt, p.ImageUrls as imageUrls, p.Likes as likes, p.Dislikes as dislikes,
                   u.UID as authorUid, u.Username as authorUsername, u.PublicName as authorPublicname,
                   (
                       (SELECT IFNULL(SUM(Likes - Dislikes), 0) FROM Post WHERE UID = u.UID) + 
                       (SELECT IFNULL(SUM(Likes - Dislikes), 0) FROM Comment WHERE UID = u.UID)
                   ) as authorTotalAura
            FROM Post p
            LEFT JOIN User u ON p.UID = u.UID
            WHERE p.PID = ?
        `).get(id) as any;

        if (!row) return undefined;

        return {
            pid: row.pid,
            title: row.title,
            content: row.content,
            forum: { forumId: row.forum } as any,
            parentPost: row.parentPost ? { pid: row.parentPost } as any : undefined,
            category: row.category ? { postCategoryId: row.category } as any : undefined,
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
        } as Post;
    }

    public findRepliesByParentId(parentId: number): Post[] {
        const db = DB.getInstance();

        const rows = db.prepare(`
            SELECT p.PID as pid, p.Title as title, p.Content as content, p.ForumID as forum, p.ParentPID as parentPost, p.Post_Category_id as category, p.PublishedAt as publishedAt, p.ImageUrls as imageUrls, p.Likes as likes, p.Dislikes as dislikes,
                   u.UID as authorUid, u.Username as authorUsername, u.PublicName as authorPublicname,
                   (
                       (SELECT IFNULL(SUM(Likes - Dislikes), 0) FROM Post WHERE UID = u.UID) + 
                       (SELECT IFNULL(SUM(Likes - Dislikes), 0) FROM Comment WHERE UID = u.UID)
                   ) as authorTotalAura
            FROM Post p
            LEFT JOIN User u ON p.UID = u.UID
            WHERE p.ParentPID = ?
        `).all(parentId) as any[];
        return rows.map(row => ({
            pid: row.pid,
            title: row.title,
            content: row.content,
            forum: { forumId: row.forum } as any,
            parentPost: row.parentPost ? { pid: row.parentPost } as any : undefined,
            category: row.category ? { postCategoryId: row.category } as any : undefined,
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
        })) as Post[];
    }

    public findPostByForum(forumId: number): Post[] {
        const db = DB.getInstance();

        const rows = db.prepare(`
            SELECT p.PID as pid, p.Title as title, p.Content as content, p.ForumID as forum, p.ParentPID as parentPost, p.Post_Category_id as category, p.PublishedAt as publishedAt, p.ImageUrls as imageUrls, p.Likes as likes, p.Dislikes as dislikes,
                   u.UID as authorUid, u.Username as authorUsername, u.PublicName as authorPublicname,
                   (
                       (SELECT IFNULL(SUM(Likes - Dislikes), 0) FROM Post WHERE UID = u.UID) + 
                       (SELECT IFNULL(SUM(Likes - Dislikes), 0) FROM Comment WHERE UID = u.UID)
                   ) as authorTotalAura,
                   COUNT(c.CID) as commentCount
            FROM Post p
            LEFT JOIN User u ON p.UID = u.UID
            LEFT JOIN Comment c ON c.PID = p.PID AND c.ParentCID IS NULL
            WHERE p.ForumID = ?
            GROUP BY p.PID
        `).all(forumId) as any[];

        return rows.map(row => ({
            pid: row.pid,
            title: row.title,
            content: row.content,
            forum: { forumId: row.forum } as any,
            parentPost: row.parentPost ? { pid: row.parentPost } as any : undefined,
            category: row.category ? { postCategoryId: row.category } as any : undefined,
            publishedAt: row.publishedAt,
            imageUrls: row.imageUrls ? JSON.parse(row.imageUrls) : undefined,
            likes: row.likes,
            dislikes: row.dislikes,
            commentCount: row.commentCount,
            author: {
                uid: row.authorUid,
                username: row.authorUsername,
                publicname: row.authorPublicname,
                totalAura: row.authorTotalAura
            } as User
        })) as Post[];
    }

    public findPostByUser(userId: number): Post[] {
        const db = DB.getInstance();

        const rows = db.prepare(`
            SELECT p.PID as pid, p.Title as title, p.Content as content, p.ForumID as forum, p.ParentPID as parentPost, p.Post_Category_id as category, p.PublishedAt as publishedAt, p.ImageUrls as imageUrls, p.Likes as likes, p.Dislikes as dislikes,
                   u.UID as authorUid, u.Username as authorUsername, u.PublicName as authorPublicname,
                   (
                       (SELECT IFNULL(SUM(Likes - Dislikes), 0) FROM Post WHERE UID = u.UID) + 
                       (SELECT IFNULL(SUM(Likes - Dislikes), 0) FROM Comment WHERE UID = u.UID)
                   ) as authorTotalAura,
                   COUNT(c.CID) as commentCount
            FROM Post p
            LEFT JOIN User u ON p.UID = u.UID
            LEFT JOIN Comment c ON c.PID = p.PID AND c.ParentCID IS NULL
            WHERE p.UID = ?
            GROUP BY p.PID
        `).all(userId) as any[];

        return rows.map(row => ({
            pid: row.pid,
            title: row.title,
            content: row.content,
            forum: { forumId: row.forum } as any,
            parentPost: row.parentPost ? { pid: row.parentPost } as any : undefined,
            category: row.category ? { postCategoryId: row.category } as any : undefined,
            publishedAt: row.publishedAt,
            imageUrls: row.imageUrls ? JSON.parse(row.imageUrls) : undefined,
            likes: row.likes,
            dislikes: row.dislikes,
            commentCount: row.commentCount,
            author: {
                uid: row.authorUid,
                username: row.authorUsername,
                publicname: row.authorPublicname,
                totalAura: row.authorTotalAura
            } as User
        })) as Post[];
    }

    public findPostByCategory(categoryId: number): Post[] {
        const db = DB.getInstance();

        const rows = db.prepare(`
            SELECT p.PID as pid, p.Title as title, p.Content as content, p.ForumID as forum, p.ParentPID as parentPost, p.Post_Category_id as category, p.PublishedAt as publishedAt, p.ImageUrls as imageUrls, p.Likes as likes, p.Dislikes as dislikes,
                   u.UID as authorUid, u.Username as authorUsername, u.PublicName as authorPublicname,
                   (
                       (SELECT IFNULL(SUM(Likes - Dislikes), 0) FROM Post WHERE UID = u.UID) + 
                       (SELECT IFNULL(SUM(Likes - Dislikes), 0) FROM Comment WHERE UID = u.UID)
                   ) as authorTotalAura
            FROM Post p
            LEFT JOIN User u ON p.UID = u.UID
            WHERE p.Post_Category_id = ?
        `).all(categoryId) as any[];
        return rows.map(row => ({
            pid: row.pid,
            title: row.title,
            content: row.content,
            forum: { forumId: row.forum } as any,
            parentPost: row.parentPost ? { pid: row.parentPost } as any : undefined,
            category: row.category ? { postCategoryId: row.category } as any : undefined,
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
        })) as Post[];
    }

    public createPost(post: Post): void {
        const db = DB.getInstance();

        db.prepare(`
            INSERT INTO Post
            (Title, Content, UID, ForumID, ParentPID, Post_Category_id, PublishedAt, ImageUrls, Likes, Dislikes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
            post.title ?? null,
            post.content,
            post.author.uid,
            post.forum.forumId,
            null,
            post.category?.postCategoryId ?? null,
            post.publishedAt,
            post.imageUrls ? JSON.stringify(post.imageUrls) : null,
            0,
            0
        );
    }

    public likePost(id: number): void {
        const db = DB.getInstance();
        db.prepare(`UPDATE Post SET Likes = Likes + 1 WHERE PID = ?`).run(id);
    }

    public unlikePost(id: number): void {
        const db = DB.getInstance();
        db.prepare(`UPDATE Post SET Likes = MAX(0, Likes - 1) WHERE PID = ?`).run(id);
    }

    public dislikePost(id: number): void {
        const db = DB.getInstance();
        db.prepare(`UPDATE Post SET Dislikes = Dislikes + 1 WHERE PID = ?`).run(id);
    }

    public undislikePost(id: number): void {
        const db = DB.getInstance();
        db.prepare(`UPDATE Post SET Dislikes = MAX(0, Dislikes - 1) WHERE PID = ?`).run(id);
    }

    public createReply(post: Post): void {
        const db = DB.getInstance();

        db.prepare(`
            INSERT INTO Post
            (Title, Content, UID, ForumID, ParentPID, Post_Category_id, PublishedAt, ImageUrls, Likes, Dislikes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
            null,
            post.content,
            post.author.uid,
            post.forum.forumId,
            post.parentPost?.pid ?? null,
            post.category?.postCategoryId ?? null,
            post.publishedAt,
            post.imageUrls ? JSON.stringify(post.imageUrls) : null,
            0,
            0
        );
    }

    public findTrendingPosts(limit: number = 10): Post[] {
        const db = DB.getInstance();

        const rows = db.prepare(`
            SELECT p.PID as pid, p.Title as title, p.Content as content, p.ForumID as forum, p.ParentPID as parentPost, p.Post_Category_id as category, p.PublishedAt as publishedAt, p.ImageUrls as imageUrls, p.Likes as likes, p.Dislikes as dislikes,
                   u.UID as authorUid, u.Username as authorUsername, u.PublicName as authorPublicname,
                   f.Name as forumName,
                   fc.Forum_Category_id as forumCategoryId,
                   fc.Forum_Category_Name as forumCategoryName,
                   (
                       (SELECT IFNULL(SUM(Likes - Dislikes), 0) FROM Post WHERE UID = u.UID) + 
                       (SELECT IFNULL(SUM(Likes - Dislikes), 0) FROM Comment WHERE UID = u.UID)
                   ) as authorTotalAura,
                   COUNT(c.CID) as commentCount,
                   (p.Likes - p.Dislikes + COALESCE(COUNT(c.CID), 0) * 2) as TrendScore
            FROM Post p
            LEFT JOIN User u ON p.UID = u.UID
            LEFT JOIN Comment c ON p.PID = c.PID
            LEFT JOIN Forum f ON p.ForumID = f.ForumID
            LEFT JOIN Forum_Category fc ON f.Forum_Category_id = fc.Forum_Category_id
            WHERE p.ParentPID IS NULL
              AND p.PublishedAt >= datetime('now', '-7 days')
            GROUP BY p.PID
            ORDER BY TrendScore DESC
            LIMIT ?
        `).all(limit) as any[];

        return rows.map(row => ({
            pid: row.pid,
            title: row.title,
            content: row.content,
            forum: {
                forumId: row.forum,
                name: row.forumName,
                category: row.forumCategoryId ? {
                    forumCategoryId: row.forumCategoryId,
                    forumCategoryName: row.forumCategoryName
                } : undefined
            } as any,
            parentPost: row.parentPost ? { pid: row.parentPost } as any : undefined,
            category: row.category ? { postCategoryId: row.category } as any : undefined,
            publishedAt: row.publishedAt,
            imageUrls: row.imageUrls ? JSON.parse(row.imageUrls) : undefined,
            likes: row.likes,
            dislikes: row.dislikes,
            commentCount: row.commentCount,
            author: {
                uid: row.authorUid,
                username: row.authorUsername,
                publicname: row.authorPublicname,
                totalAura: row.authorTotalAura
            } as User
        })) as Post[];
    }
}