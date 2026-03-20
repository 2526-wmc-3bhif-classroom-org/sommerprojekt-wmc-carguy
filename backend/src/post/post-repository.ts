import { DB } from "../database";

export function findAllPosts() {
    const db = DB.createDBConnection();
    const result = db.prepare(`SELECT * FROM Post`).all();
    db.close();
    return result;
}

export function findPostById(id: number) {
    const db = DB.createDBConnection();

    const result = db.prepare('SELECT * FROM Post WHERE PID = ?').get(id);
    db.close();
    return result;
}

export function findPostByForum(forumId: number) {
    const db = DB.createDBConnection();

    const result = db.prepare('SELECT * FROM Post WHERE ForumID = ?').all(forumId);
    db.close();
    return result;
}

export function findPostByUser(userId: number) {
    const db = DB.createDBConnection();

    const result = db.prepare('SELECT * FROM Post WHERE UID = ?').all(userId);
    db.close();
    return result;
}

export function findPostByCategory(categoryId: number) {
    const db = DB.createDBConnection();

    const result = db.prepare('SELECT * FROM Post WHERE Post_Category_id = ?').all(categoryId);
    db.close();
    return result;
}