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
                                                 AuthorID Integer,
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

        connection.exec(`
            create table if not exists Guide (
                GuideID Integer not null,
                Title Text not null,
                Description Text not null,
                Content Text not null,
                UID Integer not null,
                PublishedAt Text not null,
                Likes Integer not null default 0,
                Dislikes Integer not null default 0,
                constraint PK_Guide primary key (GuideID),
                constraint FK_Guide_User foreign key (UID)
                references User (UID)
                on delete cascade
            ) strict;
        `);

        // Seed default guides if they don't exist
        try {
            const countRow = connection.prepare("SELECT COUNT(*) as count FROM Guide").get() as { count: number } | undefined;
            if (!countRow || countRow.count === 0) {
                console.log("Seeding default guides...");
                const defaultGuides = [
                    {
                        id: 1,
                        title: 'Setting Up Your Profile',
                        description: 'Learn how to perfectly set up your profile and fill your virtual garage with your favorite cars.',
                        content: [
                            'First, navigate to your profile page by clicking your avatar in the top right corner.',
                            'Click on "Edit Profile" to add a personal bio, social links, and upload a profile picture that represents you.',
                            'To build your "Virtual Garage", click the "Add Vehicle" button. You can specify the make, model, year, and even upload photos of your actual car.',
                            'Don\'t forget to save your changes!'
                        ]
                    },
                    {
                        id: 2,
                        title: 'Finding the Right Community',
                        description: 'Discover how to find, join, and participate in the best car communities for your interests.',
                        content: [
                            'Navigate to the "Communities" tab using the main navigation bar.',
                            'You can browse through curated categories (like JDM, Muscle, or Euro) or use the search bar to find niche groups.',
                            'Once you find a community you like, click the "Join" button on the community card.',
                            'Introduce yourself in the community\'s main feed to start interacting with other enthusiasts!'
                        ]
                    },
                    {
                        id: 3,
                        title: 'Exploring Brands & Models',
                        description: 'A guide to efficiently using our brand directory to learn everything about your dream cars.',
                        content: [
                            'Click on "Brands" in the top navigation to view our comprehensive list of car manufacturers.',
                            'You can search for specific brands or sort them by popularity and region.',
                            'Clicking on a brand card will take you to its dedicated page, where you can see all their popular models, historical specs, and user reviews.',
                            'Use this section to research your next project car or dream build.'
                        ]
                    },
                    {
                        id: 4,
                        title: 'Crafting the Perfect Post',
                        description: 'Tips & tricks on how to create engaging posts in communities and start discussions.',
                        content: [
                            'Go to a community you have joined and click the "Create Post" button.',
                            'Start with a catchy, descriptive title so people know exactly what you are talking about.',
                            'In the description, provide enough context. If you are asking a mechanical question, include your car\'s exact year, make, and model.',
                            'Always try to attach high-quality photos. Car guys love pictures! A good photo can drastically increase your post\'s engagement.'
                        ]
                    },
                    {
                        id: 5,
                        title: 'Connecting with Others',
                        description: 'How to use our platform to exchange ideas and connect with other car enthusiasts.',
                        content: [
                            'The best way to connect is by being active in the comment sections of posts you find interesting.',
                            'Share your automotive knowledge, offer help to those asking questions, and be respectful to everyone.',
                            'If you find a user with a similar build or interests, click on their profile and check out their garage.',
                            'Building a network makes the CarGuy experience much more enjoyable.'
                        ]
                    },
                    {
                        id: 6,
                        title: 'Advanced Search Tips',
                        description: 'Master the search function to quickly and precisely find exactly the content, models, or members you are looking for.',
                        content: [
                            'Use the global search bar in the top navigation to look for specific topics.',
                            'You can filter your results to only show "Communities", "Brands", or specific "Posts".',
                            'For exact matches, wrap your search query in quotes. For example: "Porsche 911 GT3".',
                            'Use keywords like "help" or "build" alongside your car model to find relevant project threads.'
                        ]
                    }
                ];

                const insertStmt = connection.prepare(`
                    INSERT INTO Guide (GuideID, Title, Description, Content, UID, PublishedAt, Likes, Dislikes)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                `);

                // Find a default author, preferably admin or user with ID 4 or 1
                let authorUid = 1;
                try {
                    const userRow = connection.prepare("SELECT UID FROM User WHERE UID = 4 OR Role = 'admin' LIMIT 1").get() as { UID: number } | undefined;
                    if (userRow) {
                        authorUid = userRow.UID;
                    } else {
                        const anyUserRow = connection.prepare("SELECT UID FROM User LIMIT 1").get() as { UID: number } | undefined;
                        if (anyUserRow) authorUid = anyUserRow.UID;
                    }
                } catch (userErr) {
                    console.error("Could not determine user for guide seeding, defaulting to 1:", userErr);
                }

                for (const g of defaultGuides) {
                    insertStmt.run(
                        g.id,
                        g.title,
                        g.description,
                        JSON.stringify(g.content),
                        authorUid,
                        new Date().toISOString(),
                        0,
                        0
                    );
                }
            }
        } catch (err) {
            console.error("Error seeding default guides:", err);
        }
    }
}