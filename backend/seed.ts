import DatabaseConstructor from "better-sqlite3";
import * as bcrypt from "bcrypt";
import * as path from "path";
import * as fs from "fs";

const dataDir = path.resolve(__dirname, "data");
const dbPath = path.join(dataDir, "carguy.db");

if (!fs.existsSync(dbPath)) {
    console.error("DB nicht gefunden. Starte zuerst den Server einmal, um die Tabellen zu erstellen.");
    process.exit(1);
}

const db = new DatabaseConstructor(dbPath);
db.pragma("foreign_keys = ON");

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
db.prepare("INSERT INTO Forum_Category (Forum_Category_id, Forum_Category_Name) VALUES (?, ?)").run(1, "Marken");
db.prepare("INSERT INTO Forum_Category (Forum_Category_id, Forum_Category_Name) VALUES (?, ?)").run(2, "Motorsport");
db.prepare("INSERT INTO Forum_Category (Forum_Category_id, Forum_Category_Name) VALUES (?, ?)").run(3, "Allgemein");

// --- Post Categories ---
db.prepare("INSERT INTO Post_Category (Post_Category_id, Post_Category_Name) VALUES (?, ?)").run(1, "Diskussion");
db.prepare("INSERT INTO Post_Category (Post_Category_id, Post_Category_Name) VALUES (?, ?)").run(2, "Review");
db.prepare("INSERT INTO Post_Category (Post_Category_id, Post_Category_Name) VALUES (?, ?)").run(3, "News");
db.prepare("INSERT INTO Post_Category (Post_Category_id, Post_Category_Name) VALUES (?, ?)").run(4, "Frage");

// --- Forums (Communities) ---
db.prepare("INSERT INTO Forum (ForumID, Name, Description, ParentForumID, Forum_Category_id, CreatedAt) VALUES (?, ?, ?, ?, ?, ?)").run(1, "BMW", "Alles rund um BMW Fahrzeuge", null, 1, "2025-01-10T10:00:00.000Z");
db.prepare("INSERT INTO Forum (ForumID, Name, Description, ParentForumID, Forum_Category_id, CreatedAt) VALUES (?, ?, ?, ?, ?, ?)").run(2, "Mercedes-Benz", "Die Community für Mercedes Fans", null, 1, "2025-01-10T10:05:00.000Z");
db.prepare("INSERT INTO Forum (ForumID, Name, Description, ParentForumID, Forum_Category_id, CreatedAt) VALUES (?, ?, ?, ?, ?, ?)").run(3, "Audi", "Vorsprung durch Technik – die Audi Community", null, 1, "2025-01-10T10:10:00.000Z");
db.prepare("INSERT INTO Forum (ForumID, Name, Description, ParentForumID, Forum_Category_id, CreatedAt) VALUES (?, ?, ?, ?, ?, ?)").run(4, "Formula 1", "Neuigkeiten und Diskussionen rund um die Formel 1", null, 2, "2025-01-11T08:00:00.000Z");
db.prepare("INSERT INTO Forum (ForumID, Name, Description, ParentForumID, Forum_Category_id, CreatedAt) VALUES (?, ?, ?, ?, ?, ?)").run(5, "Kaufberatung", "Welches Auto passt zu mir?", null, 3, "2025-01-12T09:00:00.000Z");

// --- Users ---
const pw = bcrypt.hashSync("password123", 10);
db.prepare("INSERT INTO User (UID, Username, Password, PublicName, Description, Role, Title, CreatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").run(1, "max_mustermann", pw, "Max M.", "BMW-Fan seit 2010. Aktuell E46 M3.", "user", "Community Veteran", "2025-01-15T12:00:00.000Z");
db.prepare("INSERT INTO User (UID, Username, Password, PublicName, Description, Role, Title, CreatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").run(2, "anna_speed", pw, "Anna Speed", "Motorsportbegeisterte. F1 & GT3.", "user", "Rennfahrerin", "2025-01-16T08:30:00.000Z");
db.prepare("INSERT INTO User (UID, Username, Password, PublicName, Description, Role, Title, CreatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").run(3, "carlo_benz", pw, "Carlo B.", "Mercedes E-Klasse Fahrer. Kaffee & Autobahn.", "user", null, "2025-01-20T14:00:00.000Z");
db.prepare("INSERT INTO User (UID, Username, Password, PublicName, Description, Role, Title, CreatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").run(4, "admin", bcrypt.hashSync("admin123", 10), "Admin", "Plattform-Administrator", "admin", "Admin", "2025-01-10T09:00:00.000Z");

// --- Posts in BMW Forum ---
db.prepare("INSERT INTO Post (PID, Title, Content, UID, ForumID, ParentPID, Post_Category_id, PublishedAt, Likes, Dislikes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run(
    1, "E46 M3 – das beste M Auto aller Zeiten?",
    "Ich fahre seit 5 Jahren einen E46 M3 und bin immer noch begeistert. Der S54 Motor klingt einfach göttlich. Was denkt ihr – ist der E46 M3 das beste M Auto, das BMW je gebaut hat?",
    1, 1, null, 1, "2025-02-01T10:00:00.000Z", 24, 2
);
db.prepare("INSERT INTO Post (PID, Title, Content, UID, ForumID, ParentPID, Post_Category_id, PublishedAt, Likes, Dislikes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run(
    2, "BMW M4 G82 – Langzeiterfahrung nach 30.000 km",
    "Nach 30.000 km mit meinem M4 Competition kann ich ein erstes Fazit ziehen. Motor: brilliant. Fahrwerk: zu hart für den Alltag. Verbrauch: 13L/100km im Schnitt. Wer Fragen hat, gerne stellen!",
    1, 1, null, 2, "2025-02-10T14:30:00.000Z", 41, 3
);
db.prepare("INSERT INTO Post (PID, Title, Content, UID, ForumID, ParentPID, Post_Category_id, PublishedAt, Likes, Dislikes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run(
    3, "Welches Motoröl für den N54?",
    "Hallo Community! Ich habe einen 135i mit N54 und suche das optimale Motoröl. BMW empfiehlt LL-04, aber manche schwören auf Castrol Edge 5W-40. Eure Meinungen?",
    3, 1, null, 4, "2025-02-15T09:15:00.000Z", 8, 0
);

// --- Posts in Mercedes Forum ---
db.prepare("INSERT INTO Post (PID, Title, Content, UID, ForumID, ParentPID, Post_Category_id, PublishedAt, Likes, Dislikes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run(
    4, "AMG C63 S E Performance – lohnt sich der Aufpreis?",
    "Der neue C63 mit Vierzylinder-Hybrid polarisiert. 680 PS sind beeindruckend, aber fehlt der V8-Sound nicht? Ich habe letzte Woche eine Probefahrt gemacht – hier meine Eindrücke.",
    3, 2, null, 2, "2025-03-01T11:00:00.000Z", 19, 7
);
db.prepare("INSERT INTO Post (PID, Title, Content, UID, ForumID, ParentPID, Post_Category_id, PublishedAt, Likes, Dislikes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run(
    5, "E-Klasse W214 – erste Eindrücke",
    "Meine neue E-Klasse W214 ist angekommen! Das Hyperscreen-Display ist beeindruckend, aber die Bedienung braucht etwas Eingewöhnung. Fotos folgen diese Woche.",
    3, 2, null, 3, "2025-03-05T16:45:00.000Z", 33, 1
);

// --- Posts in Formula 1 Forum ---
db.prepare("INSERT INTO Post (PID, Title, Content, UID, ForumID, ParentPID, Post_Category_id, PublishedAt, Likes, Dislikes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run(
    6, "Saison 2025 – wer wird Weltmeister?",
    "Nach den ersten Rennen der Saison 2025: Wer hat die besten Chancen auf den Titel? Mein Tipp: Verstappen wird es wieder machen, aber McLaren macht es ihm diesmal schwerer.",
    2, 4, null, 1, "2025-03-20T18:00:00.000Z", 52, 5
);
db.prepare("INSERT INTO Post (PID, Title, Content, UID, ForumID, ParentPID, Post_Category_id, PublishedAt, Likes, Dislikes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run(
    7, "Neues Technisches Reglement 2026 erklärt",
    "2026 kommt ein komplett neues Reglement. Kleinere Autos, neue Power Units mit mehr Elektroanteil, und aktivere Aerodynamik. Hier erkläre ich die wichtigsten Änderungen.",
    2, 4, null, 3, "2025-03-22T09:00:00.000Z", 87, 2
);

// --- Posts in Kaufberatung Forum ---
db.prepare("INSERT INTO Post (PID, Title, Content, UID, ForumID, ParentPID, Post_Category_id, PublishedAt, Likes, Dislikes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run(
    8, "Budget 30.000€ – Sportwagen oder Alltagsauto?",
    "Ich habe 30.000€ und überlege zwischen einem gebrauchten Porsche Boxster oder einem neuen Golf GTI. Sportwagen-Traum vs. Alltagstauglichkeit. Was würdet ihr empfehlen?",
    1, 5, null, 4, "2025-04-01T12:00:00.000Z", 15, 0
);

// --- Comments ---
db.prepare("INSERT INTO Comment (CID, Content, UID, PID, ParentCID, PublishedAt, Likes, Dislikes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").run(
    1, "Absolut! Der E46 M3 ist zeitlos. Kein modernes M Auto kommt an dieses Feeling heran.", 2, 1, null, "2025-02-01T11:30:00.000Z", 12, 0
);
db.prepare("INSERT INTO Comment (CID, Content, UID, PID, ParentCID, PublishedAt, Likes, Dislikes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").run(
    2, "Ich würde sagen E30 M3, aber der E46 kommt knapp dahinter. Rein emotionale Autos.", 3, 1, null, "2025-02-01T13:00:00.000Z", 8, 1
);
db.prepare("INSERT INTO Comment (CID, Content, UID, PID, ParentCID, PublishedAt, Likes, Dislikes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").run(
    3, "Stimme zu beim E30! Aber der E46 hat den besseren Alltagsmotor.", 1, 1, 2, "2025-02-01T14:00:00.000Z", 5, 0
);
db.prepare("INSERT INTO Comment (CID, Content, UID, PID, ParentCID, PublishedAt, Likes, Dislikes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").run(
    4, "Danke für den ausführlichen Bericht! Wie ist das Getriebe im Alltag?", 2, 2, null, "2025-02-10T15:00:00.000Z", 3, 0
);
db.prepare("INSERT INTO Comment (CID, Content, UID, PID, ParentCID, PublishedAt, Likes, Dislikes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").run(
    5, "Ich nehme immer Motul 8100 X-cess 5W-40 für den N54, sehr gute Erfahrungen.", 2, 3, null, "2025-02-15T10:00:00.000Z", 6, 0
);
db.prepare("INSERT INTO Comment (CID, Content, UID, PID, ParentCID, PublishedAt, Likes, Dislikes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").run(
    6, "Verstappen oder Norris – ich tippe auf ein Zweikampf bis zum letzten Rennen!", 1, 6, null, "2025-03-20T19:00:00.000Z", 21, 2
);

// --- User_In_Forum ---
db.prepare("INSERT INTO User_In_Forum (UID, ForumID) VALUES (?, ?)").run(1, 1);
db.prepare("INSERT INTO User_In_Forum (UID, ForumID) VALUES (?, ?)").run(1, 5);
db.prepare("INSERT INTO User_In_Forum (UID, ForumID) VALUES (?, ?)").run(2, 4);
db.prepare("INSERT INTO User_In_Forum (UID, ForumID) VALUES (?, ?)").run(2, 1);
db.prepare("INSERT INTO User_In_Forum (UID, ForumID) VALUES (?, ?)").run(3, 2);
db.prepare("INSERT INTO User_In_Forum (UID, ForumID) VALUES (?, ?)").run(3, 5);

db.close();

console.log("Testdaten erfolgreich eingefügt!");
console.log("  Communities: BMW, Mercedes-Benz, Audi, Formula 1, Kaufberatung");
console.log("  Posts: 8 Posts in verschiedenen Communities");
console.log("  Comments: 6 Kommentare");
console.log("  User: max_mustermann / anna_speed / carlo_benz (Passwort: password123)");
console.log("        admin (Passwort: admin123)");
