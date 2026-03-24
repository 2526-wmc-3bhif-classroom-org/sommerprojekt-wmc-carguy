import { DB } from "../database";

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
}

