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

            if (carGuideAuthorUid === null) return;

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
        } catch (err) {
            console.error("Error seeding car-specific guides:", err);
        }
    }
}