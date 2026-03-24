import { DB } from "../database";
import {Post, User} from "../../data/model";

export class PostRepository {
    public findAllPosts(): Post[] {
        const db = DB.createDBConnection();
        try {
            return db.prepare("SELECT * FROM Post").all() as Post[];
        } finally {
            db.close();
        }
    }

    public findPostById(id: number): Post | undefined {
        const db = DB.createDBConnection();
        try {
            return db.prepare("SELECT * FROM Post WHERE PID = ?").get(id) as Post | undefined;
        } finally {
            db.close();
        }
    }

    public findPostByForum(forumId: number): Post[] {
        const db = DB.createDBConnection();
        try {
            return db.prepare("SELECT * FROM Post WHERE ForumID = ?").all(forumId) as Post[];
        } finally {
            db.close();
        }
    }

    public findPostByUser(userId: number): Post[] {
        const db = DB.createDBConnection();
        try {
            return db.prepare("SELECT * FROM Post WHERE UID = ?").all(userId) as Post[];
        } finally {
            db.close();
        }
    }

    public findPostByCategory(categoryId: number): Post[] {
        const db = DB.createDBConnection();
        try {
            return db.prepare("SELECT * FROM Post WHERE Post_Category_id = ?").all(categoryId) as Post[];
        } finally {
            db.close();
        }
    }

    public create(post: Post): void {
        const db = DB.createDBConnection();

        try {
            db.prepare(`
            INSERT INTO Post
            (PID, Title, Content, UID, ForumID, PublishedAt, Likes, Dislikes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
                post.pid,
                post.title,
                post.content,
                post.author.uid,
                post.forum.forumId,
                post.publishedAt,
                post.likes,
                post.dislikes
            );
        } finally {
            db.close();
        }
    }
}