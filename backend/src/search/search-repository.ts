import { DB } from "../database";
import { Post, User, Forum } from "../../data/model";

export class SearchRepository {
    public searchPosts(query: string): Post[] {
        const db = DB.getInstance();
        const likeQuery = `%${query}%`;

        const rows = db.prepare(`
            SELECT p.PID as pid, p.Title as title, p.Content as content, p.ForumID as forum, 
                   p.ParentPID as parentPost, p.Post_Category_id as category, p.PublishedAt as publishedAt, 
                   p.ImageUrls as imageUrls, p.Likes as likes, p.Dislikes as dislikes,
                   u.UID as authorUid, u.Username as authorUsername, u.PublicName as authorPublicname,
                   (
                       (SELECT IFNULL(SUM(Likes - Dislikes), 0) FROM Post WHERE UID = u.UID) + 
                       (SELECT IFNULL(SUM(Likes - Dislikes), 0) FROM Comment WHERE UID = u.UID)
                   ) as authorTotalAura,
                   (SELECT Name FROM Forum WHERE ForumID = p.ForumID) as forumName
            FROM Post p
            LEFT JOIN User u ON p.UID = u.UID
            WHERE p.Title LIKE ? OR p.Content LIKE ?
        `).all(likeQuery, likeQuery) as any[];

        return rows.map(row => ({
            pid: row.pid,
            title: row.title,
            content: row.content,
            forum: { forumId: row.forum, name: row.forumName } as any,
            parentPost: row.parentPost ? { pid: row.parentPost } as any : undefined,
            category: row.category ? { postCategoryId: row.category } as any : undefined,
            publishedAt: row.publishedAt,
            imageUrls: row.imageUrls ? JSON.parse(row.imageUrls) : undefined,
            likes: row.likes,
            dislikes: row.dislikes,
            author: {
                uid: row.authorUid,
                username: row.authorUsername,
                publicname: row.authorPublicname,
                totalAura: row.authorTotalAura
            } as User
        })) as Post[];
    }

    public searchUsers(query: string): User[] {
        const db = DB.getInstance();
        const likeQuery = `%${query}%`;

        const result = db.prepare(`
            SELECT 
                UID as uid, 
                Username as username, 
                Password as password, 
                PublicName as publicname, 
                Description as description, 
                Title as title, 
                Image as image, 
                CreatedAt as createdAt,
                Role as role,
                (SELECT COUNT(*) FROM Post WHERE UID = User.UID) as totalPosts,
                (SELECT COUNT(*) FROM Comment WHERE UID = User.UID) as totalComments,
                (
                    (SELECT IFNULL(SUM(Likes - Dislikes), 0) FROM Post WHERE UID = User.UID) + 
                    (SELECT IFNULL(SUM(Likes - Dislikes), 0) FROM Comment WHERE UID = User.UID)
                ) as totalAura
            FROM User
            WHERE Username LIKE ? OR PublicName LIKE ?
        `).all(likeQuery, likeQuery);

        return result as unknown as User[];
    }

    public searchForums(query: string): Forum[] {
        const db = DB.getInstance();
        const likeQuery = `%${query}%`;

        const result = db.prepare(`
            SELECT f.ForumID as forumId, f.Name as name, f.Description as description, 
                   f.ParentForumID as parentForum, f.Forum_Category_id as category, f.CreatedAt as createdAt,
                   COUNT(DISTINCT u.UID) as memberCount
            FROM Forum f
            LEFT JOIN User_In_Forum u ON f.ForumID = u.ForumID
            WHERE f.Name LIKE ? OR f.Description LIKE ?
            GROUP BY f.ForumID
        `).all(likeQuery, likeQuery) as Forum[];

        return result;
    }
}
