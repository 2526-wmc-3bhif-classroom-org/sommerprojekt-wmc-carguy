import { DB } from "../database";
import { Post } from "../../data/model";

export class PostRepository {

    public findAllRootPosts(): Post[] {
        const db = DB.createDBConnection();

        try {
            return db.prepare(`
                SELECT * FROM Post
                WHERE ParentPID IS NULL
            `).all() as Post[];
        } finally {
            db.close();
        }
    }

    public findPostById(id: number): Post | undefined {
        const db = DB.createDBConnection();

        try {
            return db.prepare(`
                SELECT * FROM Post
                WHERE PID = ?
            `).get(id) as Post | undefined;
        } finally {
            db.close();
        }
    }

    public findRepliesByParentId(parentId: number): Post[] {
        const db = DB.createDBConnection();

        try {
            return db.prepare(`
                SELECT * FROM Post
                WHERE ParentPID = ?
            `).all(parentId) as Post[];
        } finally {
            db.close();
        }
    }

    public findPostByForum(forumId: number): Post[] {
        const db = DB.createDBConnection();

        try {
            return db.prepare(`
                SELECT * FROM Post
                WHERE ForumID = ?
            `).all(forumId) as Post[];
        } finally {
            db.close();
        }
    }

    public findPostByUser(userId: number): Post[] {
        const db = DB.createDBConnection();

        try {
            return db.prepare(`
                SELECT * FROM Post
                WHERE UID = ?
            `).all(userId) as Post[];
        } finally {
            db.close();
        }
    }

    public findPostByCategory(categoryId: number): Post[] {
        const db = DB.createDBConnection();

        try {
            return db.prepare(`
                SELECT * FROM Post
                WHERE Post_Category_id = ?
            `).all(categoryId) as Post[];
        } finally {
            db.close();
        }
    }

    public createPost(post: Post): void {
        const db = DB.createDBConnection();

        try {
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
        } finally {
            db.close();
        }
    }

    public createReply(post: Post): void {
        const db = DB.createDBConnection();

        try {
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
        } finally {
            db.close();
        }
    }
}