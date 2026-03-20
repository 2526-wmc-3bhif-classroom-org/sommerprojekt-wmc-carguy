import { DB } from "../database";

export class CommentRepository{
    public getAllComments() {
        const db = DB.createDBConnection();

        const result = db.prepare(`
        SELECT *
        FROM Comment`).all() as Comment[];

        db.close();
        return result;
    }

    public getCommentById(id: number) {
        const db = DB.createDBConnection();

        const result = db.prepare(`
        SELECT *
        FROM Comment
        WHERE CID = ?`).get(id) as Comment;

        db.close();
        return result;
    }

    public getCommentsByPost(id: number):Comment[] {
        const db = DB.createDBConnection();

        const result = db.prepare(`
        SELECT *
        FROM Comment
        where PID = ?`).all(id) as Comment[];

        db.close();
        return result;
    }

    public getCommentsByParentComment(pid: number) :Comment[] {
        const db = DB.createDBConnection();

        const result = db.prepare(`
        SELECT *
        FROM Comment
        WHERE PARENT_CID = ?`).all(pid) as Comment[];

        return result;
    }
}