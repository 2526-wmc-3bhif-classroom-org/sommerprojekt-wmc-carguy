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
    }
}