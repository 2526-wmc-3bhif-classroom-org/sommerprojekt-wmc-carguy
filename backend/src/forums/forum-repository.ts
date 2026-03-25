import { DB } from "../database";
import {Forum} from "../../data/model";

export class ForumRepository {
    public findAllForums() : Forum[] {
        const db = DB.getInstance();
        const result = db.prepare("SELECT ForumID as forumId, Name as name, Description as description, ParentForumID as parentForum, Forum_Category_id as category, CreatedAt as createdAt FROM Forum").all() as Forum[];
        console.log(result);
        return result;
    }

    public findForumById(id: number) : Forum {
        const db = DB.getInstance();
        const result = db.prepare("SELECT ForumID as forumId, Name as name, Description as description, ParentForumID as parentForum, Forum_Category_id as category, CreatedAt as createdAt FROM Forum WHERE ForumID = ?").get(id) as Forum;
        return result;
    }

    public findForumsByCategory(id: number) : Forum[] {
        const db = DB.getInstance();
        const result = db.prepare("SELECT ForumID as forumId, Name as name, Description as description, ParentForumID as parentForum, Forum_Category_id as category, CreatedAt as createdAt FROM Forum WHERE Forum_Category_id = ?").all(id) as Forum[];
        return result;
    }

    public createForum(forum: Forum) {
        const db = DB.getInstance();
        db.prepare("Insert into Forum (Name, Description, CreatedAt) values (?, ?, ?)").run(forum.name, forum.description, forum.createdAt);
    }
}

