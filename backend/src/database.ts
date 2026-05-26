import DatabaseConstructor, { Database } from "better-sqlite3";
import * as path from "node:path";
import * as fs from "node:fs";

const dataDir = path.resolve(__dirname, "../data");
const dbFileName = path.join(dataDir, "carguy.db");

// Hold the single shared connection in memory
let sharedDbInstance: Database | null = null;

export class Unit {

    private readonly db: Database;
    private completed: boolean;

    public constructor(public readonly readOnly: boolean) {
        this.completed = false;
        // Use the shared instance instead of creating a new file connection
        this.db = DB.getInstance();
        if (!this.readOnly) {
            DB.beginTransaction(this.db);
        }
    }

    public prepare<TResult, TParams extends Record<string, unknown> = Record<string, unknown>>(
        sql: string,
        bindings?: TParams
    ) {
        const stmt = this.db.prepare(sql);
        if (bindings != null) {
            stmt.bind(bindings as unknown);
        }
        return stmt;
    }

    public getLastRowId(): number {
        const stmt = this.db.prepare(`SELECT last_insert_rowid() as id`);
        const result = stmt.get() as { id: number };
        return result.id;
    }

    public complete(commit: boolean | null = null): void {
        if (this.completed) return;

        this.completed = true;

        if (commit !== null) {
            commit ? DB.commitTransaction(this.db) : DB.rollbackTransaction(this.db);
        } else if (!this.readOnly) {
            throw new Error("transaction requires commit or rollback");
        }

        // CRITICAL: Do NOT call this.db.close() here anymore!
        // We are sharing one database connection across the app.
        // Closing it will break all subsequent requests.
    }
}

export class DB {

    public static getInstance(): Database {
        if (!sharedDbInstance) {
            sharedDbInstance = DB.createDBConnection();
        }
        return sharedDbInstance;
    }

    private static createDBConnection(): Database {
        if (!fs.existsSync(dataDir)) {
            console.log(`Creating directory: ${dataDir}`);
            fs.mkdirSync(dataDir, { recursive: true });
        }

        const db = new DatabaseConstructor(dbFileName, {
            fileMustExist: false,
            verbose: (s: unknown) => DB.logStatement(s)
        });

        db.pragma("foreign_keys = ON");
        DB.ensureTablesCreated(db);

        return db;
    }

    public static beginTransaction(connection: Database): void {
        connection.exec("begin transaction;");
    }

    public static commitTransaction(connection: Database): void {
        connection.exec("commit;");
    }

    public static rollbackTransaction(connection: Database): void {
        connection.exec("rollback;");
    }

    private static logStatement(statement: string | unknown): void {
        if (typeof statement !== "string") return;

        const start = statement.slice(0, 6).trim().toLowerCase();
        if (start.startsWith("pragma") || start.startsWith("create")) return;

        console.log(`SQL: ${statement}`);
    }

    private static ensureTablesCreated(connection: Database): void {

        connection.exec(`
            create table if not exists User (
                                                UID Integer not null,
                                                Username Text not null,
                                                Password Text not null,
                                                PublicName Text,
                                                Description Text,
                                                Role Text not null,
                                                Title Text,
                                                Image Text,
                                                CreatedAt Text not null,
                                                constraint PK_User primary key (UID)
                ) strict;
        `);

        connection.exec(`
            create table if not exists Forum_Category (
                                                          Forum_Category_id Integer not null,
                                                          Forum_Category_Name Text not null,
                                                          constraint PK_Forum_Category primary key (Forum_Category_id)
                ) strict;
        `);

        connection.exec(`
            create table if not exists Post_Category (
                                                         Post_Category_id Integer not null,
                                                         Post_Category_Name Text not null,
                                                         constraint PK_Post_Category primary key (Post_Category_id)
                ) strict;
        `);

        connection.exec(`
            create table if not exists Forum (
                                                 ForumID Integer not null,
                                                 Name Text not null,
                                                 Description Text,
                                                 ParentForumID Integer,
                                                 Forum_Category_id Integer,
                                                 CreatedAt Text not null,
                                                 constraint PK_Forum primary key (ForumID),
                constraint FK_ForumParent foreign key (ParentForumID)
                references Forum (ForumID)
                on delete cascade,
                constraint FK_Forum_Category foreign key (Forum_Category_id)
                references Forum_Category (Forum_Category_id)
                ) strict;
        `);

        connection.exec(`
            create table if not exists User_In_Forum (
                                                         UID Integer not null,
                                                         ForumID Integer not null,
                                                         constraint PK_User_In_Forum primary key (UID, ForumID),
                constraint FK_User_In_Forum_User foreign key (UID)
                references User (UID)
                on delete cascade,
                constraint FK_User_In_Forum_Forum foreign key (ForumID)
                references Forum (ForumID)
                on delete cascade
                ) strict;
        `);

        connection.exec(`
            create table if not exists Post (
                                                PID Integer not null,
                                                Title Text,
                                                Content Text not null,
                                                UID Integer not null,
                                                ForumID Integer not null,
                                                ParentPID Integer,
                                                Post_Category_id Integer,
                                                PublishedAt Text not null,
                                                ImageUrls Text,
                                                Likes Integer not null default 0,
                                                Dislikes Integer not null default 0,
                                                constraint PK_Post primary key (PID),
                constraint FK_Post_User foreign key (UID)
                references User (UID)
                on delete cascade,
                constraint FK_Post_Forum foreign key (ForumID)
                references Forum (ForumID)
                on delete cascade,
                constraint FK_Post_Parent foreign key (ParentPID)
                references Post (PID)
                on delete cascade,
                constraint FK_Post_Category foreign key (Post_Category_id)
                references Post_Category (Post_Category_id)
                ) strict;
        `);

        connection.exec(`
            create table if not exists Comment (
                CID Integer not null,
                Content Text not null,
                UID Integer not null,
                PID Integer not null,
                ParentCID Integer,
                PublishedAt Text not null,
                ImageUrls Text,
                Likes Integer not null default 0,
                Dislikes Integer not null default 0,
                constraint PK_Comment primary key (CID),
                constraint FK_Comment_User foreign key (UID)
                references User (UID)
                on delete cascade,
                constraint FK_Comment_Post foreign key (PID)
                references Post (PID)
                on delete cascade,
                constraint FK_Comment_Parent foreign key (ParentCID)
                references Comment (CID)
                on delete cascade
            ) strict;
        `);
    }
}