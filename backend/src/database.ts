import DatabaseConstructor, { Database } from "better-sqlite3";
import * as path from "node:path";
import * as fs from "node:fs";

const dataDir = path.resolve(__dirname, "../data");
const dbFileName = path.join(dataDir, "carguy.db");

// Hold the single shared connection in memory
let sharedDbInstance: Database | null = null;

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
            verbose: process.env.SQL_LOG === 'true' ? (s: unknown) => DB.logStatement(s) : undefined
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
        try {
            connection.exec("ALTER TABLE Post ADD COLUMN PollData Text;");
            console.log("Migration: Added PollData column to Post table.");
        } catch (_) {
            // Already migrated or table not created yet
        }

        try {
            connection.exec("ALTER TABLE ModerationLog ADD COLUMN ReferenceID Integer;");
            console.log("Migration: Added ReferenceID column to ModerationLog table.");
        } catch (_) {
            // Already migrated or table not created yet
        }

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
                references Forum_Category (Forum_Category_id),
                constraint FK_Forum_Author foreign key (AuthorID)
                references User (UID)
                on delete set null
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
                                                PollData Text,
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
                GuideID Integer primary key autoincrement,
                Title Text not null,
                Description Text not null,
                Content Text not null,
                UID Integer not null,
                PublishedAt Text not null,
                Likes Integer not null default 0,
                Dislikes Integer not null default 0,
                constraint FK_Guide_User foreign key (UID)
                references User (UID)
                on delete cascade
            ) strict;
        `);

        connection.exec(`
            create table if not exists Bookmark (
                UID Integer not null,
                PID Integer not null,
                constraint PK_Bookmark primary key (UID, PID),
                constraint FK_Bookmark_User foreign key (UID)
                references User (UID)
                on delete cascade,
                constraint FK_Bookmark_Post foreign key (PID)
                references Post (PID)
                on delete cascade
            ) strict;
        `);

        connection.exec(`
            create table if not exists Shout (
                SID Integer primary key autoincrement,
                Content Text not null,
                UID Integer not null,
                PublishedAt Text not null,
                constraint FK_Shout_User foreign key (UID)
                references User (UID)
                on delete cascade
            ) strict;
        `);

        connection.exec(`
            create table if not exists GarageVehicle (
                GVID Integer primary key autoincrement,
                UID Integer not null,
                Make Text not null,
                Model Text not null,
                Year Integer not null,
                Mods Text,
                ImageUrl Text,
                constraint FK_GarageVehicle_User foreign key (UID)
                references User (UID)
                on delete cascade
            ) strict;
        `);

        connection.exec(`
            create table if not exists PollVote (
                PID Integer not null,
                UID Integer not null,
                OptionIndex Integer not null,
                constraint PK_PollVote primary key (PID, UID),
                constraint FK_PollVote_Post foreign key (PID)
                references Post (PID)
                on delete cascade,
                constraint FK_PollVote_User foreign key (UID)
                references User (UID)
                on delete cascade
            ) strict;
        `);

        connection.exec(`
            create table if not exists ModerationLog (
                MLID Integer primary key autoincrement,
                Type Text not null,
                Content Text not null,
                Status Text not null,
                Reason Text,
                Provider Text not null,
                Model Text,
                Timestamp Text not null
            ) strict;
        `);

        connection.exec(`
            create table if not exists Event (
                EID Integer primary key autoincrement,
                Title Text not null,
                Description Text not null,
                Location Text not null,
                EventDate Text not null,
                UID Integer not null,
                constraint FK_Event_User foreign key (UID)
                references User (UID)
                on delete cascade
            ) strict;
        `);

        connection.exec(`
            create table if not exists EventRSVP (
                EID Integer not null,
                UID Integer not null,
                Status Text not null,
                constraint PK_EventRSVP primary key (EID, UID),
                constraint FK_EventRSVP_Event foreign key (EID)
                references Event (EID)
                on delete cascade,
                constraint FK_EventRSVP_User foreign key (UID)
                references User (UID)
                on delete cascade
            ) strict;
        `);

        connection.exec(`
            create table if not exists EventComment (
                ECID Integer primary key autoincrement,
                EID Integer not null,
                UID Integer not null,
                Content Text not null,
                PublishedAt Text not null,
                constraint FK_EventComment_Event foreign key (EID)
                references Event (EID) on delete cascade,
                constraint FK_EventComment_User foreign key (UID)
                references User (UID) on delete cascade
            ) strict;
        `);

        // Seed default users (must be first — everything else needs FK to User)
        try {
            const userCount = connection.prepare("SELECT COUNT(*) as count FROM User").get() as { count: number } | undefined;
            if (!userCount || userCount.count === 0) {
                console.log("Seeding default users...");
                const bcrypt = require('bcrypt');
                const insertUser = connection.prepare(`
                    INSERT INTO User (UID, Username, Password, PublicName, Description, Role, CreatedAt)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                `);
                insertUser.run(1, "admin", bcrypt.hashSync("admin123", 10), "Admin", "Site administrator & car enthusiast.", "admin", new Date().toISOString());
                insertUser.run(2, "driftkingFD", bcrypt.hashSync("pass1234", 10), "Drift King FD", "RX-7 addict, rotary or nothing.", "user", new Date().toISOString());
                insertUser.run(3, "gt3_pilot", bcrypt.hashSync("pass1234", 10), "GT3 Pilot", "Track days every weekend. 991.2 GT3 RS.", "user", new Date().toISOString());
                insertUser.run(4, "muscle_legends", bcrypt.hashSync("pass1234", 10), "Muscle Legends", "Classic Mustangs and old-school V8s.", "user", new Date().toISOString());

                // Seed Forum Categories
                const insertCat = connection.prepare(`INSERT INTO Forum_Category (Forum_Category_id, Forum_Category_Name) VALUES (?, ?)`);
                insertCat.run(1, "JDM");
                insertCat.run(2, "European");
                insertCat.run(3, "American Muscle");
                insertCat.run(4, "General");

                // Seed Post Categories
                const insertPostCat = connection.prepare(`INSERT INTO Post_Category (Post_Category_id, Post_Category_Name) VALUES (?, ?)`);
                insertPostCat.run(1, "Discussion");
                insertPostCat.run(2, "Showcase");
                insertPostCat.run(3, "Question");
                insertPostCat.run(4, "For Sale");

                // Seed Forums (Communities)
                const insertForum = connection.prepare(`
                    INSERT INTO Forum (ForumID, Name, Description, Forum_Category_id, AuthorID, CreatedAt)
                    VALUES (?, ?, ?, ?, ?, ?)
                `);
                insertForum.run(1, "JDM Legends", "Everything JDM — Skylines, RX-7s, Supras, and more.", 1, 2, new Date().toISOString());
                insertForum.run(2, "Nürburgring Fanatics", "Lap times, track days, and Green Hell stories.", 2, 3, new Date().toISOString());
                insertForum.run(3, "Classic Muscle", "Mustangs, Camaros, Chargers — the golden era of American horsepower.", 3, 4, new Date().toISOString());
                insertForum.run(4, "General Car Chat", "Off-topic car talk, memes, and general discussion.", 4, 1, new Date().toISOString());

                // Join users to forums
                const joinForum = connection.prepare(`INSERT INTO User_In_Forum (UID, ForumID) VALUES (?, ?)`);
                joinForum.run(1, 1); joinForum.run(1, 4);
                joinForum.run(2, 1); joinForum.run(2, 4);
                joinForum.run(3, 2); joinForum.run(3, 4);
                joinForum.run(4, 3); joinForum.run(4, 4);

                // Seed starter posts
                const insertPost = connection.prepare(`
                    INSERT INTO Post (Title, Content, UID, ForumID, PublishedAt, Likes, Dislikes)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                `);
                insertPost.run("RX-7 FD vs Supra MK4 — the eternal debate", "Both icons, both rotary vs inline-6 turbo. Which one do you choose and why?", 2, 1, new Date(Date.now() - 86400000 * 3).toISOString(), 42, 3);
                insertPost.run("My Nordschleife lap — 7:58 in a stock 992 GT3", "Finally broke 8 minutes on the tourist drive. Here's my data log and notes.", 3, 2, new Date(Date.now() - 86400000).toISOString(), 87, 1);
                insertPost.run("1969 Mustang Resto-Mod build thread", "Picked up a shell for $4k, going full frame-off with modern mechanicals underneath.", 4, 3, new Date(Date.now() - 86400000 * 7).toISOString(), 120, 2);
            }
        } catch (err) {
            console.error("Error seeding default users:", err);
        }

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
                    },
                    {
                        id: 7,
                        title: 'E46 M3 S54 Valve Clearance Adjustment',
                        description: 'A critical maintenance item for the S54 engine every 30,000 miles. Do not ignore this, or you risk rocker arm failure.',
                        content: [
                            'Remove the ignition coils, spark plugs, and the valve cover.',
                            'Rotate the engine manually to TDC for each cylinder.',
                            'Measure the gap between the cam lobe and the rocker arm using feeler gauges.',
                            'If the gap is out of spec, use a magnetic tool to remove the old shim and insert a new one of the correct thickness.',
                            'Reassemble everything, ensuring the valve cover gasket is seated properly with RTV at the half-moons.'
                        ]
                    },
                    {
                        id: 8,
                        title: 'LS3 Engine Swap - Wiring Harness Basics',
                        description: 'Swapping an LS3 into your project car? Here is a breakdown of the essential sensors and how to thin out a factory harness.',
                        content: [
                            'Identify the core sensors: MAP (Manifold Absolute Pressure), MAF (Mass Airflow), Crank Position, and Cam Position.',
                            'Remove unnecessary circuits like the rear O2 sensors (if running without cats), EVAP, and automatic transmission wiring if using a manual.',
                            'Route your grounds properly to the back of the cylinder heads to avoid ECU issues.',
                            'Connect the standalone fuse box to a switched 12V ignition source, constant 12V battery power, and a solid chassis ground.'
                        ]
                    },
                    {
                        id: 9,
                        title: 'Porsche 997 Carrera IMS Bearing Guide',
                        description: 'Is the IMS bearing failure real on the 997.1? Yes. Here is a definitive guide on how to identify which engine you have and retrofit it.',
                        content: [
                            'First, check your engine serial number. Early 997.1 models (2005) often have the smaller, replaceable bearing.',
                            'Listen for a metallic rattle at idle, especially near the bottom rear of the engine block.',
                            'To replace it, the transmission and clutch/flywheel assembly must be removed.',
                            'Lock the camshafts in place before removing the IMS flange to prevent engine timing failure.',
                            'Extract the old bearing and install a new ceramic dual-row bearing (like the LN Engineering retrofit) for peace of mind.'
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

        // Seed additional car-specific guides if they don't exist yet
        try {
            const carGuides = [
                {
                    id: 7,
                    title: 'How to Prepare for Your First Track Day',
                    description: 'A step-by-step checklist to get your car and yourself ready for a safe and fun track day experience.',
                    content: [
                        'Book a Novice or Open Lapping session with a reputable organizer — most include a classroom briefing for first-timers.',
                        'Inspect your brakes thoroughly: fresh pads (at least 70% remaining), bled fluid (ATE Type 200 or Motul RBF600 recommended), and no warped rotors.',
                        'Set your tire pressures slightly higher than street settings — 36–38 psi hot is a good starting point, but ask experienced drivers at the event.',
                        'Remove all loose items from the interior: floor mats, sunglasses, water bottles — anything that can become a projectile under hard braking.',
                        'Bring a Snell SA2020-rated helmet, sunscreen, plenty of water, and comfortable driving shoes. Your first session goal is learning the track layout, not lap times.'
                    ]
                },
                {
                    id: 8,
                    title: 'Wheel & Tire Fitment Guide',
                    description: 'Understand offset, width, and tire sizing so you can achieve perfect fitment without rubbing or handling issues.',
                    content: [
                        'Tire size is written as Width/Aspect Ratio/Rim Diameter — for example, 255/35/R19 means 255mm wide, 35% sidewall height, on a 19-inch rim.',
                        'Wheel offset (ET) measures how far the mounting face sits from the wheel center. A higher ET pushes the wheel inward (tucked); a lower ET pushes it outward (poked).',
                        'Use an online fitment calculator to compare specs before buying — it simulates exactly how new wheels will sit versus stock.',
                        'After installing, check for rubbing at full steering lock and over bumps. Common contact points are the inner fender liner, strut housing, and brake caliper.',
                        'Staggered setups (wider rear) suit RWD performance cars but prevent tire rotation — factor in higher rear tire wear costs before committing.'
                    ]
                },
                {
                    id: 9,
                    title: 'Essential Car Detailing Guide',
                    description: 'Learn the fundamentals of proper car care to keep your paint looking showroom-fresh for years.',
                    content: [
                        'Always wash with the two-bucket method: one bucket of soapy water, one of clean rinse water — never drag a dirty mitt across your paint.',
                        'After washing, run your hand across a panel. If it feels rough or gritty, use a clay bar to decontaminate the surface before any polishing.',
                        'Use a dual-action (DA) polisher to remove light swirl marks. Start with the least aggressive pad and compound, then step up only if needed.',
                        'Protect your finish with a ceramic coating (Gyeon, CarPro, Gtechniq) or paint sealant — this makes future washes much easier and water beads off beautifully.',
                        'Always clean your wheels last. Brake dust is caustic and can transfer to your paintwork if you use the same tools on wheels first.'
                    ]
                },
                {
                    id: 10,
                    title: 'How to Read a Dyno Chart',
                    description: 'Understand what power and torque curves tell you about your engine\'s character and tuning potential.',
                    content: [
                        'A dyno chart plots Horsepower (HP) and Torque (Nm or lb-ft) against RPM. Wheel horsepower (WHP) is always lower than crank HP due to drivetrain losses — typically 15–20%.',
                        'A flat, wide torque curve means strong low-RPM pull — great for street driving. A peaky curve climbing sharply near redline is typical of high-revving naturally aspirated engines.',
                        'Look for a smooth, progressive curve without dips or hesitations — these can indicate lean spots, cam timing problems, or boost pressure fluctuations.',
                        'The area under the power curve — the powerband — matters more than peak numbers. Two 400hp engines can feel completely different depending on how broad that power is.',
                        'After a tune, overlay before and after curves to see exactly which RPM range gained the most. This tells you whether the tune was truly optimized for your driving style.'
                    ]
                },
                {
                    id: 11,
                    title: 'Buying a Used Performance Car: What to Check',
                    description: 'A practical pre-purchase checklist so you don\'t accidentally buy someone else\'s expensive problem.',
                    content: [
                        'Always request a full service history. Look for evidence of regular oil changes, timing belt or chain replacements, and brake fluid flushes at the correct intervals.',
                        'Book a pre-purchase inspection (PPI) with a brand specialist — a BMW specialist will catch M-car-specific issues that a general mechanic will miss entirely.',
                        'Look for signs of heavy track use: excessive brake dust on inner rims, a worn undertray, heat discoloration on calipers, and signs of freshly replaced brake lines.',
                        'Cross-check every VIN plate: dashboard, door jamb, engine bay, and floor pan. Mismatched numbers strongly suggest a repaired write-off.',
                        'Research model-specific failure points on dedicated forums before viewing the car. For example, the E92 M3 is known for throttle actuator failures and rod bearing wear at high mileage.'
                    ]
                }
            ];

            const insertCarGuideStmt = connection.prepare(`
                INSERT INTO Guide (GuideID, Title, Description, Content, UID, PublishedAt, Likes, Dislikes)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `);

            let carGuideAuthorUid: number | null = null;
            try {
                const userRow = connection.prepare("SELECT UID FROM User WHERE UID = 4 OR Role = 'admin' LIMIT 1").get() as { UID: number } | undefined;
                if (userRow) {
                    carGuideAuthorUid = userRow.UID;
                } else {
                    const anyUser = connection.prepare("SELECT UID FROM User LIMIT 1").get() as { UID: number } | undefined;
                    if (anyUser) carGuideAuthorUid = anyUser.UID;
                }
            } catch (_) {}

            if (carGuideAuthorUid !== null) {
            for (const g of carGuides) {
                const existing = connection.prepare("SELECT GuideID FROM Guide WHERE GuideID = ?").get(g.id);
                if (!existing) {
                    insertCarGuideStmt.run(
                        g.id,
                        g.title,
                        g.description,
                        JSON.stringify(g.content),
                        carGuideAuthorUid,
                        new Date().toISOString(),
                        0,
                        0
                    );
                }
            }
            }
        } catch (err) {
            console.error("Error seeding car-specific guides:", err);
        }

        // Seed default shouts if they don't exist
        try {
            const countRow = connection.prepare("SELECT COUNT(*) as count FROM Shout").get() as { count: number } | undefined;
            if (!countRow || countRow.count === 0) {
                console.log("Seeding default shouts...");
                const uids = connection.prepare("SELECT UID FROM User LIMIT 5").all() as { UID: number }[];
                if (uids.length > 0) {
                    const defaultShouts = [
                        { content: "Welcome to the CarGuy Shoutbox! 🏎️💨", uid: uids[0].UID, offsetMinutes: 60 },
                        { content: "Hey guys, anyone going to the meet tonight?", uid: uids[1]?.UID || uids[0].UID, offsetMinutes: 45 },
                        { content: "Heard there is a clean E30 JDM style project in progress!", uid: uids[2]?.UID || uids[0].UID, offsetMinutes: 30 },
                        { content: "Yes! Can't wait to see the photos.", uid: uids[3]?.UID || uids[0].UID, offsetMinutes: 15 },
                        { content: "Post them in the JDM community!", uid: uids[0].UID, offsetMinutes: 5 }
                    ];

                    const insertShoutStmt = connection.prepare(`
                        INSERT INTO Shout (Content, UID, PublishedAt)
                        VALUES (?, ?, ?)
                    `);

                    for (const s of defaultShouts) {
                        const date = new Date(Date.now() - s.offsetMinutes * 60000);
                        insertShoutStmt.run(s.content, s.uid, date.toISOString());
                    }
                }
            }
        } catch (err) {
            console.error("Error seeding default shouts:", err);
        }

        // Seed default garage vehicles if they don't exist
        try {
            const countRow = connection.prepare("SELECT COUNT(*) as count FROM GarageVehicle").get() as { count: number } | undefined;
            if (!countRow || countRow.count === 0) {
                console.log("Seeding default garage vehicles...");
                const users = connection.prepare("SELECT UID, Username FROM User LIMIT 5").all() as { UID: number, Username: string }[];
                if (users.length > 0) {
                    const defaultVehicles = [
                        { uid: users[0].UID, make: "Toyota", model: "Supra", year: 1998, mods: "Single Turbo, HKS Exhaust, Tein Coilovers" },
                        { uid: users[1]?.UID || users[0].UID, make: "Nissan", model: "Skyline GT-R R34", year: 2002, mods: "Nismo Intake, Apexi Exhaust, ECU Remap" },
                        { uid: users[2]?.UID || users[0].UID, make: "Mazda", model: "RX-7 FD", year: 1993, mods: "Rotary Engine Ported, HKS Coilovers" }
                    ];

                    const insertVehicleStmt = connection.prepare(`
                        INSERT INTO GarageVehicle (UID, Make, Model, Year, Mods, ImageUrl)
                        VALUES (?, ?, ?, ?, ?, ?)
                    `);

                    for (const v of defaultVehicles) {
                        insertVehicleStmt.run(v.uid, v.make, v.model, v.year, v.mods, null);
                    }
                }
            }
        } catch (err) {
            console.error("Error seeding default garage vehicles:", err);
        }

        // Seed default poll on an existing post if no polls exist
        try {
            const hasPoll = connection.prepare("SELECT COUNT(*) as count FROM Post WHERE PollData IS NOT NULL").get() as { count: number } | undefined;
            if (!hasPoll || hasPoll.count === 0) {
                console.log("Seeding default poll on a post...");
                const firstPost = connection.prepare("SELECT PID, Title FROM Post WHERE ParentPID IS NULL LIMIT 1").get() as { PID: number, Title: string } | undefined;
                if (firstPost) {
                    const poll = {
                        question: "What should be our next community track day location?",
                        options: [
                            { text: "Nürburgring Nordschleife" },
                            { text: "Spa-Francorchamps" },
                            { text: "Laguna Seca" },
                            { text: "Silverstone" }
                        ]
                    };
                    connection.prepare("UPDATE Post SET PollData = ? WHERE PID = ?").run(JSON.stringify(poll), firstPost.PID);
                }
            }
        } catch (err) {
            console.error("Error seeding default poll:", err);
        }

        // Seed default events if they don't exist
        try {
            const countRow = connection.prepare("SELECT COUNT(*) as count FROM Event").get() as { count: number } | undefined;
            if (!countRow || countRow.count === 0) {
                console.log("Seeding default events...");
                const users = connection.prepare("SELECT UID FROM User LIMIT 3").all() as { UID: number }[];
                if (users.length > 0) {
                    const insertEventStmt = connection.prepare(`
                        INSERT INTO Event (Title, Description, Location, EventDate, UID)
                        VALUES (?, ?, ?, ?, ?)
                    `);

                    const insertRSVPStmt = connection.prepare(`
                        INSERT INTO EventRSVP (EID, UID, Status)
                        VALUES (?, ?, ?)
                    `);

                    const date1 = new Date();
                    date1.setDate(date1.getDate() + 2);
                    date1.setHours(20, 0, 0, 0);
                    const e1 = insertEventStmt.run(
                        "Tokyo JDM Meet & Cruise",
                        "Weekly JDM car meet at Shibuya parking, followed by a scenic highway cruise. Bring your cleanest builds!",
                        "Shibuya Crossing U-Turn & PA",
                        date1.toISOString(),
                        users[0].UID
                    );

                    const date2 = new Date();
                    date2.setDate(date2.getDate() + 5);
                    date2.setHours(9, 0, 0, 0);
                    const e2 = insertEventStmt.run(
                        "Nordschleife Public Track Day",
                        "Open lap day for community members to test their builds on the legendary Green Hell.",
                        "Nürburgring Nordschleife Entry",
                        date2.toISOString(),
                        users[1]?.UID || users[0].UID
                    );

                    const date3 = new Date();
                    date3.setDate(date3.getDate() + 1);
                    date3.setHours(10, 0, 0, 0);
                    const e3 = insertEventStmt.run(
                        "Mustang & Muscle Coffee Morning",
                        "Casual morning gathering for classic muscle cars, hot rods, and coffee lovers.",
                        "Ace Cafe London",
                        date3.toISOString(),
                        users[2]?.UID || users[0].UID
                    );

                    const date4 = new Date();
                    date4.setDate(date4.getDate() + 12);
                    date4.setHours(8, 30, 0, 0);
                    const e4 = insertEventStmt.run(
                        "Spa-Francorchamps Endurance Run",
                        "Community endurance challenge at one of F1's most iconic circuits. All skill levels welcome.",
                        "Spa-Francorchamps, Belgium",
                        date4.toISOString(),
                        users[0].UID
                    );

                    const date5 = new Date();
                    date5.setDate(date5.getDate() + 20);
                    date5.setHours(11, 0, 0, 0);
                    const e5 = insertEventStmt.run(
                        "Silverstone Hot Lap Day",
                        "Book your hot lap session at the home of British motorsport. Cars scrutineered from 9:00.",
                        "Silverstone Circuit, UK",
                        date5.toISOString(),
                        users[1]?.UID || users[0].UID
                    );

                    if (e1.lastInsertRowid) {
                        insertRSVPStmt.run(Number(e1.lastInsertRowid), users[0].UID, "yes");
                        if (users[1]) insertRSVPStmt.run(Number(e1.lastInsertRowid), users[1].UID, "maybe");
                        if (users[2]) insertRSVPStmt.run(Number(e1.lastInsertRowid), users[2].UID, "yes");
                    }
                    if (e2.lastInsertRowid) {
                        insertRSVPStmt.run(Number(e2.lastInsertRowid), users[0].UID, "yes");
                        if (users[1]) insertRSVPStmt.run(Number(e2.lastInsertRowid), users[1].UID, "yes");
                        if (users[2]) insertRSVPStmt.run(Number(e2.lastInsertRowid), users[2].UID, "maybe");
                    }
                    if (e3.lastInsertRowid) {
                        insertRSVPStmt.run(Number(e3.lastInsertRowid), users[0].UID, "maybe");
                        if (users[1]) insertRSVPStmt.run(Number(e3.lastInsertRowid), users[1].UID, "yes");
                    }
                    if (e4.lastInsertRowid) {
                        insertRSVPStmt.run(Number(e4.lastInsertRowid), users[0].UID, "yes");
                        if (users[2]) insertRSVPStmt.run(Number(e4.lastInsertRowid), users[2].UID, "yes");
                    }
                    if (e5.lastInsertRowid) {
                        if (users[1]) insertRSVPStmt.run(Number(e5.lastInsertRowid), users[1].UID, "yes");
                    }
                }
            }
        } catch (err) {
            console.error("Error seeding default events:", err);
        }

        // Seed event comments
        try {
            const commentCount = connection.prepare("SELECT COUNT(*) as count FROM EventComment").get() as { count: number } | undefined;
            if (!commentCount || commentCount.count === 0) {
                const events = connection.prepare("SELECT EID FROM Event").all() as { EID: number }[];
                const users = connection.prepare("SELECT UID FROM User").all() as { UID: number }[];
                if (events.length > 0 && users.length > 0) {
                    const insertComment = connection.prepare(`INSERT INTO EventComment (EID, UID, Content, PublishedAt) VALUES (?, ?, ?, ?)`);
                    insertComment.run(events[0].EID, users[0].UID, "Can't wait for this! Anyone bringing their STI?", new Date(Date.now() - 3600000).toISOString());
                    if (users[1]) insertComment.run(events[0].EID, users[1].UID, "Definitely going, saved the date already 🙌", new Date(Date.now() - 1800000).toISOString());
                    if (events[1]) {
                        insertComment.run(events[1].EID, users[0].UID, "Green Hell awaits! Who else is doing the tourist drive?", new Date(Date.now() - 7200000).toISOString());
                        if (users[2]) insertComment.run(events[1].EID, users[2].UID, "Bringing my GT3, see you there!", new Date(Date.now() - 900000).toISOString());
                    }
                }
            }
        } catch (err) {
            console.error("Error seeding event comments:", err);
        }
        // Seed default garage vehicles
        try {
            const garageCount = connection.prepare("SELECT COUNT(*) as count FROM GarageVehicle").get() as { count: number } | undefined;
            if (!garageCount || garageCount.count === 0) {
                console.log("Seeding default garage vehicles...");
                const users = connection.prepare("SELECT UID FROM User LIMIT 3").all() as { UID: number }[];
                if (users.length > 0) {
                    const insertVehicle = connection.prepare(`
                        INSERT INTO GarageVehicle (UID, Make, Model, Year, Mods, ImageUrl) VALUES (?, ?, ?, ?, ?, ?)
                    `);
                    insertVehicle.run(users[0].UID, "Subaru", "WRX STI", 2018,
                        JSON.stringify(["Full exhaust (Tomei Expreme Ti)", "Cobb Stage 2 tune", "STI pink slip JDM lip"]),
                        "https://images.unsplash.com/photo-1593440700341-6b9b6ccb3e28?auto=format&fit=crop&w=800&q=80");
                    insertVehicle.run(users[0].UID, "Mazda", "RX-7 FD", 1997,
                        JSON.stringify(["Street-ported 13B-REW", "HKS turbo kit", "RE Amemiya widebody"]),
                        "https://images.unsplash.com/photo-1604671801908-6f0c6a092c05?auto=format&fit=crop&w=800&q=80");
                    if (users[1]) {
                        insertVehicle.run(users[1].UID, "Porsche", "GT3 RS", 2023,
                            JSON.stringify(["Track only build", "Full roll cage", "Michelin Cup 2R"]),
                            "https://images.unsplash.com/photo-1614200185563-3a29e4dd7f9f?auto=format&fit=crop&w=800&q=80");
                    }
                    if (users[2]) {
                        insertVehicle.run(users[2].UID, "Ford", "Mustang GT500", 1969,
                            JSON.stringify(["Resto-mod 427 V8", "Tremec T56 6-speed", "Shelby wide-body kit"]),
                            "https://images.unsplash.com/photo-1569008593903-fc4c5a9a5a24?auto=format&fit=crop&w=800&q=80");
                        insertVehicle.run(users[2].UID, "Nissan", "Skyline GT-R R34", 2002,
                            JSON.stringify(["RB26DETT twin turbo", "HKS GT1000 kit", "Nismo N1 suspension"]),
                            "https://images.unsplash.com/photo-1632823471565-1ecdf5c6da11?auto=format&fit=crop&w=800&q=80");
                    }
                }
            }
        } catch (err) {
            console.error("Error seeding default garage vehicles:", err);
        }

        // Seed default moderation logs to show off the dashboard
        try {
            const logCount = connection.prepare("SELECT COUNT(*) as count FROM ModerationLog").get() as { count: number } | undefined;
            if (!logCount || logCount.count === 0) {
                console.log("Seeding default moderation logs...");
                const insertLog = connection.prepare(`
                    INSERT INTO ModerationLog (Type, Content, Status, Reason, Provider, Model, Timestamp)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                `);

                insertLog.run("post", "check out this crazy subaru WRX bitch", "blocked", "Blocked by local safety rules: detected offensive keyword \"bitch\".", "local", "regex-filter", new Date().toISOString());
                insertLog.run("comment", "you are a complete retard, that spoiler is ugly", "blocked", "Blocked by local safety rules: detected offensive keyword \"retard\".", "local", "regex-filter", new Date().toISOString());
                insertLog.run("post", "my new clean garage space", "flagged", "Sensitive image flagged: blurred media.", "local", "regex-filter", new Date().toISOString());
                insertLog.run("comment", "nice build man", "passed", null, "local", "regex-filter", new Date().toISOString());
            }
        } catch (err) {
            console.error("Error seeding default moderation logs:", err);
        }

        // Seed a post that has a flagged blurred image to showcase it in the feed
        try {
            const hasFlaggedPost = connection.prepare("SELECT COUNT(*) as count FROM Post WHERE ImageUrls LIKE '%flagged:%'").get() as { count: number } | undefined;
            if (!hasFlaggedPost || hasFlaggedPost.count === 0) {
                console.log("Seeding flagged media post...");
                const firstForum = connection.prepare("SELECT ForumID FROM Forum LIMIT 1").get() as { ForumID: number } | undefined;
                const firstUser = connection.prepare("SELECT UID FROM User LIMIT 1").get() as { UID: number } | undefined;
                if (firstForum && firstUser) {
                    const insertPost = connection.prepare(`
                        INSERT INTO Post (Title, Content, UID, ForumID, PublishedAt, ImageUrls, Likes, Dislikes)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    `);
                    insertPost.run(
                        "Fresh Barn Find (Flagged Sensitive Content Showcase)",
                        "Found this rusty shell in a local barn, restoring it soon. This image is flagged as sensitive by AI moderation — click Reveal to view.",
                        firstUser.UID,
                        firstForum.ForumID,
                        new Date().toISOString(),
                        JSON.stringify(["flagged:https://images.unsplash.com/photo-1617531653332-bd46c24f2068?auto=format&fit=crop&w=800&q=80"]),
                        10,
                        2
                    );
                }
            }
        } catch (err) {
            console.error("Error seeding flagged post:", err);
        }

        // Seed extended events (20+ total) - only runs if extended set not yet present
        try {
            const hasExtended = connection.prepare("SELECT COUNT(*) as count FROM Event WHERE Title = 'Goodwood Festival of Speed'").get() as { count: number } | undefined;
            if (!hasExtended || hasExtended.count === 0) {
                console.log("Seeding extended events...");
                const users = connection.prepare("SELECT UID FROM User LIMIT 4").all() as { UID: number }[];
                if (users.length > 0) {
                    const u0 = users[0].UID;
                    const u1 = (users[1] ?? users[0]).UID;
                    const u2 = (users[2] ?? users[0]).UID;
                    const u3 = (users[3] ?? users[0]).UID;

                    const insertE = connection.prepare(`INSERT INTO Event (Title, Description, Location, EventDate, UID) VALUES (?, ?, ?, ?, ?)`);
                    const insertR = connection.prepare(`INSERT INTO EventRSVP (EID, UID, Status) VALUES (?, ?, ?) ON CONFLICT(EID, UID) DO UPDATE SET Status = ?`);
                    const insertC = connection.prepare(`INSERT INTO EventComment (EID, UID, Content, PublishedAt) VALUES (?, ?, ?, ?)`);

                    const future = (days: number, hour = 10) => {
                        const d = new Date();
                        d.setDate(d.getDate() + days);
                        d.setHours(hour, 0, 0, 0);
                        return d.toISOString();
                    };
                    const past = (days: number, hour = 14) => {
                        const d = new Date();
                        d.setDate(d.getDate() - days);
                        d.setHours(hour, 0, 0, 0);
                        return d.toISOString();
                    };
                    const ago = (mins: number) => new Date(Date.now() - mins * 60000).toISOString();

                    const seed: { title: string; desc: string; loc: string; date: string; uid: number; rsvps: [number, string][]; comments: [number, string][] }[] = [
                        {
                            title: "Goodwood Festival of Speed",
                            desc: "The world's greatest celebration of motorsport on the legendary Goodwood hill. Bring your cameras!",
                            loc: "Goodwood Estate, Chichester, UK",
                            date: future(30, 9),
                            uid: u1,
                            rsvps: [[u0, "yes"], [u2, "yes"], [u3, "maybe"]],
                            comments: [
                                [u0, "This is on my bucket list every year. Finally going!"],
                                [u2, "Anyone else booking the grandstand tickets? They sell out fast."],
                                [u3, "Heard a McLaren P1 GTR will be doing the hillclimb run 🔥"],
                            ]
                        },
                        {
                            title: "Monaco Historic Grand Prix",
                            desc: "Vintage racing legends return to the streets of Monaco. F1 classics, sports prototypes, and GT heroes.",
                            loc: "Circuit de Monaco, Monte Carlo",
                            date: future(45, 14),
                            uid: u2,
                            rsvps: [[u0, "maybe"], [u1, "yes"]],
                            comments: [
                                [u1, "Monaco is always spectacular. The sounds of those old engines on the streets is unreal."],
                                [u0, "Anyone know if the '67 Ferrari 312 will be racing this year?"],
                            ]
                        },
                        {
                            title: "Suzuka Circuit Open Track Day",
                            desc: "Tackle the legendary figure-of-eight Suzuka layout. All levels welcome, instructor sessions available.",
                            loc: "Suzuka International Racing Course, Japan",
                            date: future(18, 8),
                            uid: u0,
                            rsvps: [[u1, "yes"], [u2, "yes"], [u3, "yes"]],
                            comments: [
                                [u2, "Suzuka is technically demanding. Anyone doing the instructor session?"],
                                [u1, "The Spoon Curve section always gets me. Need more practice."],
                                [u3, "R34 GT-R is ready to go! See you on the 130R!"],
                            ]
                        },
                        {
                            title: "Pebble Beach Concours d'Elegance",
                            desc: "The world's most prestigious classic car show on the 18th fairway at Pebble Beach Golf Links.",
                            loc: "Pebble Beach, Monterey, California",
                            date: future(60, 10),
                            uid: u3,
                            rsvps: [[u0, "maybe"], [u2, "yes"]],
                            comments: [
                                [u0, "If there's a pre-war Bugatti winning Best of Show again I'll lose my mind (in a good way)."],
                                [u2, "The cars here make Goodwood look like a grocery run. No offense 😂"],
                            ]
                        },
                        {
                            title: "Brands Hatch Sprint Day",
                            desc: "Short-circuit sprint competition in the iconic Indy loop. Perfect for club racers and first-timers.",
                            loc: "Brands Hatch Circuit, Kent, UK",
                            date: future(10, 9),
                            uid: u1,
                            rsvps: [[u0, "yes"], [u3, "yes"]],
                            comments: [
                                [u3, "Brands Hatch Indy is short but savage. Paddock Hill Bend will sort the men from the boys."],
                                [u0, "Entered in the sub-1400cc class. Hoping my MX-5 can hold its own!"],
                            ]
                        },
                        {
                            title: "Fuji Speedway Mountain Run",
                            desc: "Free lap session at Fuji with Mt Fuji as a backdrop. One of the most scenic track days on Earth.",
                            loc: "Fuji Speedway, Oyama, Japan",
                            date: future(22, 7),
                            uid: u2,
                            rsvps: [[u0, "yes"], [u1, "maybe"], [u3, "yes"]],
                            comments: [
                                [u0, "The main straight here is so long you'll run out of gears. What a circuit."],
                                [u3, "Fuji is only an hour from Tokyo — making a full weekend of it!"],
                            ]
                        },
                        {
                            title: "Los Angeles Cars & Coffee",
                            desc: "Sunday morning cruise culture meets premium builds. From barn finds to SEMA-worthy show cars.",
                            loc: "Rose Bowl Parking Lot, Pasadena, California",
                            date: future(3, 7),
                            uid: u0,
                            rsvps: [[u1, "yes"], [u2, "yes"], [u3, "maybe"]],
                            comments: [
                                [u1, "LA's car scene is second to none. The diversity of builds here is insane."],
                                [u2, "Anyone coming from the valley? Happy to carpool."],
                                [u3, "Bringing the Supra this time. Get ready for the crowds 😅"],
                            ]
                        },
                        {
                            title: "Bathurst Night Laps",
                            desc: "Experience the legendary Mount Panorama under floodlights. A bucket-list track day for any enthusiast.",
                            loc: "Mount Panorama, Bathurst, Australia",
                            date: future(35, 19),
                            uid: u3,
                            rsvps: [[u1, "yes"], [u2, "yes"]],
                            comments: [
                                [u1, "Conrod Straight at night with a V8 soundtrack. This is going to be epic."],
                                [u2, "Hell Corner and The Cutting at night sound terrifying but I'm in."],
                            ]
                        },
                        {
                            title: "Mid-Ohio Open Lapping Day",
                            desc: "One of America's most technical circuits. Carousel, Keyhole, and the Chicane await. All cars welcome.",
                            loc: "Mid-Ohio Sports Car Course, Ohio, USA",
                            date: future(14, 8),
                            uid: u1,
                            rsvps: [[u0, "yes"], [u3, "maybe"]],
                            comments: [
                                [u0, "Mid-Ohio rewards smooth driving more than any other circuit. Perfect for learning trail braking."],
                            ]
                        },
                        {
                            title: "Atlanta Cars & Culture Expo",
                            desc: "Southeast's biggest automotive gathering. Modified builds, OEM exotics, and everything in between.",
                            loc: "Piedmont Park, Atlanta, Georgia",
                            date: future(7, 10),
                            uid: u2,
                            rsvps: [[u0, "yes"], [u1, "yes"], [u3, "yes"]],
                            comments: [
                                [u1, "Atlanta always brings out the clean builds. Excited to see who wins Best in Show."],
                                [u3, "Driving down from Charlotte — see you all there!"],
                                [u0, "The vendor booths are great too. Always find obscure JDM parts here."],
                            ]
                        },
                        {
                            title: "Cape Town Classic Car Rally",
                            desc: "Drive the scenic Cape Winelands in a convoy of pre-1990 classics. Scenic stops and optional time trials.",
                            loc: "V&A Waterfront, Cape Town, South Africa",
                            date: future(50, 9),
                            uid: u0,
                            rsvps: [[u1, "maybe"], [u2, "yes"]],
                            comments: [
                                [u2, "The backdrop of Table Mountain with vintage cars is unbeatable."],
                                [u1, "Does anyone know if modern classics (post-1980) are accepted?"],
                            ]
                        },
                        {
                            title: "Dubai Supercar Cruise Night",
                            desc: "The desert city's iconic midnight cruise. Lamborghinis, Bugattis, and everything in between hitting Sheikh Zayed Road.",
                            loc: "Dubai Mall Parking, Dubai, UAE",
                            date: future(25, 22),
                            uid: u3,
                            rsvps: [[u0, "maybe"], [u2, "yes"]],
                            comments: [
                                [u2, "Sheikh Zayed at midnight with a Huracan. Living the dream."],
                                [u0, "Is this open to non-supercar cars too or only exotics?"],
                            ]
                        },
                        {
                            title: "Rio Hillclimb Festival",
                            desc: "Brazilian hillclimb tradition meets modern performance. Open to all cars, timed runs, great atmosphere.",
                            loc: "Estrada das Canoas, Rio de Janeiro, Brazil",
                            date: future(40, 11),
                            uid: u1,
                            rsvps: [[u3, "maybe"]],
                            comments: [
                                [u3, "The Brazilian hillclimb scenes in old motorsport footage are legendary. Want to experience this."],
                            ]
                        },
                        {
                            title: "Sydney Drift Day",
                            desc: "Drift practice and demo sessions at Sydney Motorsport Park. Instructors available for beginners.",
                            loc: "Sydney Motorsport Park, Eastern Creek, Australia",
                            date: future(16, 10),
                            uid: u2,
                            rsvps: [[u0, "yes"], [u1, "yes"]],
                            comments: [
                                [u0, "Finally getting my S15 out for some proper seat time. So pumped!"],
                                [u1, "Are the passenger ride sessions included in the entry fee?"],
                                [u2, "Yes! Passenger rides in the instructor car are included. It's wild."],
                            ]
                        },
                        {
                            title: "JDM Summit: Kyoto Edition",
                            desc: "The premier JDM gathering returns to Kyoto. NSXs, GT-Rs, RX-7s, and more fill the temple parking.",
                            loc: "Fushimi Inari, Kyoto, Japan",
                            date: future(28, 9),
                            uid: u0,
                            rsvps: [[u1, "yes"], [u2, "yes"], [u3, "yes"]],
                            comments: [
                                [u1, "JDM Summit never disappoints. The community here is the best."],
                                [u2, "R34 GT-R next to a temple gate. That's art."],
                                [u3, "Flying in from the UK for this. Worth every penny."],
                                [u0, "See everyone there! Will be the biggest JDM lineup in Japan this year."],
                            ]
                        },
                        {
                            title: "Nismo Festival at Fuji",
                            desc: "Nissan's annual heritage festival featuring GT-Rs, Zs, and the full Nismo racing team history on display.",
                            loc: "Fuji Speedway, Oyama, Japan",
                            date: future(55, 9),
                            uid: u3,
                            rsvps: [[u0, "yes"], [u2, "maybe"]],
                            comments: [
                                [u0, "The Nismo GT-Rs doing demo laps is always a highlight. Can't wait."],
                                [u2, "Any word on if the R390 GT1 will make an appearance this year?"],
                            ]
                        },
                    ];

                    for (const ev of seed) {
                        try {
                            const r = insertE.run(ev.title, ev.desc, ev.loc, ev.date, ev.uid);
                            const eid = Number(r.lastInsertRowid);
                            for (const [uid, status] of ev.rsvps) {
                                insertR.run(eid, uid, status, status);
                            }
                            for (const [uid, msg] of ev.comments) {
                                insertC.run(eid, uid, msg, ago(Math.floor(Math.random() * 1440 + 30)));
                            }
                        } catch (innerErr) {
                            console.error("Error seeding extended event:", ev.title, innerErr);
                        }
                    }
                }
            }
        } catch (err) {
            console.error("Error seeding extended events:", err);
        }

        // --- Garage seed data (sentinel: admin's R34) ---
        try {
            const garageExists = connection.prepare(
                "SELECT COUNT(*) as cnt FROM GarageVehicle WHERE Make = 'Nissan' AND Model = 'Skyline GT-R R34' AND UID = 1"
            ).get() as any;

            if (!garageExists || garageExists.cnt === 0) {
                const insertV = connection.prepare(
                    "INSERT INTO GarageVehicle (UID, Make, Model, Year, Mods, ImageUrl) VALUES (?, ?, ?, ?, ?, ?)"
                );

                // admin (UID=1)
                insertV.run(1, "Nissan", "Skyline GT-R R34", 1999,
                    "Nismo N1 turbos, HKS intercooler, Tomei exhaust, Bride bucket seats, RAYS Volk TE37 17\"",
                    "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800");
                insertV.run(1, "Porsche", "911 GT3 RS", 2023,
                    "Akrapovic titanium exhaust, Clubsport package, carbon fibre bonnet, Michelin Pilot Sport Cup 2",
                    "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=800");
                insertV.run(1, "Toyota", "GR Yaris", 2021,
                    "TRD aero kit, Forge Motorsport induction kit, Whiteline sway bars, Enkei RPF1 wheels",
                    "https://images.unsplash.com/photo-1623005329973-d44e4f6e8219?w=800");

                // driftkingFD (UID=2)
                insertV.run(2, "Mazda", "RX-7 FD3S", 1997,
                    "Twin turbo rebuild, RE Amemiya body kit, HKS full exhaust, Bride Zeta III seats, Enkei RP-F1",
                    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800");
                insertV.run(2, "Nissan", "Silvia S15 Spec-R", 2000,
                    "SR20DET T28 single turbo, HPI wastegate, Cusco coilovers, Nismo LSD, Works Bell boss kit",
                    "https://images.unsplash.com/photo-1610714218830-a5ec8f93d61b?w=800");
                insertV.run(2, "Toyota", "Supra A80", 1994,
                    "2JZ-GTE single turbo 600whp, Garrett GTX3582, AEM standalone ECU, Recaro SPG seats, BBS RS wheels",
                    "https://images.unsplash.com/photo-1614026480249-f26ad896d4f7?w=800");

                // gt3_pilot (UID=3)
                insertV.run(3, "Porsche", "911 GT3 Cup (991)", 2018,
                    "Full race spec, Bilstein DampTronic, roll cage, Sabelt harness, fire suppression system",
                    "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800");
                insertV.run(3, "BMW", "M4 Competition", 2021,
                    "Eventuri carbon intake, Akrapovic slip-on exhaust, KW V3 coilovers, carbon fibre roof, M Performance brakes",
                    "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800");
                insertV.run(3, "Ferrari", "488 Pista", 2018,
                    "Completely stock — perfection needs no changes",
                    "https://images.unsplash.com/photo-1592198084033-aade902d1aae?w=800");

                // muscle_legends (UID=4)
                insertV.run(4, "Ford", "Mustang Shelby GT500", 1969,
                    "Restored 428 Cobra Jet, Holley carb rebuild, Tremec T-5 manual swap, Magnaflow exhaust, Shelby 10-spoke wheels",
                    "https://images.unsplash.com/photo-1547744152-14d985cb937f?w=800");
                insertV.run(4, "Chevrolet", "Camaro Z/28", 1970,
                    "Numbers-matching 350 V8, Edelbrock intake, Muncie 4-speed, Custom vinyl roof delete, Centerline wheels",
                    "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800");
                insertV.run(4, "Dodge", "Challenger Hellcat", 2020,
                    "Borla ATAK exhaust, cold air intake, Mopar widebody kit, Brembo brake upgrade, SRT performance pages tune",
                    "https://images.unsplash.com/photo-1611859266238-4b98091d9d9b?w=800");

                console.log("Seeded garage vehicles for all users.");
            }
        } catch (err) {
            console.error("Error seeding garage vehicles:", err);
        }
    }
}