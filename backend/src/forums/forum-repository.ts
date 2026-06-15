import { DB } from "../database";
import { Forum, ForumCategory } from "../../data/model";
import { PostRepository } from "../post/post-repository";

export class ForumRepository {
    private postRepository = new PostRepository();

    private mapRowToForum(row: any): Forum {
        if (!row) return row;
        const forum: Forum = {
            forumId: row.forumId,
            name: row.name,
            description: row.description || undefined,
            parentForum: row.parentForum ? { forumId: row.parentForum } as any : undefined,
            createdAt: row.createdAt,
            category: row.categoryId ? {
                forumCategoryId: row.categoryId,
                forumCategoryName: row.categoryName
            } : undefined,
            memberCount: row.memberCount,
            authorId: row.authorId
        };
        // Add dynamic properties if they exist
        if (row.postCount !== undefined) {
            (forum as any).postCount = row.postCount;
        }
        if (row.recentPostCount !== undefined) {
            (forum as any).recentPostCount = row.recentPostCount;
        }
        if (row.recentCommentCount !== undefined) {
            (forum as any).recentCommentCount = row.recentCommentCount;
        }
        if (row.TrendScore !== undefined) {
            (forum as any).TrendScore = row.TrendScore;
        }
        if (row.posts !== undefined) {
            forum.posts = row.posts;
        }
        if (row.subForums !== undefined) {
            forum.subForums = row.subForums;
        }
        return forum;
    }

    public findAllCategories(): ForumCategory[] {
        const db = DB.getInstance();
        return db.prepare(`
            SELECT Forum_Category_id as forumCategoryId, Forum_Category_Name as forumCategoryName
            FROM Forum_Category
        `).all() as ForumCategory[];
    }

    public findJoinedForums(userId: number): Forum[] {
        const db = DB.getInstance();
        const rows = db.prepare(`
            SELECT f.ForumID as forumId, f.Name as name, f.Description as description, f.ParentForumID as parentForum,
                   fc.Forum_Category_id as categoryId, fc.Forum_Category_Name as categoryName,
                   f.AuthorID as authorId, f.CreatedAt as createdAt,
                   COUNT(DISTINCT p.PID) as postCount,
                   COUNT(DISTINCT u2.UID) as memberCount
            FROM Forum f
            INNER JOIN User_In_Forum u ON f.ForumID = u.ForumID
            LEFT JOIN Forum_Category fc ON f.Forum_Category_id = fc.Forum_Category_id
            LEFT JOIN Post p ON f.ForumID = p.ForumID
            LEFT JOIN User_In_Forum u2 ON f.ForumID = u2.ForumID
            WHERE u.UID = ?
            GROUP BY f.ForumID
        `).all(userId) as any[];
        return rows.map(row => this.mapRowToForum(row));
    }

    public findAllForums() : Forum[] {
        const db = DB.getInstance();
        const rows = db.prepare(`
            SELECT f.ForumID as forumId, f.Name as name, f.Description as description, f.ParentForumID as parentForum,
                   fc.Forum_Category_id as categoryId, fc.Forum_Category_Name as categoryName,
                   f.AuthorID as authorId, f.CreatedAt as createdAt,
                   COUNT(DISTINCT p.PID) as postCount,
                   COUNT(DISTINCT u.UID) as memberCount
            FROM Forum f
            LEFT JOIN Forum_Category fc ON f.Forum_Category_id = fc.Forum_Category_id
            LEFT JOIN Post p ON f.ForumID = p.ForumID
            LEFT JOIN User_In_Forum u ON f.ForumID = u.ForumID
            GROUP BY f.ForumID
        `).all() as any[];
        return rows.map(row => this.mapRowToForum(row));
    }

    public findForumById(id: number) : Forum {
        const db = DB.getInstance();
        const row = db.prepare(`
            SELECT f.ForumID as forumId, f.Name as name, f.Description as description, f.ParentForumID as parentForum,
                   fc.Forum_Category_id as categoryId, fc.Forum_Category_Name as categoryName,
                   f.AuthorID as authorId, f.CreatedAt as createdAt,
                   COUNT(DISTINCT u.UID) as memberCount
            FROM Forum f
            LEFT JOIN Forum_Category fc ON f.Forum_Category_id = fc.Forum_Category_id
            LEFT JOIN User_In_Forum u ON f.ForumID = u.ForumID
            WHERE f.ForumID = ?
            GROUP BY f.ForumID
        `).get(id) as any;
        if (!row) return row;
        const result = this.mapRowToForum(row);
        result.posts = this.postRepository.findPostByForum(result.forumId);
        return result;
    }

    public findForumsByCategory(id: number) : Forum[] {
        const db = DB.getInstance();
        const rows = db.prepare(`
            SELECT f.ForumID as forumId, f.Name as name, f.Description as description, f.ParentForumID as parentForum,
                   fc.Forum_Category_id as categoryId, fc.Forum_Category_Name as categoryName,
                   f.AuthorID as authorId, f.CreatedAt as createdAt,
                   COUNT(DISTINCT u.UID) as memberCount
            FROM Forum f
            LEFT JOIN Forum_Category fc ON f.Forum_Category_id = fc.Forum_Category_id
            LEFT JOIN User_In_Forum u ON f.ForumID = u.ForumID
            WHERE f.Forum_Category_id = ?
            GROUP BY f.ForumID
        `).all(id) as any[];
        return rows.map(row => this.mapRowToForum(row));
    }

    public findBrandsWithModels(): Forum[] {
        const db = DB.getInstance();
        const brandsRows = db.prepare(`
            SELECT f.ForumID as forumId, f.Name as name, f.Description as description, f.ParentForumID as parentForum,
                   fc.Forum_Category_id as categoryId, fc.Forum_Category_Name as categoryName,
                   f.AuthorID as authorId, f.CreatedAt as createdAt,
                   COUNT(DISTINCT p.PID) as postCount,
                   COUNT(DISTINCT u.UID) as memberCount
            FROM Forum f
            LEFT JOIN Forum_Category fc ON f.Forum_Category_id = fc.Forum_Category_id
            LEFT JOIN Post p ON f.ForumID = p.ForumID
            LEFT JOIN User_In_Forum u ON f.ForumID = u.ForumID
            WHERE f.Forum_Category_id = 1 AND f.ParentForumID IS NULL
            GROUP BY f.ForumID
        `).all() as any[];

        const subForumsRows = db.prepare(`
            SELECT f.ForumID as forumId, f.Name as name, f.Description as description, f.ParentForumID as parentForum,
                   fc.Forum_Category_id as categoryId, fc.Forum_Category_Name as categoryName,
                   f.AuthorID as authorId, f.CreatedAt as createdAt,
                   COUNT(DISTINCT p.PID) as postCount,
                   COUNT(DISTINCT u.UID) as memberCount
            FROM Forum f
            LEFT JOIN Forum_Category fc ON f.Forum_Category_id = fc.Forum_Category_id
            LEFT JOIN Post p ON f.ForumID = p.ForumID
            LEFT JOIN User_In_Forum u ON f.ForumID = u.ForumID
            WHERE f.ParentForumID IS NOT NULL AND f.Forum_Category_id = 1
            GROUP BY f.ForumID
        `).all() as any[];

        const brands = brandsRows.map(row => this.mapRowToForum(row));
        const subForums = subForumsRows.map(row => this.mapRowToForum(row));

        const subsByParent = new Map<number, Forum[]>();
        for (const sub of subForums) {
            const parentId = sub.parentForum as unknown as number;
            if (!subsByParent.has(parentId)) subsByParent.set(parentId, []);
            subsByParent.get(parentId)!.push(sub);
        }

        for (const brand of brands) {
            brand.subForums = subsByParent.get(brand.forumId) || [];
        }

        return brands;
    }

    public createForum(forum: Forum, authorUid?: number, parentForumId?: number, categoryId?: number): number {
        const db = DB.getInstance();
        const insertForum = db.prepare("INSERT INTO Forum (Name, Description, AuthorID, ParentForumID, Forum_Category_id, CreatedAt) VALUES (?, ?, ?, ?, ?, ?)");
        const insertMember = db.prepare("INSERT INTO User_In_Forum (UID, ForumID) VALUES (?, ?)");

        const transaction = db.transaction(() => {
            const result = insertForum.run(
                forum.name,
                forum.description || null,
                authorUid || null,
                parentForumId || null,
                categoryId || null,
                typeof forum.createdAt === 'string' ? forum.createdAt : forum.createdAt.toISOString()
            );
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
        const rows = db.prepare(`
            SELECT f.ForumID as forumId, f.Name as name, f.Description as description, f.ParentForumID as parentForum,
                   fc.Forum_Category_id as categoryId, fc.Forum_Category_Name as categoryName,
                   f.AuthorID as authorId, f.CreatedAt as createdAt,
                   COUNT(DISTINCT p.PID) as recentPostCount,
                   COUNT(DISTINCT c.CID) as recentCommentCount,
                   COUNT(DISTINCT u.UID) as memberCount,
                   (COUNT(DISTINCT p.PID) * 5 + COUNT(DISTINCT c.CID)) as TrendScore
            FROM Forum f
            LEFT JOIN Forum_Category fc ON f.Forum_Category_id = fc.Forum_Category_id
            LEFT JOIN Post p ON f.ForumID = p.ForumID AND p.PublishedAt >= datetime('now', '-7 days')
            LEFT JOIN Comment c ON p.PID = c.PID AND c.PublishedAt >= datetime('now', '-7 days')
            LEFT JOIN User_In_Forum u ON f.ForumID = u.ForumID
            GROUP BY f.ForumID
            ORDER BY TrendScore DESC
            LIMIT ?
        `).all(limit) as any[];
        return rows.map(row => this.mapRowToForum(row));
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
