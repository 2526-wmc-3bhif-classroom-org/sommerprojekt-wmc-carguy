import { DB } from "../database";
import { Shout, User } from "../../data/model";

export class ShoutRepository {
    public findRecentShouts(limit: number = 30): Shout[] {
        const db = DB.getInstance();
        const rows = db.prepare(`
            SELECT s.SID as sid, s.Content as content, s.PublishedAt as publishedAt,
                   u.UID as authorUid, u.Username as authorUsername, u.PublicName as authorPublicname, u.Image as authorImage,
                   (
                       (SELECT IFNULL(SUM(Likes - Dislikes), 0) FROM Post WHERE UID = u.UID) + 
                       (SELECT IFNULL(SUM(Likes - Dislikes), 0) FROM Comment WHERE UID = u.UID)
                   ) as authorTotalAura
            FROM Shout s
            LEFT JOIN User u ON s.UID = u.UID
            ORDER BY s.SID DESC
            LIMIT ?
        `).all(limit) as any[];

        // Return sorted chronologically (oldest to newest) for a chat-like feed
        return rows.map(row => ({
            sid: row.sid,
            content: row.content,
            publishedAt: row.publishedAt,
            author: {
                uid: row.authorUid,
                username: row.authorUsername,
                publicname: row.authorPublicname,
                image: row.authorImage,
                totalAura: row.authorTotalAura
            } as User
        })).reverse();
    }

    public createShout(content: string, userId: number): void {
        const db = DB.getInstance();
        db.prepare(`
            INSERT INTO Shout (Content, UID, PublishedAt)
            VALUES (?, ?, ?)
        `).run(content, userId, new Date().toISOString());
    }

    public deleteShout(sid: number): void {
        const db = DB.getInstance();
        db.prepare(`
            DELETE FROM Shout WHERE SID = ?
        `).run(sid);
    }
}
