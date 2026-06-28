import { DB } from "../database";

export interface Attendee {
    uid: number;
    username: string;
    status: string;
}

export interface EventModel {
    eid: number;
    title: string;
    description: string;
    location: string;
    eventDate: string;
    hostUid: number;
    hostUsername: string;
    yesCount: number;
    noCount: number;
    maybeCount: number;
    attendees: Attendee[];
}

export class EventRepository {
    public findAllEvents(): EventModel[] {
        const db = DB.getInstance();
        const events = db.prepare(`
            SELECT e.EID as eid, e.Title as title, e.Description as description, e.Location as location, e.EventDate as eventDate, e.UID as hostUid, u.Username as hostUsername
            FROM Event e
            JOIN User u ON e.UID = u.UID
            ORDER BY e.EventDate ASC
        `).all() as any[];

        const results: EventModel[] = [];

        for (const e of events) {
            const rsvps = db.prepare(`
                SELECT Status as status, COUNT(*) as count
                FROM EventRSVP
                WHERE EID = ?
                GROUP BY Status
            `).all(e.eid) as { status: string; count: number }[];

            let yesCount = 0;
            let noCount = 0;
            let maybeCount = 0;

            for (const r of rsvps) {
                if (r.status === "yes") yesCount = r.count;
                if (r.status === "no") noCount = r.count;
                if (r.status === "maybe") maybeCount = r.count;
            }

            const attendees = db.prepare(`
                SELECT u.UID as uid, u.Username as username, r.Status as status
                FROM EventRSVP r
                JOIN User u ON r.UID = u.UID
                WHERE r.EID = ?
            `).all(e.eid) as any[];

            results.push({
                eid: e.eid,
                title: e.title,
                description: e.description,
                location: e.location,
                eventDate: e.eventDate,
                hostUid: e.hostUid,
                hostUsername: e.hostUsername,
                yesCount,
                noCount,
                maybeCount,
                attendees
            });
        }

        return results;
    }

    public createEvent(title: string, description: string, location: string, eventDate: string, uid: number): void {
        const db = DB.getInstance();
        db.prepare(`
            INSERT INTO Event (Title, Description, Location, EventDate, UID)
            VALUES (?, ?, ?, ?, ?)
        `).run(title, description, location, eventDate, uid);
    }

    public rsvpEvent(eid: number, uid: number, status: string): void {
        const db = DB.getInstance();
        db.prepare(`
            INSERT INTO EventRSVP (EID, UID, Status)
            VALUES (?, ?, ?)
            ON CONFLICT(EID, UID) DO UPDATE SET Status = ?
        `).run(eid, uid, status, status);
    }
}
