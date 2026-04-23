import { DB } from "../database";
import { Post } from "../../data/model";

export class PostRepository {

    public findAllRootPosts(): Post[] {
        const db = DB.getInstance();

        return db.prepare(`
            SELECT PID as pid, Title as title, Content as content, UID as author, ForumID as forum, ParentPID as parentPost, Post_Category_id as category, PublishedAt as publishedAt, Likes as likes, Dislikes as dislikes FROM Post
            WHERE ParentPID IS NULL
        `).all() as Post[];
    }

    public findPostById(id: number): Post | undefined {
        const db = DB.getInstance();

        return db.prepare(`
            SELECT PID as pid, Title as title, Content as content, UID as author, ForumID as forum, ParentPID as parentPost, Post_Category_id as category, PublishedAt as publishedAt, Likes as likes, Dislikes as dislikes FROM Post
            WHERE PID = ?
        `).get(id) as Post | undefined;
    }

    public findRepliesByParentId(parentId: number): Post[] {
        const db = DB.getInstance();

        return db.prepare(`
            SELECT PID as pid, Title as title, Content as content, UID as author, ForumID as forum, ParentPID as parentPost, Post_Category_id as category, PublishedAt as publishedAt, Likes as likes, Dislikes as dislikes FROM Post
            WHERE ParentPID = ?
        `).all(parentId) as Post[];
    }

    public findPostByForum(forumId: number): Post[] {
        const db = DB.getInstance();

        return db.prepare(`
            SELECT PID as pid, Title as title, Content as content, UID as author, ForumID as forum, ParentPID as parentPost, Post_Category_id as category, PublishedAt as publishedAt, Likes as likes, Dislikes as dislikes FROM Post
            WHERE ForumID = ?
        `).all(forumId) as Post[];
    }

    public findPostByUser(userId: number): Post[] {
        const db = DB.getInstance();

        return db.prepare(`
            SELECT PID as pid, Title as title, Content as content, UID as author, ForumID as forum, ParentPID as parentPost, Post_Category_id as category, PublishedAt as publishedAt, Likes as likes, Dislikes as dislikes FROM Post
            WHERE UID = ?
        `).all(userId) as Post[];
    }

    public findPostByCategory(categoryId: number): Post[] {
        const db = DB.getInstance();

        return db.prepare(`
            SELECT PID as pid, Title as title, Content as content, UID as author, ForumID as forum, ParentPID as parentPost, Post_Category_id as category, PublishedAt as publishedAt, Likes as likes, Dislikes as dislikes FROM Post
            WHERE Post_Category_id = ?
        `).all(categoryId) as Post[];
    }

    public createPost(post: Post): void {
        const db = DB.getInstance();

        db.prepare(`
            INSERT INTO Post
            (PID, Title, Content, UID, ForumID, ParentPID, Post_Category_id, PublishedAt, Likes, Dislikes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
            post.pid,
            post.title ?? null,
            post.content,
            post.author.uid,
            post.forum.forumId,
            null,
            post.category?.postCategoryId ?? null,
            post.publishedAt,
            post.likes,
            post.dislikes
        );
    }

    public createReply(post: Post): void {
        const db = DB.getInstance();

        db.prepare(`
            INSERT INTO Post
            (PID, Title, Content, UID, ForumID, ParentPID, Post_Category_id, PublishedAt, Likes, Dislikes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
            post.pid,
            null,
            post.content,
            post.author.uid,
            post.forum.forumId,
            post.parentPost?.pid ?? null,
            post.category?.postCategoryId ?? null,
            post.publishedAt,
            post.likes,
            post.dislikes
        );
    }
}