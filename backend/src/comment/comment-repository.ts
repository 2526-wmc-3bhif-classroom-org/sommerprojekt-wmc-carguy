import { DB } from "../database";

export function findAllPosts() {
    const db = DB.createDBConnection();

    const result = db.prepare(`
        SELECT *
        FROM Post
    `).all();

    db.close();
    return result;
}

export function findAllPostsById(id: number) {
    const db = DB.createDBConnection();

    const result = db.prepare(`
        SELECT *
        FROM Post
        WHERE PID = ?
    `).all(id);

    db.close();
    return result;
}