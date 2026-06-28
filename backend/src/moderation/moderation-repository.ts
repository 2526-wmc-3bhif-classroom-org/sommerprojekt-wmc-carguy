import { DB } from "../database";
import { AI_PROVIDER, AI_MODEL } from "../config";

export interface ModerationLogEntry {
    mlid: number;
    type: string;
    content: string;
    status: string;
    reason: string | null;
    provider: string;
    model: string | null;
    timestamp: string;
}

export class ModerationRepository {
    public logModeration(type: string, content: string, status: string, reason: string | null): void {
        const db = DB.getInstance();
        db.prepare(`
            INSERT INTO ModerationLog (Type, Content, Status, Reason, Provider, Model, Timestamp)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(
            type,
            content,
            status,
            reason,
            AI_PROVIDER || "local",
            AI_MODEL || null,
            new Date().toISOString()
        );
    }

    public getLogs(limit: number = 100): ModerationLogEntry[] {
        const db = DB.getInstance();
        const rows = db.prepare(`
            SELECT MLID as mlid, Type as type, Content as content, Status as status, Reason as reason, Provider as provider, Model as model, Timestamp as timestamp
            FROM ModerationLog
            ORDER BY MLID DESC
            LIMIT ?
        `).all(limit) as any[];

        return rows as ModerationLogEntry[];
    }

    public clearLogs(): void {
        const db = DB.getInstance();
        db.prepare("DELETE FROM ModerationLog").run();
    }

    public getStats(): {
        total: number;
        passed: number;
        blocked: number;
        flagged: number;
        activeProvider: string;
        activeModel: string;
    } {
        const db = DB.getInstance();
        
        const total = db.prepare("SELECT COUNT(*) as count FROM ModerationLog").get() as { count: number };
        const passed = db.prepare("SELECT COUNT(*) as count FROM ModerationLog WHERE Status = 'passed'").get() as { count: number };
        const blocked = db.prepare("SELECT COUNT(*) as count FROM ModerationLog WHERE Status = 'blocked'").get() as { count: number };
        const flagged = db.prepare("SELECT COUNT(*) as count FROM ModerationLog WHERE Status = 'flagged'").get() as { count: number };

        return {
            total: total?.count || 0,
            passed: passed?.count || 0,
            blocked: blocked?.count || 0,
            flagged: flagged?.count || 0,
            activeProvider: AI_PROVIDER || "local",
            activeModel: AI_MODEL || "n/a"
        };
    }
}
