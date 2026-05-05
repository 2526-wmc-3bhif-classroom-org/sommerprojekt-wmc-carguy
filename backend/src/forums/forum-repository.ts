import { DB } from "../database";
import {Forum} from "../../data/model";
import {PostRepository} from "../post/post-repository";

export class ForumRepository {
    private postRepository = new PostRepository();

    public findAllForums() : Forum[] {
        const db = DB.getInstance();
        const result = db.prepare(`
            SELECT f.ForumID as forumId, f.Name as name, f.Description as description, f.ParentForumID as parentForum, f.Forum_Category_id as category, f.CreatedAt as createdAt,
                   COUNT(p.PID) as postCount
            FROM Forum f
            LEFT JOIN Post p ON f.ForumID = p.ForumID
            GROUP BY f.ForumID
        `).all() as Forum[];
        return result;
    }

    public findForumById(id: number) : Forum {
        const db = DB.getInstance();
        const result = db.prepare("SELECT ForumID as forumId, Name as name, Description as description, ParentForumID as parentForum, Forum_Category_id as category, CreatedAt as createdAt FROM Forum WHERE ForumID = ?").get(id) as Forum;
        if (result) {
            result.posts = this.postRepository.findPostByForum(result.forumId);
        }
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

