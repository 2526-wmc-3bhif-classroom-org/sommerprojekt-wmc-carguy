import { DB } from "../database";
import { Post } from "../../data/model";

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
}