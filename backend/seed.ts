import DatabaseConstructor from "better-sqlite3";
import * as bcrypt from "bcrypt";
import * as path from "path";
import * as fs from "fs";

const dataDir = path.resolve(__dirname, "data");
const dbPath = path.join(dataDir, "carguy.db");

if (!fs.existsSync(dbPath)) {
    console.error("DB not found. Run the server once to initialize tables first.");
    process.exit(1);
}

const db = new DatabaseConstructor(dbPath);
db.pragma("foreign_keys = ON");

// --- Dynamic Date Adjustment Helper ---
const maxSeedTime = new Date("2025-05-24T15:00:00.000Z").getTime();
const nowTime = new Date().getTime();
const offsetMs = nowTime - maxSeedTime;

function adjustDate(staticDateStr: string | null | undefined): string | null {
    if (!staticDateStr) return null;
    const originalTime = new Date(staticDateStr).getTime();
    return new Date(originalTime + offsetMs).toISOString();
}

console.log("Seeding rich English car community dataset (250+ entries with multiple images and debate threads)...");

// --- Clear existing data ---
db.exec(`
    DELETE FROM Comment;
    DELETE FROM Post;
    DELETE FROM User_In_Forum;
    DELETE FROM Forum;
    DELETE FROM Forum_Category;
    DELETE FROM Post_Category;
    DELETE FROM User;
`);

// --- Forum Categories ---
const categories = [
    [1, "Brands"],
    [2, "Motorsport"],
    [3, "General Advice"],
    [4, "Offroad & Overlanding"],
    [5, "Tuning & Performance"],
    [6, "Electric Vehicles"],
    [7, "Classic & Vintage"],
    [8, "DIY & Maintenance"],
    [9, "Car Photography"],
    [10, "Sim Racing & Gaming"]
];
const insertCat = db.prepare("INSERT INTO Forum_Category (Forum_Category_id, Forum_Category_Name) VALUES (?, ?)");
for (const cat of categories) {
    insertCat.run(cat[0], cat[1]);
}

// --- Post Categories ---
const postCategories = [
    [1, "Discussion"],
    [2, "Review"],
    [3, "News & Events"],
    [4, "Help & Q&A"],
    [5, "Showroom"]
];
const insertPostCat = db.prepare("INSERT INTO Post_Category (Post_Category_id, Post_Category_Name) VALUES (?, ?)");
for (const pc of postCategories) {
    insertPostCat.run(pc[0], pc[1]);
}

// --- Forums (Communities) ---
const forums = [
    [1, "BMW", "The Ultimate Driving Machine forum. Discuss M performance, legacy chassis, and upcoming releases.", null, 1, "2025-01-10T10:00:00.000Z"],
    [2, "Mercedes-AMG", "Affalterbach's finest. Focuses on AMG GT, classic V8 powerhouses, and luxury sport cruisers.", null, 1, "2025-01-10T10:05:00.000Z"],
    [3, "Audi Sport", "Home of Quattro AWD, RS performance wagons, and R8 supercar discussions.", null, 1, "2025-01-10T10:10:00.000Z"],
    [4, "Formula 1", "Keep up with Grand Prix weekends, technical regulation changes, driver transfers, and team updates.", null, 2, "2025-01-11T08:00:00.000Z"],
    [5, "Car Buying Advice", "Ask the community for recommendations, budget comparisons, reliable dailies, and buying checklists.", null, 3, "2025-01-12T09:00:00.000Z"],
    [6, "Offroad & SUV", "Overlanding build threads, trail reviews, rock crawling, lift kits, and general wilderness exploration advice.", null, 4, "2025-01-13T09:00:00.000Z"],
    [7, "Tuning & Customization", "Engine mapping, suspension setups, wrap designs, custom wheel offsets, and cosmetic body modifications.", null, 5, "2025-01-14T09:00:00.000Z"],
    [8, "Tesla & EV Lounge", "Dedicated space for electric vehicle battery health, charging networks, autopilots, and future EV concepts.", null, 6, "2025-01-15T09:00:00.000Z"],
    [9, "Porsche Purists", "For fans of Zuffenhausen's sports cars: 911s, transaxle models, Cayman GT4, and GT3 RS builds.", null, 1, "2025-01-16T10:00:00.000Z"],
    [10, "JDM Legends", "Discussion on Japanese Domestic Market performance cars: GT-R, Supra, RX-7, Evo, STI, and MX-5.", null, 1, "2025-01-17T11:00:00.000Z"],
    [11, "Garage DIY & Maintenance", "Share your home mechanic advice, tool reviews, fluid change guides, and general troubleshooting tips.", null, 8, "2025-01-18T12:00:00.000Z"],
    [12, "Automotive Photography", "Show off your high-quality car spots, camera settings, lens recommendations, and editing techniques.", null, 9, "2025-01-19T13:00:00.000Z"],
    [13, "Classic Muscle Cars", "For fans of vintage American V8s: Mustangs, Camaros, Chargers, and restoration builds.", null, 7, "2025-01-20T10:00:00.000Z"],
    [14, "Sim Racing & eSports", "Discuss rigs, wheelbases, Assetto Corsa, iRacing, Gran Turismo, and virtual lap times.", null, 10, "2025-01-21T11:00:00.000Z"]
];
const insertForum = db.prepare("INSERT INTO Forum (ForumID, Name, Description, ParentForumID, Forum_Category_id, CreatedAt) VALUES (?, ?, ?, ?, ?, ?)");
for (const f of forums) {
    insertForum.run(f[0], f[1], f[2], f[3], f[4], adjustDate(f[5] as string));
}

// --- Users ---
const pw = bcrypt.hashSync("password123", 10);
const adminPw = bcrypt.hashSync("admin123", 10);

const users = [
    [1, "max_m3", pw, "Max M.", "BMW enthusiast since the E30 era. Track day regular. Current driver: Alpine White E92 M3.", "user", "BMW Veteran", "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&h=120&fit=crop", "2025-01-15T12:00:00.000Z"],
    [2, "speed_demon", pw, "Anna Speed", "Professional racing instructor and amateur GT3 racer. Love F1 and fast laps.", "user", "Track Instructor", "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop", "2025-01-16T08:30:00.000Z"],
    [3, "carlo_amg", pw, "Carlo B.", "If it doesn't rumble, I don't drive it. AMG V8 advocate.", "user", "V8 Purist", "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&h=120&fit=crop", "2025-01-20T14:00:00.000Z"],
    [4, "tesla_tim", pw, "Tim Watts", "EV developer and software engineer. Electric is the future, deal with it.", "user", "EV Pioneer", "https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=120&h=120&fit=crop", "2025-01-21T10:00:00.000Z"],
    [5, "offroad_sam", pw, "Sam Wilder", "Overlander. Land Cruiser owner. Seeking trails, mountains, and muddy campgrounds.", "user", "Trailblazer", "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop", "2025-01-22T11:00:00.000Z"],
    [6, "classic_clara", pw, "Clara Vintage", "Restoring air-cooled Porsches and vintage muscle cars. Flat-six soundtrack is king.", "user", "Master Restorer", "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&h=120&fit=crop", "2025-01-23T12:00:00.000Z"],
    [7, "turbo_tommy", pw, "Tom Boost", "JDM tuner. Dedicated to turbo builds, custom offsets, and dyno runs.", "user", "Boost Addict", "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop", "2025-01-24T13:00:00.000Z"],
    [8, "jerry_audi", pw, "Jerry Quattro", "Audi RS6 Avant driver. Wagons are the ultimate daily driver format.", "user", "Wagon Mafia", "https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=120&h=120&fit=crop", "2025-01-25T14:00:00.000Z"],
    [9, "car_advisor", pw, "David L.", "Auto broker and car reviewer. Happy to help you decide your next financial mistake.", "user", "Buying Expert", "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&h=120&fit=crop", "2025-01-26T15:00:00.000Z"],
    [10, "admin", adminPw, "Platform Admin", "System administrator for CarGuy community. Keep it clean!", "admin", "Admin", "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&h=120&fit=crop", "2025-01-10T09:00:00.000Z"],
    [11, "porsche_pete", pw, "Pete Flat6", "Porsche collector. Owns a 993 Turbo, 997 GT3, and a Taycan Cross Turismo.", "user", "GT Collector", "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop", "2025-01-27T10:00:00.000Z"],
    [12, "jdm_yuki", pw, "Yuki Sato", "Gran Turismo veteran. Owns a Midnight Purple R34 Skyline GT-R.", "user", "JDM Purist", "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop", "2025-01-28T11:00:00.000Z"],
    [13, "clean_rig", pw, "Marcus Foam", "Detallist. Obsessed with paint correction, ceramic coatings, and snow foam.", "user", "Detailing Guru", "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop", "2025-01-29T12:00:00.000Z"],
    [14, "virtual_racer", pw, "Sarah Sim", "Professional sim racer. Direct drive wheels, VR headsets, and virtual apexes.", "user", "Sim Expert", "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&h=120&fit=crop", "2025-01-30T13:00:00.000Z"],
    [15, "track_day_tony", pw, "Tony Apex", "Supercharged NA Miata project car owner. Weight reduction is free horsepower.", "user", "Miata Driver", "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop", "2025-01-31T14:00:00.000Z"]
];
const insertUser = db.prepare("INSERT INTO User (UID, Username, Password, PublicName, Description, Role, Title, Image, CreatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
for (const u of users) {
    insertUser.run(u[0], u[1], u[2], u[3], u[4], u[5], u[6], u[7], adjustDate(u[8] as string));
}

// --- Communities Subscriptions (User_In_Forum) ---
const subscriptions = [
    [1, 1], [1, 5], [1, 7], [1, 11], [1, 13],
    [2, 4], [2, 1], [2, 7], [2, 9], [2, 14],
    [3, 2], [3, 5], [3, 7], [3, 13],
    [4, 8], [4, 5], [4, 11], [4, 14],
    [5, 6], [5, 5], [5, 11], [5, 13],
    [6, 7], [6, 5], [6, 9], [6, 11], [6, 13],
    [7, 7], [7, 10], [7, 11], [7, 13],
    [8, 3], [8, 5], [8, 12],
    [9, 5], [9, 1], [9, 2], [9, 3], [9, 9], [9, 13],
    [11, 9], [11, 12], [11, 11], [11, 13],
    [12, 10], [12, 7], [12, 12],
    [13, 11], [13, 12], [13, 7],
    [14, 4], [14, 10], [14, 14],
    [15, 7], [15, 10], [15, 11], [15, 14]
];
const insertSub = db.prepare("INSERT INTO User_In_Forum (UID, ForumID) VALUES (?, ?)");
for (const sub of subscriptions) {
    insertSub.run(sub[0], sub[1]);
}

// --- Posts ---
const postsData = [
    // --- BMW Forum (ForumID 1) ---
    [
        1, "E92 M3 vs E46 M3 — Which is the true M benchmark?",
        "I've owned both the E46 M3 with the S54 inline-six and the E92 M3 with the S65 V8. The E46 feels nimble and mechanical, while the E92 V8 screams all the way to 8,300 RPM. Here are photos of both from my garage! What do you think is the best daily driver sports car?",
        1, 1, 1, "2025-02-01T10:00:00.000Z",
        JSON.stringify([

            "/sample/e46_m3_track.png",
            "/sample/e46_m3_brakes.png",
            "/sample/csl_airbox.png"

        ]), 42, 3
    ],
    [
        2, "BMW M2 CS track setup advice",
        "Planning to run my M2 CS at Laguna Seca next month. I need recommendations on brake pad compounds (Pagid RS29 vs Hawk DCT70) and camber plate angles. Should I stick to the Michelin Pilot Sport Cup 2s?",
        2, 1, 4, "2025-02-05T14:30:00.000Z",
        JSON.stringify([
            "https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=800"
        ]), 18, 0
    ],
    [
        3, "Is the new M5 hybrid powertrain too heavy?",
        "The upcoming M5 hybrid reportedly weighs over 5,300 lbs. While it has 717 hp, the sheer mass seems to defy the physics of a track sedan. Take a look at these spy shots and weight distribution spec sheets. Will this change the agility profile of BMW M permanently?",
        9, 1, 3, "2025-02-10T09:15:00.000Z",
        JSON.stringify([

            "/sample/e46_m3_brakes.png",
            "/sample/e46_m3_track.png"

        ]), 64, 12
    ],
    [
        4, "Air-cooled flat-six swaps into classic BMW 2002?",
        "Hear me out. A Porsche 911 2.7L engine swapped into a restored BMW 2002 chassis. Sacrilege or mechanical perfection? Does anyone know if the transaxle would fit in the tunnel?",
        6, 1, 1, "2025-02-12T16:00:00.000Z",
        JSON.stringify([
            "https://images.unsplash.com/photo-1526726538690-5cbf956ae2fd?w=800",
            "https://images.unsplash.com/photo-1591278169757-deac26e49555?w=800"
        ]), 29, 8
    ],

    // --- Mercedes-AMG Forum (ForumID 2) ---
    [
        5, "Tribute to the M156 6.2L Naturally Aspirated V8",
        "There will never be another engine like the M156. The roar of a C63 Black Series or an SLS AMG is absolute thunder. With turbocharging and hybrid setups taking over, let's share our favorite cold start photos. Here is mine plus my W204 C63 wagon.",
        3, 2, 1, "2025-02-15T11:00:00.000Z",
        JSON.stringify([

            "/sample/ls3_engine.png",
            "/sample/ls3_engine.png"

        ]), 87, 2
    ],
    [
        6, "AMG GT R Pro — 1,000 mile owner review",
        "After 1,000 miles, the GT R Pro has exceeded all my expectations. The coilover suspension is harsh on city streets, but on track, the front-end bite is unbelievable. Check out these trackside pictures of my beast! Ask me anything about the car's driving dynamics or running costs.",
        2, 2, 2, "2025-02-18T16:45:00.000Z",
        JSON.stringify([

            "/sample/ls3_engine.png",
            "/sample/porsche_997.png"

        ]), 51, 1
    ],
    [
        7, "EQS AMG: Does the badge still fit the electric sedan?",
        "I recently test drove the EQS 53 AMG. While the acceleration is neck-snapping, the lack of mechanical feedback and sound made it feel more like a fast spaceship than a thoroughbred performance AMG. Thoughts?",
        4, 2, 1, "2025-02-20T10:00:00.000Z",
        JSON.stringify([
            "https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800",
            "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=800"
        ]), 12, 15
    ],

    // --- Audi Sport Forum (ForumID 3) ---
    [
        8, "Audi RS6 Avant — The undisputed king of wagons?",
        "Perfect styling, 591 hp twin-turbo V8, and enough space in the trunk to fit a set of racing wheels and luggage. Is there any car that does the double duty of family-hauler and performance weapon better than the RS6? Here is mine on road trips.",
        8, 3, 2, "2025-02-22T12:00:00.000Z",
        JSON.stringify([

            "/sample/supra_mk4.png",
            "/sample/r32_vs_r33.png"

        ]), 93, 1
    ],
    [
        9, "Quattro understeer myth or reality?",
        "Modern RS models have clever rear torque-splitter diffs, but older S/RS cars definitely wanted to plow straight when pushed hard. Let's discuss suspension adjustments (rear sway bar upgrades, spring rates) to resolve this.",
        2, 3, 4, "2025-02-24T08:30:00.000Z",
        JSON.stringify([
            "https://images.unsplash.com/photo-1616422285623-13ff0162193c?w=800"
        ]), 33, 4
    ],
    [
        10, "Audi R8 V10 Decennium — A future classic?",
        "With the naturally aspirated V10 discontinued, the R8 is going to skyrocket in collector value. The sound of that engine at 8,700 RPM is unmatched. Here are some photos of my Decennium edition #42 in matte bronze.",
        6, 3, 5, "2025-02-26T15:20:00.000Z",
        JSON.stringify([

            "/sample/porsche_997.png",
            "/sample/supra_mk4.png"

        ]), 112, 2
    ],

    // --- Formula 1 Forum (ForumID 4) ---
    [
        11, "Technical regulations for 2026: Active aero & smaller cars",
        "The FIA released details on the 2026 chassis regulations. Cars will be 10cm narrower and 20cm shorter, with active front and rear wings to balance drag on the straights. Will this improve wheel-to-wheel racing or create too much turbulence?",
        2, 4, 3, "2025-03-01T09:00:00.000Z",
        JSON.stringify([
            "https://images.unsplash.com/photo-1614200187524-dc4b892acf16?w=800"
        ]), 74, 5
    ],
    [
        12, "Pre-season testing predictions and times analysis",
        "Looking at the long-run telemetry from Bahrain testing, Red Bull's tire degradation looks minimal, but McLaren is showing serious top-speed gains. Here is my breakdown of the average stint times.",
        2, 4, 1, "2025-03-03T18:00:00.000Z",
        JSON.stringify([
            "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800"
        ]), 41, 2
    ],
    [
        13, "Lewis Hamilton's transition to Ferrari: Driver dynamics",
        "How will the Leclerc-Hamilton pairing work? Ferrari is known for having a clear driver priority, but neither of these two will want to play second fiddle. Will this be a championship-winning duo or team drama?",
        9, 4, 1, "2025-03-05T14:15:00.000Z",
        JSON.stringify([

            "/sample/supra_mk4.png",
            "/sample/ls3_engine.png"

        ]), 89, 4
    ],

    // --- Car Buying Advice Forum (ForumID 5) ---
    [
        14, "First track car on a 15,000$ budget — Miata or E36?",
        "Looking to purchase my first dedicated track day car. 15k limit. A Mazda MX-5 (NC/ND) is reliable and cheap on consumables, but an E36 328i has more power and that classic BMW chassis feel. Which one would you buy?",
        9, 5, 4, "2025-03-08T12:00:00.000Z",
        JSON.stringify([
            "https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800"
        ]), 38, 1
    ],
    [
        15, "Is a used Porsche Macan a reliable daily commuter?",
        "I'm considering a 2018 Macan S with 60k miles. The price is tempting (under 30k$), but I'm worried about PDK issues, oil leaks, and Porsche maintenance pricing. Any owners here who can share their repair bills?",
        1, 5, 4, "2025-03-10T10:45:00.000Z",

        JSON.stringify(["/sample/r32_vs_r33.png"]), 27, 2

    ],
    [
        16, "Hot hatch battle: Civic Type R FL5 vs Golf R Mk8",
        "Fwd mechanical driver's car vs Awd daily driver rocket. The Type R has the best shifter in the world, but the Golf R is much easier to live with in the winter. What are your buying factors?",
        7, 5, 2, "2025-03-12T09:00:00.000Z",
        JSON.stringify([

            "/sample/porsche_997.png",
            "/sample/porsche_997.png"

        ]), 48, 3
    ],

    // --- Offroad & SUV Forum (ForumID 6) ---
    [
        17, "Land Cruiser 80 Series overlanding build log",
        "Starting a full frame-up restoration and overland build of my 1996 FZJ80 Land Cruiser. Plan: 3-inch OME lift, 35-inch Nitto tires, custom rear bumper with swing-outs, and a roof-top tent. Here are the starting shots of the rig!",
        5, 6, 5, "2025-03-14T09:00:00.000Z",
        JSON.stringify([

            "/sample/csl_airbox.png",
            "/sample/e46_m3_track.png"

        ]), 125, 0
    ],
    [
        18, "Rooftop tents vs Ground tents: The ultimate review",
        "Having spent 50 nights in both, here is my detailed breakdown of the pros/cons of rooftop tents (quick setup, flat surface) vs ground tents (saves MPG, doesn't lock you to the campsite).",
        5, 6, 2, "2025-03-16T11:00:00.000Z",
        JSON.stringify([
            "https://images.unsplash.com/photo-1547245324-d777c6f05e80?w=800"
        ]), 49, 3
    ],
    [
        19, "Best recovery gear for solo travel in deep sand?",
        "Planning a solo trip to the desert. I already have Maxtrax recovery boards and a tire deflator. Should I prioritize a winch or a heavy-duty kinetic recovery rope?",
        5, 6, 4, "2025-03-18T15:30:00.000Z",
        JSON.stringify([
            "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800"
        ]), 22, 1
    ],

    // --- Tuning & Customization Forum (ForumID 7) ---
    [
        20, "Mazda RX-7 FD rotary rebuild and twin-turbo tuning",
        "Finally pulled the 13B-REW engine out of my FD RX-7 to do a street port rebuild and upgrade to a single Garrett G30-770 turbo. Goal is a reliable 450 hp. Here are the teardown photos from the garage.",
        7, 7, 5, "2025-03-20T09:00:00.000Z",
        JSON.stringify([

            "/sample/porsche_997.png",
            "/sample/porsche_997.png"

        ]), 143, 4
    ],
    [
        21, "Understanding wheel offsets, scrub radius, and fender rolling",
        "If you want that perfect stance without destroying your handling, you need to calculate scrub radius. Here is an interactive chart explaining offset (ET), spacer width, and alignment impact.",
        7, 7, 1, "2025-03-22T13:00:00.000Z",
        JSON.stringify([
            "https://images.unsplash.com/photo-1567808291548-fc3ee04dbcf0?w=800"
        ]), 61, 0
    ],
    [
        22, "Wrapped my Audi RS3 in Satin Chrome Emerald Green",
        "Just finished a full DIY wrap of my Audi RS3. Took me about 45 hours over two weekends. The satin green contrast with carbon fiber mirror caps looks amazing under sunlight.",
        8, 7, 5, "2025-03-24T16:20:00.000Z",
        JSON.stringify([

            "/sample/porsche_997.png",
            "/sample/supra_mk4.png"

        ]), 98, 2
    ],

    // --- Tesla & EV Lounge Forum (ForumID 8) ---
    [
        23, "EV Battery health: Best charging practices for LFP vs NCA batteries",
        "Tired of battery anxiety? Let's clarify the difference between LFP batteries (can be charged to 100% daily) and NCA/NMC batteries (should be kept between 20% and 80% for longevity). Here's the data.",
        4, 8, 4, "2025-03-26T09:00:00.000Z",
        JSON.stringify([
            "https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800"
        ]), 57, 3
    ],
    [
        24, "Road tripping in a non-Tesla EV: State of CCS network in 2025",
        "Just completed a 1,500-mile road trip in an Hyundai Ioniq 5. The charging speed is amazing when it works, but broken CCS dispensers and buggy payment screens made it quite stressful. We need NACS adapters asap.",
        4, 8, 2, "2025-03-28T10:30:00.000Z",
        JSON.stringify([
            "https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800"
        ]), 38, 5
    ],

    // --- Porsche Purists (ForumID 9) ---
    [
        25, "Porsche 911 GT3 RS (992) Aerodynamics breakdown",
        "The active front wing and rear wing DRS on the 992 GT3 RS are a masterpiece of engineering. Having clocked a few laps at the Ring, the downforce in fast sweepers is mindblowing. Check out these shots of the DRS active. Let's talk drag vs downforce setups.",
        11, 9, 2, "2025-04-01T10:00:00.000Z",
        JSON.stringify([

            "/sample/ls3_engine.png",
            "/sample/r32_vs_r33.png",
            "/sample/r32_vs_r33.png"

        ]), 154, 1
    ],
    [
        26, "Air-cooled 993 Turbo maintenance guide",
        "The 993 Turbo is the holy grail for air-cooled fans. Here is my complete guide to verifying oil lines, distributor belt replacements, and turbo oil accumulator upgrades. Keeping these classics perfect takes patience.",
        6, 9, 4, "2025-04-03T11:30:00.000Z",
        JSON.stringify([
            "https://images.unsplash.com/photo-1588258219511-64eb629cb833?w=800",
            "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=800"
        ]), 72, 0
    ],
    [
        27, "Cayman GT4 RS: Is it better than a base 911?",
        "The mid-engine layout paired with the GT3's 4.0L engine produces an incredible intake noise right behind your ears. Having driven both on track, the GT4 RS feels more playful than the 911 Carrera. Discuss!",
        2, 9, 1, "2025-04-05T14:00:00.000Z",
        JSON.stringify([
            "https://images.unsplash.com/photo-1632245889029-e406faaa34cd?w=800",
            "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=800"
        ]), 83, 4
    ],

    // --- JDM Legends (ForumID 10) ---
    [
        28, "Skyline GT-R R34 Midnight Purple restoration project",
        "Starting a full paint restoration and mechanical refresh on my R34 GT-R V-Spec II. The Midnight Purple paint has some minor swirl marks that need professional paint correction. Here are the before, during, and after correction shots.",
        12, 10, 5, "2025-04-07T09:00:00.000Z",
        JSON.stringify([

            "/sample/supra_mk4.png",
            "/sample/supra_mk4.png"

        ]), 192, 0
    ],
    [
        29, "Toyota Supra MK4 2JZ-GTE build: Aiming for 800 hp",
        "My 2JZ engine is officially on the stand. Plan: forged pistons, single HKS T51R turbo, and a standalone Haltech ECU. Take a look at the custom exhaust manifold and the turbocharger mockups! What fuel pump setup are you running for E85?",
        7, 10, 5, "2025-04-10T12:00:00.000Z",
        JSON.stringify([

            "/sample/csl_airbox.png",
            "/sample/porsche_997.png"

        ]), 120, 2
    ],
    [
        30, "Mazda MX-5 NA: Why weight reduction matters",
        "Pulled out the carpet, sound deadening, soft top, and passenger seat from my NA Miata. Down to 2,050 lbs! The acceleration with the stock 1.6L feels noticeably crisper. Who else runs a stripped interior?",
        15, 10, 1, "2025-04-12T15:30:00.000Z",
        JSON.stringify([
            "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800"
        ]), 45, 1
    ],

    // --- Garage DIY & Maintenance (ForumID 11) ---
    [
        31, "Essential tools for any home garage setup",
        "If you are starting to work on your own car, don't buy cheap sockets. Here is my list of 10 essential tools: low-profile jack, high-quality jack stands, digital torque wrench, and impact wrench reviews. Here are photos of my tool cabinet and shadow boards.",
        11, 11, 4, "2025-04-14T09:00:00.000Z",
        JSON.stringify([

            "/sample/ls3_engine.png",
            "/sample/ls3_engine.png"

        ]), 88, 0
    ],
    [
        32, "How to diagnose a misfire: Step-by-step tutorial",
        "A cylinder misfire can be caused by spark, fuel, or compression. Here is a troubleshooting flow chart to narrow down the culprit using a basic OBD2 scanner, spark plug test, and coil swaps.",
        1, 11, 4, "2025-04-16T11:00:00.000Z",
        JSON.stringify([
            "https://images.unsplash.com/photo-1567808291548-fc3ee04dbcf0?w=800"
        ]), 54, 1
    ],
    [
        33, "Safe jack points on a modern unibody chassis",
        "Never jack up your car by the floorboards or oil pan! Always locate the pinch welds or subframe crossmembers. Sharing photos of common mistake zones to help beginners stay safe.",
        5, 11, 1, "2025-04-18T14:30:00.000Z",
        JSON.stringify([
            "https://images.unsplash.com/photo-1567808291548-fc3ee04dbcf0?w=800"
        ]), 41, 0
    ],

    // --- Automotive Photography (ForumID 12) ---
    [
        34, "Golden hour car photography: Camera settings and filters",
        "Capturing the perfect reflection on metallic paint requires a Circular Polarizer (CPL) filter. Here are my favorite settings for a 50mm f/1.8 lens during sunset. Feel free to share your shots! Here is my shootout with two different filters.",
        12, 12, 5, "2025-04-20T17:00:00.000Z",
        JSON.stringify([

            "/sample/e46_m3_track.png",
            "/sample/ls3_engine.png"

        ]), 110, 2
    ],
    [
        35, "Adobe Lightroom presets for car photography editing",
        "Sharing my custom Lightroom preset pack for automotive shots. It desaturates greens to make the car paint pop, and boosts shadows for engine bay details. Download link inside.",
        13, 12, 5, "2025-04-22T10:00:00.000Z",
        JSON.stringify([
            "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=800"
        ]), 65, 0
    ],

    // --- Formula 1 Forum (ForumID 4) ---
    [
        36, "Monaco Grand Prix: Is it time to drop it from the calendar?",
        "Monaco has historic prestige, but modern F1 cars are too wide for overtaking. It has basically become a Sunday parade. Should F1 replace it with a modern street circuit or keep it for the glamor?",
        2, 4, 1, "2025-04-24T09:00:00.000Z",
        JSON.stringify([
            "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=800",
            "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=800"
        ]), 49, 15
    ],

    // --- Car Buying Advice (ForumID 5) ---
    [
        37, "Buying a used Porsche Cayman (987.2) Checklist",
        "The 987.2 Cayman solved the dreaded IMS bearing issue of the 987.1. If you are looking to buy one, check the shifter cables, water pump, and rear main seal. What is a reasonable mileage threshold?",
        9, 5, 4, "2025-04-26T12:00:00.000Z",
        JSON.stringify([
            "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=800",
            "https://images.unsplash.com/photo-1588258219511-64eb629cb833?w=800"
        ]), 33, 1
    ],

    // --- Offroad & SUV (ForumID 6) ---
    [
        38, "Jeep Wrangler vs Ford Bronco: Real trail comparison",
        "Took both a Wrangler Rubicon and a Bronco Sasquatch through the Rubicon Trail last weekend. The Bronco's independent front suspension is amazing on highway, but the Jeep's solid axle is king for articulation.",
        5, 6, 2, "2025-04-28T14:00:00.000Z",
        JSON.stringify([
            "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800",
            "https://images.unsplash.com/photo-1547245324-d777c6f05e80?w=800"
        ]), 56, 3
    ],

    // --- Tuning & Customization (ForumID 7) ---
    [
        39, "Why ceramic coating is worth the money",
        "A ceramic coating creates a hydrophobic layer that repels dirt and makes washing your car incredibly easy. Did a dual-stage paint correction and applied Gtechniq Crystal Serum Light. The shine is unreal. Here are some wash panels.",
        13, 7, 5, "2025-05-01T10:00:00.000Z",
        JSON.stringify([

            "/sample/ls3_engine.png",
            "/sample/e46_m3_track.png"

        ]), 78, 1
    ],

    // --- Tesla & EV Lounge (ForumID 8) ---
    [
        40, "Porsche Taycan vs Tesla Model S Plaid",
        "Porsche focus on handling and sustained track performance, Tesla focuses on straight line speed and charging tech. If you had 100k$ to spend on a high performance EV, which path would you take?",
        4, 8, 1, "2025-05-03T11:00:00.000Z",
        JSON.stringify([
            "https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800",
            "https://images.unsplash.com/photo-1632245889029-e406faaa34cd?w=800"
        ]), 44, 8
    ],

    // --- Porsche Purists (ForumID 9) ---
    [
        41, "The legendary Porsche 959 — Ahead of its time",
        "Twin-turbo, active suspension, sequential turbocharging, and variable AWD in 1986! The 959 set the template for modern supercars. Share your favorite photos of this historic masterpiece.",
        11, 9, 1, "2025-05-05T09:00:00.000Z",
        JSON.stringify([

            "/sample/r32_vs_r33.png",
            "/sample/ls3_engine.png"

        ]), 95, 0
    ],

    // --- JDM Legends (ForumID 10) ---
    [
        42, "Honda S2000 AP2: Reaching 9,000 RPM in the canyons",
        "The F22C engine is a masterpiece. VTEC engaging at 6,000 RPM feels like a secondary engine kicking in. Added a Spoon exhaust and Ohlins coilovers. Here is my weekend mountain pass shot.",
        15, 10, 5, "2025-05-08T08:00:00.000Z",
        JSON.stringify([

            "/sample/porsche_997.png",
            "/sample/csl_airbox.png"

        ]), 105, 0
    ],

    // --- DIY & Maintenance (ForumID 11) ---
    [
        43, "How to flush brake fluid by yourself",
        "Brake fluid absorbs moisture over time, lowering its boiling point. Here is a DIY guide using a one-man pressure bleeder kit. Highly recommended before any track day or mountain run.",
        15, 11, 4, "2025-05-10T15:00:00.000Z",
        JSON.stringify([
            "https://images.unsplash.com/photo-1567808291548-fc3ee04dbcf0?w=800"
        ]), 36, 1
    ],

    // --- Automotive Photography (ForumID 12) ---
    [
        44, "Rig shots: How to capture motion blur safely",
        "Using a suction cup mount and a long carbon fiber boom pole to shoot rolling car photos at slow shutter speeds. Here is my setup guide and how to clone out the rig in Photoshop.",
        12, 12, 1, "2025-05-12T13:00:00.000Z",
        JSON.stringify([
            "https://images.unsplash.com/photo-1614200187524-dc4b892acf16?w=800"
        ]), 42, 0
    ],

    // --- General / Buying (ForumID 5) ---
    [
        45, "Is buying a high-mileage Lexus a safe bet?",
        "Considering a 2013 Lexus GS350 with 150k miles. The service history is spotless with oil changes every 5k miles. Are these V6 engines really as bulletproof as they say?",
        9, 5, 4, "2025-05-14T10:00:00.000Z",
        JSON.stringify([
            "https://images.unsplash.com/photo-1619682817481-e994891cd1f5?w=800"
        ]), 25, 0
    ],

    // --- Offroad (ForumID 6) ---
    [
        46, "Tire pressure for trail driving: How low can you go without beadlocks?",
        "When running standard wheels on trails, deflating tires increases the footprint and traction. But going too low risks popping a bead. Is 15 PSI the safe sweet spot for 33-inch tires?",
        5, 6, 4, "2025-05-16T11:00:00.000Z",
        JSON.stringify([
            "https://images.unsplash.com/photo-1547245324-d777c6f05e80?w=800",
            "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800"
        ]), 32, 1
    ],

    // --- Tuning (ForumID 7) ---
    [
        47, "Coilovers vs Air Suspension: Track vs Stance",
        "Coilovers give you consistent spring rates and mechanical grip, but air bags let you clear speedbumps at the press of a button. Which system fits your build philosophy best?",
        7, 7, 1, "2025-05-18T14:00:00.000Z",
        JSON.stringify([
            "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800"
        ]), 48, 2
    ],

    // --- Porsche (ForumID 9) ---
    [
        48, "Porsche 911 (991.2) GTS: The sweet spot of the range?",
        "With rear-wheel steering, wide body, and 450 hp twin-turbo flat-six, the GTS offers 90% of the GT3's capability on track while being much more comfortable on long road trips. My review.",
        11, 9, 2, "2025-05-20T09:00:00.000Z",
        JSON.stringify([
            "/sample/r32_vs_r33.png",
            "/sample/ls3_engine.png"
        ]), 67, 1
    ],

    // --- JDM (ForumID 10) ---
    [
        49, "Mitsubishi Lancer Evolution IX: The rally legend",
        "The 4G63 engine paired with the active center differential makes the Evo IX feel like it cheats physics on gravel roads. Just finished installing a fresh set of tarmac spec coilovers. Drive report.",
        12, 10, 2, "2025-05-22T13:00:00.000Z",
        JSON.stringify([

            "/sample/porsche_997.png",
            "/sample/supra_mk4.png"

        ]), 89, 0
    ],

    // --- DIY (ForumID 11) ---
    [
        50, "Cleaning a dirty engine bay: Step-by-step instructions",
        "A dirty engine bay holds heat and makes it hard to spot oil leaks. Here is how to safely detail your engine bay using plastic wrap to protect the alternator, APC, and a soft detailing brush.",
        13, 11, 4, "2025-05-24T10:00:00.000Z",
        JSON.stringify([
            "https://images.unsplash.com/photo-1591278169757-deac26e49555?w=800"
        ]), 55, 0
    ],
    // --- New BMW Posts (ForumID 1) ---
    [
        51, "M3 Competition G80: Is the grille growing on you?",
        "After one year of ownership of the G80 M3 Competition, I have to admit the controversial front grille has completely grown on me. The performance of the S58 engine and the xDrive system is absolutely mindblowing. Track day shots inside!",
        1, 1, 1, "2025-05-24T12:00:00.000Z",

        JSON.stringify(["/sample/e46_m3_track.png"]), 40, 2

    ],
    [
        52, "E46 M3 subframe reinforcement guide",
        "Detailed guide on preparing, welding, and sealing the rear subframe reinforcement plates on the E46 chassis. Highly recommended to do before it cracks.",
        1, 1, 4, "2025-05-24T13:00:00.000Z",
        JSON.stringify([
            "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800"
        ]), 30, 0
    ],
    // --- New Mercedes-AMG Posts (ForumID 2) ---
    [
        53, "C63 AMG W204 vs W205: Sound comparison",
        "Is the hot-V twin-turbo 4.0L V8 in the W205 actually louder than the legendary 6.2L NA V8 in the W204? Share your decibel readings and exhaust modifications.",
        3, 2, 1, "2025-05-24T14:00:00.000Z",
        JSON.stringify([
            "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=800",
            "https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=800"
        ]), 35, 1
    ],
    [
        54, "AMG ONE hypercar: F1 tech on the street",
        "Discussing the engineering marvel of the Mercedes-AMG ONE. Fitting a literal 1.6L F1 hybrid engine into a road-legal car is insane.",
        2, 2, 3, "2025-05-24T14:30:00.000Z",
        JSON.stringify([
            "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=800",
            "https://images.unsplash.com/photo-1617654112368-307921291f42?w=800"
        ]), 55, 0
    ],
    // --- New Audi Sport Posts (ForumID 3) ---
    [
        55, "RS3 5-Cylinder: The best sounding hot hatch?",
        "The 2.5 TFSI engine has a unique 1-2-4-5-3 firing order that sounds like a mini V10. Installed a Milltek exhaust. Cold start video clip.",
        8, 3, 1, "2025-05-24T15:00:00.000Z",

        JSON.stringify(["/sample/supra_mk4.png"]), 62, 1

    ],
    [
        56, "Audi Quattro UR-Quattro restoration journey",
        "Starting a restoration of a 1983 Audi Ur-Quattro. Finding parts for the early 10V engine is proving to be a massive challenge. Any leads on body panels?",
        6, 3, 5, "2025-05-24T15:30:00.000Z",
        JSON.stringify([
            "https://images.unsplash.com/photo-1591278169757-deac26e49555?w=800",
            "https://images.unsplash.com/photo-1526726538690-5cbf956ae2fd?w=800"
        ]), 47, 0
    ],
    // --- New Formula 1 Posts (ForumID 4) ---
    [
        57, "F1 2026 Engine Rules: More electric power",
        "The MGU-H is dropped, and electric power is tripled to 350kW. Will this make the cars feel like heavy hybrids, or will the power delivery be spectacular?",
        2, 4, 3, "2025-05-24T16:00:00.000Z",
        JSON.stringify([
            "https://images.unsplash.com/photo-1614200187524-dc4b892acf16?w=800"
        ]), 29, 3
    ],
    [
        58, "Top 10 F1 livery designs of all time",
        "From the Jordan 191 to the JPS Lotus and Marlboro McLaren. What is your favorite F1 paint scheme ever designed?",
        14, 4, 1, "2025-05-24T16:30:00.000Z",

        JSON.stringify(["/sample/supra_mk4.png"]), 48, 2

    ],
    // --- New Car Buying Advice Posts (ForumID 5) ---
    [
        59, "Should I buy a high mileage Porsche Cayman 987?",
        "Found a 2007 Cayman 2.7L with 120k miles for $14,000. Spotless service history but IMS has not been retrofitted. Is it worth the gamble?",
        9, 5, 4, "2025-05-24T17:00:00.000Z",
        JSON.stringify([
            "https://images.unsplash.com/photo-1588258219511-64eb629cb833?w=800",
            "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=800"
        ]), 18, 1
    ],
    [
        60, "Best reliable winter daily driver under 10k$",
        "Need a dependable daily for snowy commutes. Thinking Subaru Impreza vs Mazda 3 AWD vs Lexus RX350. What has the best rust resistance?",
        9, 5, 4, "2025-05-24T17:30:00.000Z",
        JSON.stringify([
            "https://images.unsplash.com/photo-1547245324-d777c6f05e80?w=800"
        ]), 22, 0
    ],
    // --- New Offroad & SUV Posts (ForumID 6) ---
    [
        61, "Suzuki Jimny overland build: Tiny but capable",
        "Fitting my Jimny with a custom drawer system, 2-inch lift, and roof rack. Who says you need a massive rig to explore the wilderness?",
        5, 6, 5, "2025-05-24T18:00:00.000Z",

        JSON.stringify(["/sample/csl_airbox.png"]), 73, 1

    ],
    [
        62, "Recovery tracks: MaxTrax vs cheaper alternatives",
        "Are original MaxTrax really worth $300, or do the cheap $80 recovery boards do the same job when you are stuck in deep mud?",
        5, 6, 2, "2025-05-24T18:30:00.000Z",
        JSON.stringify([
            "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800",
            "https://images.unsplash.com/photo-1547245324-d777c6f05e80?w=800"
        ]), 39, 2
    ],
    // --- New Tuning & Customization Posts (ForumID 7) ---
    [
        63, "Stage 2 tuning checklist for VAG 2.0 TSI engines",
        "Downpipe, intercooler, intake, and clutch upgrade requirements before flashing a Stage 2 ECU tune. Sharing dyno graphs.",
        7, 7, 4, "2025-05-24T19:00:00.000Z",
        JSON.stringify([
            "https://images.unsplash.com/photo-1616422285623-13ff0162193c?w=800",
            "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=800"
        ]), 41, 0
    ],
    [
        64, "Tein vs BC Racing coilovers: Budget review",
        "Comparing ride comfort and track durability of BC Racing BR series vs Tein Flex Z coilovers on a daily driven sports car.",
        7, 7, 2, "2025-05-24T19:30:00.000Z",
        JSON.stringify([
            "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800"
        ]), 33, 1
    ],
    // --- New Tesla & EV Lounge Posts (ForumID 8) ---
    [
        65, "Tesla Model 3 Highland review: Solid improvements",
        "Having driven the refreshed Model 3 for 5,000 miles, the suspension comfort and cabin quietness are a massive step up from the pre-refresh version.",
        4, 8, 2, "2025-05-24T20:00:00.000Z",
        JSON.stringify([
            "https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800"
        ]), 52, 3
    ],
    [
        66, "Solid State batteries: Timeline and expectations",
        "When will we actually see solid state batteries in production EVs? Toyota claims 2027, but scaling mass manufacturing is a different beast.",
        4, 8, 3, "2025-05-24T20:30:00.000Z",
        JSON.stringify([
            "https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800"
        ]), 28, 0
    ],
    // --- New Porsche Purists Posts (ForumID 9) ---
    [
        67, "Porsche 996: The most undervalued 911?",
        "With the headlights and IMS issues driving prices down, a clean manual 996 Carrera under 20k$ seems like the ultimate entry point to 911 ownership.",
        11, 9, 1, "2025-05-24T21:00:00.000Z",

        JSON.stringify(["/sample/r32_vs_r33.png"]), 49, 2

    ],
    [
        68, "Porsche 928 GTS restoration: Mechanical nightmare",
        "The vacuum lines and wiring harnesses on the late 928 V8 are incredibly complex. Spent the weekend diagnosing a parasitic battery drain.",
        6, 9, 5, "2025-05-24T21:30:00.000Z",
        JSON.stringify([
            "https://images.unsplash.com/photo-1591278169757-deac26e49555?w=800",
            "https://images.unsplash.com/photo-1588258219511-64eb629cb833?w=800"
        ]), 36, 0
    ],
    // --- New JDM Legends Posts (ForumID 10) ---
    [
        69, "Subaru WRX STI EJ25 engine safety mods",
        "How to prevent the notorious ringland failure: cylinder 4 chamber cooling mod, oil pickup upgrade, and a high-quality tune.",
        12, 10, 4, "2025-05-24T22:00:00.000Z",
        JSON.stringify([
            "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800",
            "https://images.unsplash.com/photo-1619682817481-e994891cd1f5?w=800"
        ]), 63, 1
    ],
    [
        70, "Honda Civic Type R EK9: The high-revving hatch",
        "There is something magical about a naturally aspirated 1.6L B16B engine screaming all the way to 8,200 RPM in a chassis that weighs under 2,400 lbs.",
        12, 10, 1, "2025-05-24T22:30:00.000Z",

        JSON.stringify(["/sample/csl_airbox.png"]), 85, 0

    ],
    // --- New Garage DIY & Maintenance Posts (ForumID 11) ---
    [
        71, "Best engine oil brands: Project lab analysis",
        "Comparing Mobil1 vs Liqui Moly vs Pennzoil Platinum after 5,000 miles of track and daily driving. Oil analysis sheets attached.",
        11, 11, 1, "2025-05-24T23:00:00.000Z",
        JSON.stringify([
            "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800"
        ]), 59, 1
    ],
    [
        72, "How to fix a stripped thread: Time-Sert vs Heli-Coil",
        "If you stripped an oil pan bolt thread, here is why a Time-Sert solid bushing is far superior and more reliable than a Heli-Coil spring wire.",
        11, 11, 4, "2025-05-24T23:30:00.000Z",
        JSON.stringify([
            "https://images.unsplash.com/photo-1567808291548-fc3ee04dbcf0?w=800"
        ]), 44, 0
    ],
    // --- New Automotive Photography Posts (ForumID 12) ---
    [
        73, "Panning shots tutorial: Capturing motion at 1/30s",
        "How to track a moving car with your camera to blur the background while keeping the vehicle razor sharp. Settings, lens choice, and technique tips.",
        12, 12, 4, "2025-05-25T00:00:00.000Z",

        JSON.stringify(["/sample/e46_m3_track.png"]), 92, 1

    ],
    [
        74, "Best lenses for car shows: 35mm vs 50mm vs 85mm",
        "Comparing focal lengths in crowded spaces. The 35mm is great for tight spots, but the 85mm creates beautiful isolation if you have the distance.",
        13, 12, 1, "2025-05-25T00:30:00.000Z",
        JSON.stringify([
            "https://images.unsplash.com/photo-1614200187524-dc4b892acf16?w=800",
            "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=800"
        ]), 38, 0
    ],
    // --- New Classic Muscle Cars Posts (ForumID 13) ---
    [
        75, "1969 Dodge Charger restoration: Barn find build",
        "Starting a restoration on a Charger found in a barn. Rusted floor pans need replacing, and the 440 Magnum engine needs a full rebuild. Teardown photos!",
        6, 13, 5, "2025-05-25T01:00:00.000Z",

        JSON.stringify(["/sample/porsche_997.png"]), 115, 0

    ],
    [
        76, "Classic Ford Mustang: Restomod vs Original spec",
        "Should a vintage Mustang be kept strictly stock with drum brakes and points ignition, or retrofitted with modern suspension, disc brakes, and EFI?",
        6, 13, 1, "2025-05-25T01:30:00.000Z",
        JSON.stringify([
            "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800",
            "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800"
        ]), 64, 4
    ],
    [
        77, "LS Swap everything: The ultimate engine swap debate",
        "Is putting a modern Chevy LS V8 into a classic Dodge or Ford a brilliant performance upgrade or a complete insult to automotive heritage?",
        3, 13, 1, "2025-05-25T02:00:00.000Z",
        JSON.stringify([
            "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800",
            "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800"
        ]), 49, 12
    ],
    // --- New Sim Racing & Gaming Posts (ForumID 14) ---
    [
        78, "Sim Racing rig setup: Aluminum extrusion guide",
        "Why building a custom rig using 8020 aluminum extrusion is the most cost-effective and rigid solution for direct-drive wheelbases.",
        14, 14, 5, "2025-05-25T02:30:00.000Z",

        JSON.stringify(["/sample/porsche_997.png"]), 83, 1

    ],
    [
        79, "Assetto Corsa vs iRacing: Physics comparison",
        "Which sim offers the most realistic tire slip angles, force feedback detail, and online multiplayer safety rating systems?",
        14, 14, 1, "2025-05-25T03:00:00.000Z",
        JSON.stringify([
            "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800",
            "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=800"
        ]), 72, 3
    ],
    [
        80, "Best VR headset for sim racing in 2025",
        "Comparing the HP Reverb G2 vs Meta Quest 3 vs Pimax Crystal for frame rate stability, field of view, and cockpit text readability.",
        14, 14, 4, "2025-05-25T03:30:00.000Z",
        JSON.stringify([
            "https://images.unsplash.com/photo-1614200187524-dc4b892acf16?w=800"
        ]), 45, 0
    ],

    // --- Additional posts with fitting car images ---

    // BMW Forum (ForumID 1)
    [
        81, "BMW M4 CSL: The last pure M car?",
        "The M4 CSL is 240 lbs lighter than the standard M4 Competition and produces 543 hp from the S58. Carbon fiber roof, bucket seats, and no rear seats. Is this the last truly hardcore BMW M car before full electrification?",
        1, 1, 1, "2025-05-26T09:00:00.000Z",
        JSON.stringify([
            "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800",
            "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800"
        ]), 88, 3
    ],

    // Mercedes-AMG Forum (ForumID 2)
    [
        82, "AMG GT Black Series: The pinnacle of AMG engineering",
        "The GT Black Series with the flat-plane 730 hp V8 set a Nürburgring production car record. Here are detailed photos of the aerodynamic package — front splitter, adjustable wing, and dive planes.",
        3, 2, 2, "2025-05-26T10:00:00.000Z",
        JSON.stringify([
            "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=800",
            "https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=800"
        ]), 134, 1
    ],

    // Audi Sport Forum (ForumID 3)
    [
        83, "Audi RS4 Avant B8: The sleeper wagon",
        "The 4.2L FSI V8 in the B8 RS4 Avant revs to 8,250 RPM and sounds incredible. With a simple ECU tune you can push well past 450 hp. Here are dyno graphs and some canyon road shots of my silver example.",
        8, 3, 5, "2025-05-26T11:00:00.000Z",
        JSON.stringify([
            "https://images.unsplash.com/photo-1616422285623-13ff0162193c?w=800",
            "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=800"
        ]), 76, 2
    ],

    // Porsche Purists Forum (ForumID 9)
    [
        84, "Porsche Cayman GT4 track walk: Spa-Francorchamps",
        "Spent the weekend lapping Spa in my GT4 RS. The Eau Rouge complex at full speed with the flat-six screaming is a religious experience. Sharing onboard footage stills and paddock shots.",
        11, 9, 2, "2025-05-26T12:00:00.000Z",
        JSON.stringify([
            "https://images.unsplash.com/photo-1632245889029-e406faaa34cd?w=800",
            "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=800"
        ]), 109, 0
    ],

    // JDM Legends Forum (ForumID 10)
    [
        85, "Nissan GT-R R35: A decade of tuning evolution",
        "From stock 480 hp all the way to 1,500 hp with a built VR38DETT and Alpha Performance kit. The GT-R platform is the most tunable AWD supercar ever made. Build timeline photos inside.",
        12, 10, 5, "2025-05-26T13:00:00.000Z",
        JSON.stringify([
            "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800",
            "https://images.unsplash.com/photo-1567808291548-fc3ee04dbcf0?w=800"
        ]), 147, 2
    ],

    // Offroad & SUV Forum (ForumID 6)
    [
        86, "Toyota Land Cruiser 300 Series vs Defender 130: Overlanding battle",
        "Both are top-tier expedition platforms. The LC300 has legendary reliability and resale value. The Defender has more premium tech and on-road comfort. Here are photos from a week-long Morocco desert trip.",
        5, 6, 2, "2025-05-26T14:00:00.000Z",
        JSON.stringify([
            "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800",
            "https://images.unsplash.com/photo-1547245324-d777c6f05e80?w=800"
        ]), 93, 4
    ]
];

const insertPost = db.prepare(`
    INSERT INTO Post (PID, Title, Content, UID, ForumID, ParentPID, Post_Category_id, PublishedAt, ImageUrls, Likes, Dislikes)
    VALUES (?, ?, ?, ?, ?, null, ?, ?, ?, ?, ?)
`);
for (const p of postsData) {
    insertPost.run(p[0], p[1], p[2], p[3], p[4], p[5], adjustDate(p[6] as string), p[7], p[8], p[9]);
}

// --- Comments & Heated Debate Chains ---
const commentsData = [
    // Thread on M3 comparison (Post 1) - HEATED CHASSIS DEBATE
    [1, "I've owned both as well and couldn't agree more. The E46 S54 engine feels organic, but the E92 S65 V8 intake noise at 8k RPM is intoxicating. It's a tough choice.", 2, 1, null, "2025-02-01T10:30:00.000Z", 15, 0],
    [2, "E46 is definitely the classic M benchmark, but the subframe cracks are a nightmare if you don't reinforce them. E92 is more reliable daily.", 3, 1, null, "2025-02-01T11:00:00.000Z", 8, 1],
    [3, "Agreed on the subframe. That's why I reinforced mine first thing. But on a twisty canyon road, the E46 is unmatched in driver feedback.", 1, 1, 2, "2025-02-01T11:15:00.000Z", 12, 0],
    [4, "Don't forget rod bearings and throttle actuators on the E92 though! Every legendary engine has its taxes.", 7, 1, 2, "2025-02-01T12:00:00.000Z", 24, 0],
    [5, "Exactly, the 'rod bearing tax' is real. But once they are done, that V8 is solid.", 3, 1, 4, "2025-02-01T12:30:00.000Z", 9, 0],
    [81, "Hot take: The E92 isn't a real M car. It's too heavy and bloated, basically a German muscle car, not a sports car.", 15, 1, 1, "2025-02-01T13:00:00.000Z", 2, 8],
    [82, "Bloated? It has carbon roof and aluminum suspension. Plus S65 is lighter than the cast-iron block S54. Get your facts straight.", 1, 1, 81, "2025-02-01T13:15:00.000Z", 14, 0],
    [83, "Lighter engine maybe, but the overall chassis weighs 3,650 lbs. E46 is 3,400 lbs. That V8 belongs in a Mustang, not a 3-series.", 15, 1, 82, "2025-02-01T13:30:00.000Z", 1, 9],
    [84, "Have you ever driven an E92 at 8,300 RPM on a track? It shrinks around you. Calling it a Mustang is pure ignorance.", 2, 1, 83, "2025-02-01T13:45:00.000Z", 18, 0],
    [85, "Totally agree. The steering feedback is slightly dampened compared to E46, but calling it a muscle car is ridiculous. It handles beautifully.", 11, 1, 84, "2025-02-01T14:00:00.000Z", 11, 1],

    // Thread on M2 CS (Post 2)
    [6, "Hawk DCT70s are extremely aggressive and will chew through your stock rotors on track. Pagid RS29 is a safer endurance pad.", 2, 2, null, "2025-02-05T15:00:00.000Z", 14, 0],
    [7, "Cup 2s are great, but make sure to monitor tire pressures. They get greasy if they go above 34 psi hot.", 1, 2, null, "2025-02-05T15:30:00.000Z", 10, 0],
    [8, "Yes! Pagids are much better for Laguna. Cup 2s can handle about 4-5 heat cycles before dropoff.", 2, 2, 6, "2025-02-05T16:00:00.000Z", 5, 0],

    // Thread on M5 Weight (Post 3) - HEATED HYBRID/WEIGHT ARGUMENT
    [9, "5,300 lbs is heavier than a Tesla Model S Plaid! That is not an M car anymore, it's a luxury train.", 3, 3, null, "2025-02-10T10:00:00.000Z", 34, 2],
    [10, "Unfortunately, emissions regulations require hybridization. The battery and electric motor add 1,000 lbs. They had no choice.", 4, 3, null, "2025-02-10T10:15:00.000Z", 16, 8],
    [11, "They did have a choice — they could have kept the weight down by keeping it pure ICE. Porsche did it with the 911 GTS.", 1, 3, 10, "2025-02-10T10:30:00.000Z", 29, 1],
    [86, "Pure ICE wouldn't meet Euro 7 compliance at high volume. M5 needs to sell in thousands. Don't blame BMW, blame EU politicians.", 4, 3, 11, "2025-02-10T11:00:00.000Z", 12, 15],
    [87, "I don't care about politics. 5,300 lbs destroys brake pads, tires, and suspension. It is a joke. Real enthusiasts will buy Porsche or AMG instead.", 3, 3, 86, "2025-02-10T11:30:00.000Z", 22, 2],
    [88, "You think AMG is better? The new C63 AMG has a 4-cylinder hybrid! It is even worse than a V8 hybrid M5. The whole industry is compromised.", 9, 3, 87, "2025-02-10T12:00:00.000Z", 31, 0],
    [89, "Agreed. The 4-cylinder AMG is dead on arrival. But at least Porsche's hybrid system only adds 100 lbs on the new GTS. BMW went the cheap route.", 11, 3, 88, "2025-02-10T12:30:00.000Z", 19, 1],
    [90, "Exactly! Porsche's T-Hybrid is a performance hybrid. BMW's setup is just a heavy PHEV commuter block slapped into an M car.", 1, 3, 89, "2025-02-10T13:00:00.000Z", 25, 0],

    // Thread on AMG V8 Tribute (Post 5)
    [12, "Best NA V8 ever made. Period. The cold start exhaust flap mod is a must-have for the W204.", 3, 5, null, "2025-02-15T11:30:00.000Z", 41, 0],
    [13, "I daily a C63 Edition 507. Every gas station visit is painful but the sound makes up for it 100 times.", 7, 5, null, "2025-02-15T12:00:00.000Z", 28, 1],
    [14, "Drop a link to your exhaust setup! Are you running headers?", 1, 5, 12, "2025-02-15T12:15:00.000Z", 9, 0],

    // Thread on AMG GT R Pro (Post 6)
    [15, "The suspension adjustability on the Pro is amazing. Did you change the factory rebound settings?", 2, 6, null, "2025-02-18T17:15:00.000Z", 12, 0],
    [16, "Yes, softened the front rebound by 2 clicks for better compliance on track bumps. Made a huge difference.", 2, 6, 15, "2025-02-18T18:00:00.000Z", 8, 0],

    // Thread on Audi RS6 Wagon (Post 8)
    [17, "My dream daily. RS6 Avant in Nardo Grey with black optic package. It's the ultimate 'one-car solution'.", 8, 8, null, "2025-02-22T12:30:00.000Z", 55, 0],
    [18, "Only problem is the price tag. At 130k$ start, it is out of reach for most enthusiasts. Hopefully, depreciation hits it hard.", 9, 8, null, "2025-02-22T13:00:00.000Z", 21, 1],
    [19, "Depreciation is quite slow on wagons because they have a cult following. Better to lease or look for a used E63 wagon.", 3, 8, 18, "2025-02-22T13:30:00.000Z", 15, 0],

    // Thread on F1 Regulations (Post 11)
    [20, "I'm excited for smaller cars. The current F1 cars are as long as large SUVs and look ridiculous in Monaco.", 2, 11, null, "2025-03-01T09:30:00.000Z", 38, 0],
    [21, "Active aero sounds like a gimmick. DRS is okay, but moving wings in corners could cause massive accidents if it fails.", 2, 11, null, "2025-03-01T10:00:00.000Z", 19, 4],

    // Thread on track budget (Post 14)
    [22, "Miata is always the answer. Cheap parts, low tire wear, and you learn momentum driving. E36 is a money pit on track.", 15, 14, null, "2025-03-08T12:30:00.000Z", 27, 0],
    [23, "E36 is indeed more expensive, but the inline-six sound and drifting capability make it much more fun.", 7, 14, null, "2025-03-08T13:00:00.000Z", 18, 2],
    [24, "If you go E36, buy a 325i or 328i and prepare to spend another 5k on cooling system refreshes and suspension bushings.", 1, 14, 23, "2025-03-08T13:30:00.000Z", 11, 0],

    // Thread on Land Cruiser 80 series (Post 17)
    [25, "Excellent choice. FZJ80 is bulletproof. Make sure to check the head gasket and front axle seals before lifting it.", 5, 17, null, "2025-03-14T09:30:00.000Z", 33, 0],
    [26, "Cannot wait to see the bumper installation! Are you going with a sleeper drawer system in the rear?", 6, 17, null, "2025-03-14T10:00:00.000Z", 15, 0],
    [27, "Yes, DIY drawers are planned using birch plywood and heavy duty slides. Photos coming next week!", 5, 17, 26, "2025-03-14T10:30:00.000Z", 22, 0],

    // Thread on RX7 FD rotary rebuild (Post 20)
    [28, "Rotary FD RX7 is beautiful. A street port 13B with a single turbo will sound amazing. Good luck with the build!", 7, 20, null, "2025-03-20T09:30:00.000Z", 54, 0],
    [29, "Keep the apex seals apex! Ensure you premix 2-stroke oil in every tank to keep the seals lubricated.", 7, 20, null, "2025-03-20T10:00:00.000Z", 42, 1],

    // Thread on EV Battery LFP (Post 23)
    [30, "LFP batteries are perfect for daily drivers. Not having to worry about leaving it plugged in at 100% is great.", 4, 23, null, "2025-03-26T09:30:00.000Z", 26, 0],
    [31, "NCA is still better for cold climates though. LFP charging speed drops drastically when it's below freezing.", 4, 23, null, "2025-03-26T10:00:00.000Z", 18, 3],

    // Thread on Porsche 992 GT3 RS (Post 25)
    [32, "The DRS is activated by the blue button on the steering wheel, right? How does it feel down the Döttinger Höhe?", 2, 25, null, "2025-04-01T10:30:00.000Z", 31, 0],
    [33, "Unbelievable. It drops drag instantly and you can feel the car surge forward. The stability is rock solid.", 11, 25, 32, "2025-04-01T11:00:00.000Z", 25, 0],
    [34, "I'm jealous! Best track car ever built, no debate.", 15, 25, null, "2025-04-01T12:00:00.000Z", 14, 0],

    // Thread on 993 Turbo maintenance (Post 26)
    [35, "Excellent guide! The distributor belt is indeed a silent killer on these air-cooled cars.", 11, 26, null, "2025-04-03T12:00:00.000Z", 19, 0],
    [36, "Agreed. If it snaps, you lose cooling to the secondary distributor and detonate cylinders. Check it every 30k miles.", 6, 26, 35, "2025-04-03T12:30:00.000Z", 22, 0],

    // Thread on R34 restoration (Post 28)
    [37, "Midnight Purple III or II? MPIII shifts colors under sunlight like nothing else.", 12, 28, null, "2025-04-07T09:30:00.000Z", 45, 0],
    [38, "This one is MPII. MPIII is extremely rare! But MPII is still gorgeous.", 12, 28, 37, "2025-04-07T10:00:00.000Z", 34, 0],
    [39, "Subscribed! Cannot wait to see the paint correction results.", 13, 28, null, "2025-04-07T11:00:00.000Z", 12, 0],

    // Thread on Supra 2JZ build (Post 29)
    [40, "Go with dual Walbro 450s in-tank. Safe, reliable, and plenty of flow for 800 hp on E85.", 7, 29, null, "2025-04-10T12:30:00.000Z", 28, 0],
    [41, "Don't forget the fuel hanger upgrade. Radium engineering makes a great triple pump hanger.", 7, 29, 40, "2025-04-10T13:00:00.000Z", 19, 0],

    // Thread on garage tools (Post 31)
    [42, "Highly recommend a good torque wrench. Tightening lug nuts by feel is a recipe for warped rotors.", 1, 31, null, "2025-04-14T09:30:00.000Z", 38, 0],
    [43, "Also, a solid set of jack stands. Never rely on the hydraulic jack alone when getting under the vehicle.", 11, 31, null, "2025-04-14T10:00:00.000Z", 45, 0],
    [44, "ESPECIALLY jack stands. Safety first, guys.", 15, 31, 43, "2025-04-14T10:15:00.000Z", 28, 0],

    // Thread on golden hour photography (Post 34)
    [45, "CPL is absolutely mandatory. Otherwise, the windshield glare ruins the shot. Nice work!", 13, 34, null, "2025-04-20T17:30:00.000Z", 21, 0],
    [46, "Thanks! It makes a massive difference in color saturation too.", 12, 34, 45, "2025-04-20T18:00:00.000Z", 15, 0],

    // Thread on Cayman 987.2 checklist (Post 37)
    [47, "Mileage under 80k is usually fine as long as there is oil analysis history. Watch out for bore scoring on early 2.9L engines.", 9, 37, null, "2025-04-26T13:00:00.000Z", 14, 0],
    [48, "Actually, the 987.2 2.9L uses the newer 9A1 engine architecture, which doesn't suffer from bore scoring like the old M97.", 11, 37, 47, "2025-04-26T13:30:00.000Z", 29, 0],

    // Thread on ceramic coating (Post 39)
    [49, "DIY ceramic coating is all about the prep. If you don't polish out the swirls first, you seal them in forever.", 13, 39, null, "2025-05-01T10:30:00.000Z", 33, 0],
    [50, "Spot on. Paint correction took me 12 hours before I even touched the ceramic bottle.", 13, 39, 49, "2025-05-01T11:00:00.000Z", 18, 0],

    // Thread on Taycan vs Model S (Post 40)
    [51, "Taycan for the driving dynamics. It feels like a real Porsche. The Tesla is fast but feels like an appliance.", 11, 40, null, "2025-05-03T11:30:00.000Z", 56, 3],
    [52, "Plaid for the charging network and software. Road trips in a Taycan can be a headache due to charging reliability.", 4, 40, null, "2025-05-03T12:00:00.000Z", 22, 12],

    // Thread on Honda S2000 VTEC (Post 42)
    [53, "Ohlins DFV coilovers are the absolute best choice for the S2000. Transforms the ride quality completely.", 15, 42, null, "2025-05-08T08:30:00.000Z", 42, 0],
    [54, "Engaging VTEC with a Spoon exhaust must sound insane. Post a video flyby!", 7, 42, null, "2025-05-08T09:00:00.000Z", 28, 0],

    // Thread on Monaco GP (Post 36) - HEATED F1 HISTORY VS BORING Sunday ARGUMENT
    [55, "Keep it. F1 without Monaco is not F1. Qualifying there is the ultimate test of driver skill.", 2, 36, null, "2025-04-24T09:30:00.000Z", 61, 8],
    [56, "Qualifying is great, but the race is incredibly boring. Maybe they should change the layout to allow DRS straights.", 9, 36, null, "2025-04-24T10:00:00.000Z", 18, 14],
    [91, "Qualifying is the greatest spectacle in motorsport. Sunday is just a bonus.", 2, 36, 56, "2025-04-24T10:15:00.000Z", 34, 0],
    [92, "A bonus? Sunday is supposed to be a RACE. In Monaco it is a 78-lap train. If you qualify P1 and don't make a mistake in pit stop, you win. It is a glorified parade.", 9, 36, 91, "2025-04-24T10:30:00.000Z", 41, 1],
    [93, "In sim racing it's impossible to pass there too. The streets are too narrow for 2-meter wide hybrid giants. If F1 wants racing, they need to resize the cars or drop Monaco.", 14, 36, 92, "2025-04-24T10:45:00.000Z", 19, 0],
    [94, "Dropping Monaco ruins the history. Real drivers love the challenge of hitting the barrier by centimeters. It separates the legends from the pay drivers.", 2, 36, 93, "2025-04-24T11:00:00.000Z", 28, 2],
    [95, "History doesn't make up for zero track action. Even SPA or Monza have history and actually allow overtakes. Monaco is obsolete.", 9, 36, 94, "2025-04-24T11:15:00.000Z", 35, 1],

    // Thread on tire pressure (Post 46)
    [57, "15 PSI is perfect for most offroad trails. Just avoid high speed sharp turns so you don't roll the tire off the wheel.", 5, 46, null, "2025-05-16T11:30:00.000Z", 25, 0],
    [58, "If you go below 12 PSI, you definitely need beadlocks. Otherwise, it is a matter of when, not if.", 5, 46, 57, "2025-05-16T12:00:00.000Z", 19, 0],

    // Thread on coilovers vs bags (Post 47) - HEATED PERFORMANCE VS STANCE DEBATE
    [59, "Coilovers for life. Air bags leak, add weight, and ruin the steering response on track.", 7, 47, null, "2025-05-18T14:30:00.000Z", 34, 1],
    [60, "Modern air suspension has come a long way. Look at the GT3 Cup cars or AMG touring builds, some use advanced air setups.", 3, 47, null, "2025-05-18T15:00:00.000Z", 12, 19],
    [96, "Bags are for parking, coilovers are for driving. No self-respecting track driver runs air bags.", 15, 47, 59, "2025-05-18T15:30:00.000Z", 29, 2],
    [97, "You're living in 2010. Air Lift Performance kits can match baseline coilovers on track easily now, and you can lift to clear speedbumps.", 7, 47, 96, "2025-05-18T16:00:00.000Z", 18, 11],
    [98, "Tell that to a set of Ohlins DFVs. Bags leak, compressor adds 30 lbs in the trunk, and lines can pop. For a pure track car, bags are a joke.", 15, 47, 97, "2025-05-18T16:30:00.000Z", 33, 0],
    [99, "For a PURE track car, yes. But for a dual-duty daily street car, not scraping on every single driveway is worth the 30 lbs penalty. Compromise is key.", 7, 47, 98, "2025-05-18T17:00:00.000Z", 22, 1],
    [100, "If you compromise on suspension, you compromise the soul of the car. Fitment over function is stance boy logic, not driver logic.", 15, 47, 99, "2025-05-18T17:30:00.000Z", 27, 4],

    // Thread on Taycan Taycan Taycan
    [61, "Tesla Plaid is just straight line speed. Taycan can actually take a corner at speed.", 1, 40, null, "2025-05-03T12:30:00.000Z", 18, 2],

    // Thread on Misfires (Post 32)
    [62, "Usually it's just ignition coils on modern cars. If you swap the coil to another cylinder and the misfire code moves, there's your answer.", 11, 32, null, "2025-04-16T11:30:00.000Z", 29, 0],
    [63, "Exactly. Classic troubleshooting step that saves you 100$ in diagnostics fees.", 1, 32, 62, "2025-04-16T12:00:00.000Z", 18, 0],

    // Thread on Jack points (Post 33)
    [64, "Highly recommend getting some jack pads. They fit into the pinch weld slots and prevent bending the metal.", 11, 33, null, "2025-04-18T15:00:00.000Z", 22, 0],

    // Thread on Lightroom (Post 35)
    [65, "Link works! Thanks for the free presets. Going to try these on my RS6 photos tonight.", 8, 35, null, "2025-04-22T10:30:00.000Z", 15, 0],
    [66, "No problem! Let me know if you need to adjust the color grading for cloudy days.", 13, 35, 65, "2025-04-22T11:00:00.000Z", 9, 0],

    // Thread on 959 (Post 41)
    [67, "The 959 is mechanical art. The Paris-Dakar rally version is my favorite.", 11, 41, null, "2025-05-05T09:30:00.000Z", 41, 0],
    [68, "Agreed. It was built for Group B rally before it was cancelled. The tech they crammed in is insane.", 6, 41, 67, "2025-05-05T10:00:00.000Z", 33, 0],

    // Thread on Brake flush (Post 43)
    [69, "Motive Products makes the best power bleeder. Saves so much time compared to the pumping-pedal method.", 15, 43, null, "2025-05-10T15:30:00.000Z", 28, 0],
    [70, "Yes! Best 60$ I ever spent. No need to convince my wife to pump the brakes anymore.", 1, 43, 69, "2025-05-10T16:00:00.000Z", 44, 0],

    // Thread on Rig shots (Post 44)
    [71, "Photoshop content-aware fill makes removing the boom pole incredibly easy nowadays.", 12, 44, null, "2025-05-12T13:30:00.000Z", 19, 0],

    // Thread on Lexus (Post 45)
    [72, "The 2GR-FSE engine is bulletproof. 150k miles is just broken-in for a Lexus. Buy it!", 9, 45, null, "2025-05-14T10:30:00.000Z", 35, 0],
    [73, "Just check the water pump and alternator. Those are the only common parts that wear out around 120k.", 11, 45, 72, "2025-05-14T11:00:00.000Z", 22, 0],

    // Thread on 991.2 GTS (Post 48)
    [74, "GTS is indeed the sweet spot. Sound of the 3.0L twin turbo is a bit muted compared to the GT3, but the torque is great.", 11, 48, null, "2025-05-20T09:30:00.000Z", 38, 0],
    [75, "Get a Sharkwerks center muffler bypass. Brings back that flat-six roar without drone.", 11, 48, 74, "2025-05-20T10:00:00.000Z", 26, 0],

    // Thread on Evo IX (Post 49)
    [76, "Evo IX is a legend. Clean ones are fetching massive money now. Keep it forever!", 12, 49, null, "2025-05-22T13:30:00.000Z", 54, 0],
    [77, "The active center diff is amazing but make sure to service the ACD pump. They love to rust in winter climates.", 7, 49, 76, "2025-05-22T14:00:00.000Z", 31, 0],

    // Thread on Engine Bay Cleaning (Post 50)
    [78, "Never spray high-pressure water directly at the fuse box or ignition coils. Gentle mist only!", 11, 50, null, "2025-05-24T10:30:00.000Z", 38, 0],
    [79, "Yes. Cover them with plastic grocery bags first and use a leaf blower to dry it off immediately.", 13, 50, 78, "2025-05-24T11:00:00.000Z", 29, 0],
    [80, "Used this guide today. My engine bay looks like it just rolled off the assembly line. Thanks!", 1, 50, null, "2025-05-24T15:00:00.000Z", 18, 0],
    // New threads on newly created posts
    [101, "The G80 grille definitely looks better in person than in pictures. The S58 is an absolute beast.", 2, 51, null, "2025-05-24T12:15:00.000Z", 15, 0],
    [102, "Totally agree. The performance makes you forget about the design anyway. Stage 1 tune gets you to 600hp easily.", 7, 51, 101, "2025-05-24T12:30:00.000Z", 8, 0],
    [103, "W204 NA V8 sounds way more raw and mechanical. The W205 has a deep rumble but you can hear the turbos silencing the top end.", 1, 53, null, "2025-05-24T14:15:00.000Z", 12, 1],
    [104, "VAG 2.5 TFSI is one of the greatest engines ever. The sound is unmatched in the hot-hatch segment.", 3, 55, null, "2025-05-24T15:10:00.000Z", 25, 0],
    [105, "Love the Jimny! It's proof that you don't need a massive 100k Land Cruiser to go overlanding.", 5, 61, null, "2025-05-24T18:15:00.000Z", 18, 0],
    [106, "Highland is indeed a massive upgrade in build quality. No more panel gap issues and the suspension is actually comfortable.", 4, 65, null, "2025-05-24T20:15:00.000Z", 14, 1],
    [107, "B16B screaming VTEC at 8,200 RPM is pure automotive therapy. Modern turbo cars are fast but don't give you that engagement.", 15, 70, null, "2025-05-24T22:45:00.000Z", 30, 0],
    [108, "Liqui Moly Leichtlauf is my go-to for my German track cars. Clean Blackstone reports every time.", 11, 71, null, "2025-05-24T23:15:00.000Z", 22, 0],
    [109, "A 1969 Charger is the holy grail of muscle cars. Keep us posted with pictures as you progress!", 6, 75, null, "2025-05-25T01:15:00.000Z", 41, 0],
    [110, "8020 aluminum profile is the only way to go. Zero flex even with a 25Nm direct-drive wheelbase.", 14, 78, null, "2025-05-25T02:45:00.000Z", 19, 0],
    [111, "Mustang restomods are beautiful if done right. A modern suspension makes them actually handle corners.", 6, 76, null, "2025-05-25T01:45:00.000Z", 14, 2],
    [112, "LS swaps are cheap power, but they ruin the soul of vintage Mustangs/Chargers. Keep it brand loyal!", 3, 77, null, "2025-05-25T02:15:00.000Z", 21, 5],
    [113, "iRacing has the best online competitive structure, but Assetto Corsa has the best mods and cruising servers.", 14, 79, null, "2025-05-25T03:15:00.000Z", 12, 0],
    [114, "Quest 3 is the sweet spot for VR. Great lenses and easy setup, though Pimax has better FOV if you have the budget.", 14, 80, null, "2025-05-25T03:45:00.000Z", 9, 0],

    // Post 4 - Air-cooled flat-six swap into BMW 2002
    [115, "Sacrilege or not, a flat-six 2002 would be an absolute canyon weapon. The weight shifts slightly rearward which could actually help balance.", 6, 4, null, "2025-02-12T16:30:00.000Z", 18, 2],
    [116, "You'd need to fabricate a custom engine mount cradle and a bellhousing adapter. The 901 gearbox could actually fit with some tunnel massaging.", 11, 4, 115, "2025-02-12T17:00:00.000Z", 14, 0],
    [117, "I'd rather do a full original restoration. A 2002tii with the Kugelfischer injection is already a masterpiece. Don't touch it.", 1, 4, null, "2025-02-12T17:30:00.000Z", 21, 3],

    // Post 7 - EQS AMG electric debate
    [118, "Performance without soul is still performance. The EQS 53 does 0-60 in 3.4 seconds. That is faster than any old AMG V8.", 4, 7, null, "2025-02-20T10:30:00.000Z", 12, 9],
    [119, "0-60 times mean nothing if the experience is sterile. An AMG is supposed to assault your senses, not glide silently past them.", 3, 7, 118, "2025-02-20T11:00:00.000Z", 34, 1],
    [120, "AMG should have kept the badge exclusive to combustion cars. The EQS needs its own performance sub-brand.", 9, 7, null, "2025-02-20T11:30:00.000Z", 27, 4],

    // Post 9 - Quattro understeer
    [121, "The torque vectoring rear diff on the RS3 and RS5 completely transforms the handling. No understeer whatsoever when properly set up.", 8, 9, null, "2025-02-24T09:00:00.000Z", 22, 0],
    [122, "Rear sway bar stiffening is the easiest fix. Switching to a 25mm solid unit from the stock hollow bar made my B8 RS5 rotate perfectly.", 7, 9, 121, "2025-02-24T09:30:00.000Z", 18, 0],
    [123, "Also, softer front springs relative to rear helps weight transfer. Don't overlook alignment — increase rear toe-in slightly.", 2, 9, 122, "2025-02-24T10:00:00.000Z", 15, 0],

    // Post 10 - Audi R8 V10 Decennium
    [124, "The R8 V10 will be remembered as the last great naturally aspirated mid-engine supercar from a mainstream brand. Ferrari and Lambo went hybrid. This was the last holdout.", 8, 10, null, "2025-02-26T15:45:00.000Z", 48, 0],
    [125, "I drove the Performante version and the intake sound behind your head at full throttle is once-in-a-lifetime. Nothing electric will ever replace that.", 11, 10, 124, "2025-02-26T16:00:00.000Z", 39, 0],
    [126, "Values are already climbing. Low-mileage Plus variants are up 15% from two years ago. People are waking up to what they're losing.", 6, 10, null, "2025-02-26T16:30:00.000Z", 31, 0],

    // Post 12 - F1 pre-season testing
    [127, "McLaren's top speed gains are significant. They seem to have found something with the floor edge geometry. Watch their Baku pace.", 2, 12, null, "2025-03-03T18:30:00.000Z", 19, 0],
    [128, "Red Bull's tire delta is always misleading at testing. They sandbag fuel loads deliberately. Don't read too much into long-run times.", 14, 12, 127, "2025-03-03T19:00:00.000Z", 25, 2],

    // Post 13 - Hamilton to Ferrari (heated)
    [129, "History shows that when two alpha drivers share a garage, one inevitably gets the upper hand. Hamilton is 7x champion. Leclerc will not accept #2.", 2, 13, null, "2025-03-05T14:45:00.000Z", 52, 0],
    [130, "Ferrari always has a power struggle. Remember Prost vs Mansell? Alonso vs Massa? The board will pick a favourite by mid-season.", 14, 13, 129, "2025-03-05T15:00:00.000Z", 38, 0],
    [131, "Hamilton brings incredible data engineering feedback and sponsorship. Even if he's not fastest, his presence elevates the entire team.", 9, 13, null, "2025-03-05T15:30:00.000Z", 27, 3],
    [132, "Leclerc has been waiting his entire career for this moment. He won't let Hamilton walk into his team and take over quietly.", 2, 13, 131, "2025-03-05T16:00:00.000Z", 44, 1],

    // Post 15 - Porsche Macan reliability
    [133, "2018 Macan S is the sweet spot year. The PDK had a software update that resolved most early shift-hunting issues. Buy it.", 11, 15, null, "2025-03-10T11:00:00.000Z", 31, 0],
    [134, "Avoid the base 2.0T if you want longevity. The V6 S engine is more robust under load and maintenance costs are comparable.", 9, 15, 133, "2025-03-10T11:30:00.000Z", 24, 0],
    [135, "Annual Porsche OPC service is around $800-1200 depending on mileage interval. Budget 10-15% of car value per year for maintenance.", 1, 15, null, "2025-03-10T12:00:00.000Z", 19, 1],

    // Post 16 - Civic Type R vs Golf R (heated)
    [136, "Type R FL5 has the best steering feel in the hot hatch segment, period. The Golf R is more refined but feels distant and clinical.", 15, 16, null, "2025-03-12T09:30:00.000Z", 37, 2],
    [137, "Golf R wins on versatility. AWD in winter, comfortable on long trips, and the Akrapovic exhaust option sounds incredible.", 8, 16, 136, "2025-03-12T10:00:00.000Z", 28, 3],
    [138, "The Type R's rev-match downshift function is a masterclass in engineering. Makes you feel like a better driver than you are.", 15, 16, null, "2025-03-12T10:30:00.000Z", 22, 0],
    [139, "If you live in a snowy region the Golf R is the obvious answer. FWD Type R in the snow is genuinely dangerous.", 3, 16, 138, "2025-03-12T11:00:00.000Z", 33, 1],

    // Post 18 - Rooftop tents vs ground tents
    [140, "Rooftop tents completely changed overlanding for me. No more tent stakes in rocky terrain, and the mattress comfort is unmatched.", 5, 18, null, "2025-03-16T11:30:00.000Z", 28, 0],
    [141, "The fuel economy hit is real though. My Land Cruiser drops about 3 MPG with a roof tent mounted even when folded.", 5, 18, 140, "2025-03-16T12:00:00.000Z", 21, 0],

    // Post 19 - Recovery gear
    [142, "A kinetic recovery rope is essential for solo trips. A winch is useless without an anchor when you're alone. Rope first.", 5, 19, null, "2025-03-18T16:00:00.000Z", 35, 0],
    [143, "Pair the rope with a MaxTrax and a Hi-Lift jack. That trio covers 90% of solo recovery situations without needing another vehicle.", 6, 19, 142, "2025-03-18T16:30:00.000Z", 29, 0],

    // Post 21 - Wheel offsets
    [144, "Great guide! The scrub radius change with negative offset spacers is something most people ignore until their steering wanders.", 7, 21, null, "2025-03-22T13:30:00.000Z", 24, 0],
    [145, "One thing to add: wider wheels increase rotational inertia. A 10mm wider rim is measurably slower to accelerate. Lightweight wheels matter.", 13, 21, 144, "2025-03-22T14:00:00.000Z", 19, 0],

    // Post 22 - Audi RS3 wrap
    [146, "DIY wraps look amazing if you have patience. Did you use a heat gun on the door edges or just stretch the vinyl?", 13, 22, null, "2025-03-24T16:45:00.000Z", 17, 0],
    [147, "Both. Heat gun at around 60°C on curves, gentle stretch on flat panels. The hood took me four attempts to get right.", 8, 22, 146, "2025-03-24T17:15:00.000Z", 22, 0],

    // Post 24 - Road trip non-Tesla EV
    [148, "CCS reliability has improved in the last year, but you're right that dead chargers still happen regularly. Always plan a backup station.", 4, 24, null, "2025-03-28T11:00:00.000Z", 28, 0],
    [149, "This is exactly why Tesla's Supercharger network is worth paying a premium for. 99.9% uptime versus 70-80% for third-party CCS.", 1, 24, 148, "2025-03-28T11:30:00.000Z", 19, 6],
    [150, "Ioniq 5 with NACS adapter is the ideal setup right now. Best non-Tesla EV for road trips on any budget.", 4, 24, 149, "2025-03-28T12:00:00.000Z", 24, 1],

    // Post 27 - Cayman GT4 RS vs 911
    [151, "Mid-engine balance is fundamentally superior for circuit driving. The GT4 RS has the engine where it belongs, unlike the tail-heavy 911.", 2, 27, null, "2025-04-05T14:30:00.000Z", 29, 4],
    [152, "The 911's rear weight bias is its advantage in traction out of slow corners though. Mid vs rear engine is the oldest Porsche debate.", 11, 27, 151, "2025-04-05T15:00:00.000Z", 38, 0],
    [153, "Drove both back to back at Spa. The GT4 RS is more pointy but less forgiving. The 911 GTS is easier to drive fast consistently.", 6, 27, null, "2025-04-05T15:30:00.000Z", 22, 0],

    // Post 30 - MX-5 NA weight reduction
    [154, "Weight reduction is the most underrated mod. You feel every kilogram removed. An MX-5 NA below 2,000 lbs must be incredible.", 7, 30, null, "2025-04-12T16:00:00.000Z", 26, 0],
    [155, "Running a similar setup. Removed the spare tire too and replaced with a plug kit. Another 25 lbs gone for free.", 15, 30, 154, "2025-04-12T16:30:00.000Z", 19, 0],

    // Post 38 - Wrangler vs Bronco (debate)
    [156, "Solid axle on the Jeep is the key differentiator for serious rock crawling. The Bronco's IFS is better on highway but hits limits on technical trails.", 5, 38, null, "2025-04-28T14:30:00.000Z", 41, 0],
    [157, "Bronco's modular bumpers and Ford parts availability are a huge advantage for overlanders who don't want to source custom parts.", 6, 38, 156, "2025-04-28T15:00:00.000Z", 27, 2],
    [158, "Jeep has 25 years of Rubicon aftermarket support vs 3 years of Bronco parts. No contest for serious builds.", 5, 38, 157, "2025-04-28T15:30:00.000Z", 33, 1],

    // Post 52 - E46 subframe reinforcement
    [159, "Essential repair for any track-driven E46. The factory welds are undersized for sustained lateral loads. Do it before it becomes an emergency.", 1, 52, null, "2025-05-24T13:15:00.000Z", 28, 0],
    [160, "Superpro reinforcement plates welded by a certified welder, sprayed with rubberized undercoating. Job done right lasts forever.", 7, 52, 159, "2025-05-24T13:30:00.000Z", 22, 0],

    // Post 54 - AMG ONE hypercar
    [161, "The idle emissions issues during development were legendary, but they solved it. An F1 engine that passes road legal emissions is a genuine engineering miracle.", 2, 54, null, "2025-05-24T14:45:00.000Z", 34, 0],
    [162, "275 km/h top speed in road trim and it corners completely flat. I'd rather have one of those than any LaFerrari.", 3, 54, 161, "2025-05-24T15:00:00.000Z", 41, 0],

    // Post 56 - Ur-Quattro restoration
    [163, "The early 10V WR engine parts are basically unobtanium. Your best bet is the Audi Heritage network in Germany or specialist breakers in the UK.", 6, 56, null, "2025-05-24T15:45:00.000Z", 19, 0],
    [164, "Check with Classic Audi parts suppliers in Stuttgart. They sometimes have new-old-stock body panels from dealer surplus.", 8, 56, 163, "2025-05-24T16:00:00.000Z", 14, 0],

    // Post 57 - F1 2026 engine rules
    [165, "Tripling electric power while dropping the MGU-H is a brave choice. The energy harvest zones will define strategy more than ever.", 2, 57, null, "2025-05-24T16:15:00.000Z", 22, 0],
    [166, "The concern is overtake button abuse. If every car has a massive electric overtake mode, DRS becomes redundant and racing gets artificial.", 14, 57, 165, "2025-05-24T16:30:00.000Z", 17, 3],

    // Post 58 - Top 10 F1 liveries
    [167, "Jordan 191 is the correct answer. Camel yellow on a debut car at Spa. Nothing before or since has had that energy.", 14, 58, null, "2025-05-24T16:45:00.000Z", 43, 0],
    [168, "JPS Lotus is the most iconic. Simple, elegant, absolutely sinister in black and gold. It defined an entire era of F1.", 2, 58, 167, "2025-05-24T17:00:00.000Z", 35, 2],
    [169, "Underrated: the Rothmans Williams FW11. Blue, white, and red with that gold swoosh. It looks modern even today.", 9, 58, null, "2025-05-24T17:15:00.000Z", 27, 0],

    // Post 59 - High mileage Cayman 987
    [170, "IMS without retrofit at 120k miles is a calculated gamble. Get a pre-purchase inspection by an independent Porsche specialist, not a dealer.", 11, 59, null, "2025-05-24T17:15:00.000Z", 38, 0],
    [171, "Budget 3,000-4,000 for an immediate IMS Pro retrofit plus RMS seal and coolant refresh. Factor that into your offer price.", 9, 59, 170, "2025-05-24T17:30:00.000Z", 32, 0],

    // Post 60 - Winter daily driver
    [172, "Subaru Impreza with winter tires outperforms any AWD crossover in real winter conditions. The symmetrical AWD and low center of gravity are unbeatable.", 5, 60, null, "2025-05-24T17:45:00.000Z", 28, 0],
    [173, "Rust is the Achilles heel of the Impreza. Spray the undercarriage with Fluid Film every autumn and it will last 20 years.", 9, 60, 172, "2025-05-24T18:00:00.000Z", 21, 0],

    // Post 62 - MaxTrax vs alternatives
    [174, "The cheap boards snap when you bury the front diff and get aggressive. MaxTrax are expensive but they flex and grip instead of breaking.", 5, 62, null, "2025-05-24T18:45:00.000Z", 31, 0],
    [175, "TRED Pro boards are a credible alternative at half the price. Still way better than the $80 versions from Amazon.", 6, 62, 174, "2025-05-24T19:00:00.000Z", 24, 1],

    // Post 63 - Stage 2 VAG TSI
    [176, "Don't forget upgraded motor mounts. Stage 2 torque will destroy the stock rubber mounts within 10,000 miles. Solid or poly inserts are mandatory.", 7, 63, null, "2025-05-24T19:15:00.000Z", 27, 0],
    [177, "Clutch rating is the number one concern on Stage 2. A standard Sachs plate will slip at the first aggressive launch above 350 lb-ft.", 8, 63, 176, "2025-05-24T19:30:00.000Z", 23, 0],

    // Post 64 - Tein vs BC coilovers
    [178, "BC Racing are a strong budget choice for daily driving but spring rates are soft for track use. You'll bottom out mid-corner on bumpy circuits.", 7, 64, null, "2025-05-24T19:45:00.000Z", 19, 0],
    [179, "Tein Flex Z has better damper adjustment range in my experience. The rebound click is more linear and easier to fine-tune.", 15, 64, 178, "2025-05-24T20:00:00.000Z", 16, 0],

    // Post 66 - Solid state batteries
    [180, "Toyota's solid state timeline has slipped three times already. The manufacturing yield rate is still below commercial viability. 2028 is more realistic.", 4, 66, null, "2025-05-24T20:45:00.000Z", 33, 0],
    [181, "Even if production is 2027, real-world durability data won't exist until 2030+. Early adopter risk on solid state is enormous.", 9, 66, 180, "2025-05-24T21:00:00.000Z", 26, 0],

    // Post 67 - Porsche 996 undervalued
    [182, "The 996.2 post-2002 facelift fixed most IMS issues with an upgraded bearing. It is genuinely the best value entry into 911 ownership right now.", 11, 67, null, "2025-05-24T21:15:00.000Z", 44, 0],
    [183, "IMS and bore scoring are manageable with a pre-purchase inspection and proactive preventive work. A properly maintained 3.4L Carrera is bulletproof.", 6, 67, 182, "2025-05-24T21:30:00.000Z", 33, 0],

    // Post 68 - Porsche 928 restoration
    [184, "The 928's wiring harness insulation hardens and cracks at this age. A full harness replacement is often the only permanent cure for phantom electrical gremlins.", 6, 68, null, "2025-05-24T21:45:00.000Z", 22, 0],
    [185, "The GTS engine is spectacular when it's healthy though. A sorted 928 is one of the finest grand touring experiences from that era.", 11, 68, 184, "2025-05-24T22:00:00.000Z", 18, 0],

    // Post 69 - WRX STI EJ25 safety
    [186, "The cylinder 4 cooling mod is absolutely worth the effort. Drilling the coolant passage takes 30 minutes and could save your entire engine.", 12, 69, null, "2025-05-24T22:15:00.000Z", 36, 0],
    [187, "Add an aftermarket oil cooler and an AOS air-oil separator at the same time. Crankcase pressure is the silent killer on the EJ25.", 7, 69, 186, "2025-05-24T22:30:00.000Z", 30, 0],

    // Post 72 - Stripped thread repair
    [188, "Time-Sert is unquestionably better for critical threads like spark plugs or head bolts. Heli-Coil works for non-critical fasteners but can unthread under vibration.", 11, 72, null, "2025-05-25T00:00:00.000Z", 28, 0],
    [189, "Loctite thread repair kits are another option for very shallow stripped holes. Not as strong but no drilling required.", 1, 72, 188, "2025-05-25T00:15:00.000Z", 15, 0],

    // Post 73 - Panning shots tutorial
    [190, "1/30s to 1/60s is the sweet spot for most cars. Go slower for classic cars at shows, faster for highway action shots.", 12, 73, null, "2025-05-25T00:15:00.000Z", 31, 0],
    [191, "Use continuous AF tracking, not single point. A mirrorless camera with subject tracking is a massive advantage for panning.", 13, 73, 190, "2025-05-25T00:30:00.000Z", 24, 0],

    // Post 74 - Best lenses car shows
    [192, "85mm f/1.8 is the queen of car show photography. Beautiful compression, creamy background blur, and sharp enough to read brake caliper logos.", 12, 74, null, "2025-05-25T00:45:00.000Z", 37, 0],
    [193, "35mm is more flexible in tight indoor spaces. A compact 35mm f/2 on a mirrorless is the most versatile option for crowded show floors.", 13, 74, 192, "2025-05-25T01:00:00.000Z", 28, 1],
    [194, "Don't sleep on the 70-200mm f/2.8. It lets you compress perspective from a distance and isolate cars without disturbing the scene.", 8, 74, null, "2025-05-25T01:15:00.000Z", 22, 0],

    // Post 1 - BMW M3 debate extra
    [195, "The real answer is the CSL. If you want to talk about the true M3 benchmark, it starts and ends with the E46 CSL. 1,385 kg and the most refined S54 ever built.", 11, 1, null, "2025-02-02T09:00:00.000Z", 52, 0],
    [196, "CSL is a collector piece, not a daily driver comparison. We're talking standard M3s here. But yes, CSL is the undisputed pinnacle of that generation.", 1, 1, 195, "2025-02-02T09:30:00.000Z", 33, 0],

    // Post 5 - AMG V8 tribute extra
    [197, "M156 in the SLS is the best version of that engine. The dry-sump setup lets you take corners at sustained high g without oil starvation.", 2, 5, null, "2025-02-15T13:00:00.000Z", 29, 0],
    [198, "SLS AMG with Meisterschaft exhaust is one of the best sounds ever recorded in an automotive context. Full stop.", 3, 5, 197, "2025-02-15T13:30:00.000Z", 38, 0],

    // Post 17 - Land Cruiser 80 series extra
    [199, "What color is the FZJ80? White is the most rust-resistant but Freeborn Red or dark green are the most iconic colors for the 80 series.", 6, 17, null, "2025-03-14T11:00:00.000Z", 16, 0],
    [200, "It's the factory dark green. One of the best colors they ever offered on a Land Cruiser. Going to keep it original on the exterior.", 5, 17, 199, "2025-03-14T11:30:00.000Z", 23, 0]
];

const insertComment = db.prepare(`
    INSERT INTO Comment (CID, Content, UID, PID, ParentCID, PublishedAt, Likes, Dislikes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);
for (const c of commentsData) {
    insertComment.run(c[0], c[1], c[2], c[3], c[4], adjustDate(c[5] as string), c[6], c[7]);
}

db.close();

console.log("Rich car community seed inserted successfully!");
console.log("  Categories: 10 categories loaded");
console.log("  Forums: 14 active forums loaded");
console.log("  Users: 15 active profiles loaded (passwords: 'password123', admin: 'admin123')");
console.log("  Subscribers: 58 memberships mapped");
console.log("  Posts: 80 media-rich posts loaded");
console.log("  Comments: 200 detailed replies and sub-threads loaded");
console.log("Total entries in database: ~385+ entries populated.");
