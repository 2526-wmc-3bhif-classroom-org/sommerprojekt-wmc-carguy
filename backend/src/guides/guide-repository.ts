import { DB } from "../database";
import { Guide, User } from "../../data/model";

export class GuideRepository {
    public findAllGuides(): Guide[] {
        const db = DB.getInstance();

        const rows = db.prepare(`
            SELECT g.GuideID as id, g.Title as title, g.Description as description, g.Content as content, g.PublishedAt as publishedAt, g.Likes as likes, g.Dislikes as dislikes,
                   u.UID as authorUid, u.Username as authorUsername, u.PublicName as authorPublicname,
                   (
                       (SELECT IFNULL(SUM(Likes - Dislikes), 0) FROM Post WHERE UID = u.UID) + 
                       (SELECT IFNULL(SUM(Likes - Dislikes), 0) FROM Comment WHERE UID = u.UID)
                   ) as authorTotalAura
            FROM Guide g
            LEFT JOIN User u ON g.UID = u.UID
            ORDER BY g.GuideID DESC
        `).all() as any[];

        return rows.map(row => ({
            id: row.id,
            title: row.title,
            description: row.description,
            content: row.content ? JSON.parse(row.content) : [],
            publishedAt: row.publishedAt,
            likes: row.likes,
            dislikes: row.dislikes,
            author: {
                uid: row.authorUid,
                username: row.authorUsername,
                publicname: row.authorPublicname,
                totalAura: row.authorTotalAura
            } as User
        })) as Guide[];
    }

    public findGuideById(id: number): Guide | undefined {
        const db = DB.getInstance();

        const row = db.prepare(`
            SELECT g.GuideID as id, g.Title as title, g.Description as description, g.Content as content, g.PublishedAt as publishedAt, g.Likes as likes, g.Dislikes as dislikes,
                   u.UID as authorUid, u.Username as authorUsername, u.PublicName as authorPublicname,
                   (
                       (SELECT IFNULL(SUM(Likes - Dislikes), 0) FROM Post WHERE UID = u.UID) + 
                       (SELECT IFNULL(SUM(Likes - Dislikes), 0) FROM Comment WHERE UID = u.UID)
                   ) as authorTotalAura
            FROM Guide g
            LEFT JOIN User u ON g.UID = u.UID
            WHERE g.GuideID = ?
        `).get(id) as any;

        if (!row) return undefined;

        return {
            id: row.id,
            title: row.title,
            description: row.description,
            content: row.content ? JSON.parse(row.content) : [],
            publishedAt: row.publishedAt,
            likes: row.likes,
            dislikes: row.dislikes,
            author: {
                uid: row.authorUid,
                username: row.authorUsername,
                publicname: row.authorPublicname,
                totalAura: row.authorTotalAura
            } as User
        } as Guide;
    }

    public createGuide(guide: Omit<Guide, "id" | "likes" | "dislikes" | "publishedAt">): void {
        const db = DB.getInstance();

        db.prepare(`
            INSERT INTO Guide (Title, Description, Content, UID, PublishedAt, Likes, Dislikes)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(
            guide.title,
            guide.description,
            JSON.stringify(guide.content),
            guide.author.uid,
            new Date().toISOString(),
            0,
            0
        );
    }

    public findGuideAuthorUid(id: number): number | undefined {
        const db = DB.getInstance();
        const row = db.prepare("SELECT UID FROM Guide WHERE GuideID = ?").get(id) as { UID: number } | undefined;
        return row?.UID;
    }

    public updateGuide(id: number, title: string, description: string, content: string[]): void {
        const db = DB.getInstance();
        db.prepare(`
            UPDATE Guide SET Title = ?, Description = ?, Content = ? WHERE GuideID = ?
        `).run(title, description, JSON.stringify(content), id);
    }

    public deleteGuide(id: number): void {
        const db = DB.getInstance();
        db.prepare("DELETE FROM Guide WHERE GuideID = ?").run(id);
    }
}
