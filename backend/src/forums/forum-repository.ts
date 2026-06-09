import { DB } from "../database";
import {Forum} from "../../data/model";
import {PostRepository} from "../post/post-repository";

export class ForumRepository {
    private postRepository = new PostRepository();

    public findAllForums() : Forum[] {
        const db = DB.getInstance();
        const result = db.prepare(`
            SELECT f.ForumID as forumId, f.Name as name, f.Description as description, f.ParentForumID as parentForum, f.Forum_Category_id as category, f.AuthorID as authorId, f.CreatedAt as createdAt,
                   COUNT(DISTINCT p.PID) as postCount,
                   COUNT(DISTINCT u.UID) as memberCount
            FROM Forum f
            LEFT JOIN Post p ON f.ForumID = p.ForumID
            LEFT JOIN User_In_Forum u ON f.ForumID = u.ForumID
            GROUP BY f.ForumID
        `).all() as Forum[];
        return result;
    }

    public findForumById(id: number) : Forum {
        const db = DB.getInstance();
        const result = db.prepare(`
            SELECT f.ForumID as forumId, f.Name as name, f.Description as description, f.ParentForumID as parentForum, f.Forum_Category_id as category, f.AuthorID as authorId, f.CreatedAt as createdAt,
                   COUNT(DISTINCT u.UID) as memberCount
            FROM Forum f
            LEFT JOIN User_In_Forum u ON f.ForumID = u.ForumID
            WHERE f.ForumID = ?
            GROUP BY f.ForumID
        `).get(id) as Forum;
        if (result) {
            result.posts = this.postRepository.findPostByForum(result.forumId);
        }
        return result;
    }

    public findForumsByCategory(id: number) : Forum[] {
        const db = DB.getInstance();
        const result = db.prepare(`
            SELECT f.ForumID as forumId, f.Name as name, f.Description as description, f.ParentForumID as parentForum, f.Forum_Category_id as category, f.AuthorID as authorId, f.CreatedAt as createdAt,
                   COUNT(DISTINCT u.UID) as memberCount
            FROM Forum f
            LEFT JOIN User_In_Forum u ON f.ForumID = u.ForumID
            WHERE f.Forum_Category_id = ?
            GROUP BY f.ForumID
        `).all(id) as Forum[];
        return result;
    }

    public createForum(forum: Forum, authorUid?: number): number {
        const db = DB.getInstance();
        const insertForum = db.prepare("Insert into Forum (Name, Description, AuthorID, CreatedAt) values (?, ?, ?, ?)");
        const insertMember = db.prepare("Insert into User_In_Forum (UID, ForumID) values (?, ?)");

        const transaction = db.transaction(() => {
            const result = insertForum.run(forum.name, forum.description || null, authorUid || null, typeof forum.createdAt === 'string' ? forum.createdAt : forum.createdAt.toISOString());
            const newId = result.lastInsertRowid as number;
            
            if (authorUid) {
                insertMember.run(authorUid, newId);
            }
            
            return newId;
        });

        return transaction();
    }

    public updateForum(id: number, name: string, description?: string): boolean {
        const db = DB.getInstance();
        const result = db.prepare("UPDATE Forum SET Name = ?, Description = ? WHERE ForumID = ?").run(name, description || null, id);
        return result.changes > 0;
    }

    public deleteForum(id: number): boolean {
        const db = DB.getInstance();
        const result = db.prepare("DELETE FROM Forum WHERE ForumID = ?").run(id);
        return result.changes > 0;
    }

    public findTrendingForums(limit: number = 5) : Forum[] {
        const db = DB.getInstance();
        const result = db.prepare(`
            SELECT f.ForumID as forumId, f.Name as name, f.Description as description, f.ParentForumID as parentForum, f.Forum_Category_id as category, f.AuthorID as authorId, f.CreatedAt as createdAt,
                   COUNT(DISTINCT p.PID) as recentPostCount,
                   COUNT(DISTINCT c.CID) as recentCommentCount,
                   COUNT(DISTINCT u.UID) as memberCount,
                   (COUNT(DISTINCT p.PID) * 5 + COUNT(DISTINCT c.CID)) as TrendScore
            FROM Forum f
            LEFT JOIN Post p ON f.ForumID = p.ForumID AND p.PublishedAt >= datetime('now', '-7 days')
            LEFT JOIN Comment c ON p.PID = c.PID AND c.PublishedAt >= datetime('now', '-7 days')
            LEFT JOIN User_In_Forum u ON f.ForumID = u.ForumID
            GROUP BY f.ForumID
            ORDER BY TrendScore DESC
            LIMIT ?
        `).all(limit) as Forum[];
        return result;
    }

    public joinForum(userId: number, forumId: number): boolean {
        const db = DB.getInstance();
        try {
            const result = db.prepare("INSERT INTO User_In_Forum (UID, ForumID) VALUES (?, ?)").run(userId, forumId);
            return result.changes > 0;
        } catch (e) {
            return false; // likely already joined
        }
    }

    public leaveForum(userId: number, forumId: number): boolean {
        const db = DB.getInstance();
        const result = db.prepare("DELETE FROM User_In_Forum WHERE UID = ? AND ForumID = ?").run(userId, forumId);
        return result.changes > 0;
    }

    public isUserInForum(userId: number, forumId: number): boolean {
        const db = DB.getInstance();
        const result = db.prepare("SELECT 1 FROM User_In_Forum WHERE UID = ? AND ForumID = ?").get(userId, forumId);
        return !!result;
    }
}

