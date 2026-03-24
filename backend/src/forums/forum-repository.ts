import { DB } from "../database";
import {Forum} from "../../data/model";

export class ForumRepository {
    public findAllForums() : Forum[] {
        const db = DB.createDBConnection();
        const result = db.prepare("SELECT * FROM Forum").all() as Forum[] ;
        db.close();
        return result;
    }

    public findForumById(id: number) : Forum {
        const db = DB.createDBConnection();
        const result = db.prepare("SELECT * FROM Forum WHERE ForumID = ?").get(id) as Forum;
        db.close();
        return result;
    }

    public findForumsByCategory(id: number) : Forum[] {
        const db = DB.createDBConnection();
        const result = db.prepare("SELECT * FROM Forum WHERE Forum_Category_id = ?").all(id) as Forum[];

        db.close();
        return result;
    }

    public createForum(forum: Forum) {
        const db = DB.createDBConnection();
        db.prepare("Insert into Forum (Name, Description, CreatedAt) values (?, ?, ?)").run(forum.name, forum.description, forum.createdAt);
        db.close()
    }
}

