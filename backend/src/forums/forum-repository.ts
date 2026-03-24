import { DB } from "../database";
import {Forum} from "../../data/model";

export class ForumRepository {
    public findAllForums() {
        const db = DB.createDBConnection();
        const result = db.prepare("SELECT * FROM Forum").all();
        db.close();
        return result;
    }

    public findForumById(id: number) {
        const db = DB.createDBConnection();
        const result = db.prepare("SELECT * FROM Forum WHERE ForumID = ?").get(id);
        db.close();
        return result;
    }

    public findForumByCategory(id: number) {
        const db = DB.createDBConnection();
        const result = db.prepare("SELECT * FROM Forum WHERE Forum_Category_id = ?").all(id);

        db.close();
        return result;
    }

    public create(forum: Forum): void {
        const db = DB.createDBConnection();

        try {
            db.prepare(`
                INSERT INTO Forum
                (ForumID, Name, Description, ParentForumID, Forum_Category_id, CreatedAt)
                VALUES (?, ?, ?, ?, ?, ?)
            `).run(
                forum.forumId,
                forum.name,
                forum.description ?? null,
                forum.parentForumId ?? null,
                forum.category?.forumCategoryId ?? null,
                forum.createdAt
            );
        } finally {
            db.close();
        }
    }
}

