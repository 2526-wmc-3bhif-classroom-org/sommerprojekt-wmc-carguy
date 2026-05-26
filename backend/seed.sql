-- Seed Data for CarGuy Database

-- Clear existing data if necessary (optional, commented out to avoid accidental deletion)
-- DELETE FROM Comment;
-- DELETE FROM Post;
-- DELETE FROM User_In_Forum;
-- DELETE FROM Forum;
-- DELETE FROM Post_Category;
-- DELETE FROM Forum_Category;
-- DELETE FROM User;

BEGIN TRANSACTION;

-- 1. Create Users
-- Passwords would normally be hashed. For sample purposes, assuming plain text or dummy hash.
INSERT OR IGNORE INTO User (UID, Username, Password, PublicName, Description, Role, Title, Image, CreatedAt) VALUES
(1001, 'gearhead_gary', 'hashed_pass', 'Gary M.', 'Love classic muscle cars and restoring old beauties.', 'USER', 'Classic Enthusiast', NULL, '2025-01-10T14:00:00Z'),
(1002, 'jdm_king99', 'hashed_pass', 'Kenji', 'JDM for life. Supra owner.', 'USER', 'Drift King', NULL, '2025-02-15T09:30:00Z'),
(1003, 'euro_tuner', 'hashed_pass', 'Hans', 'BMW M3 E46 is the peak of automotive engineering.', 'USER', 'Euro Spec', NULL, '2025-03-01T11:45:00Z'),
(1004, 'offroad_sarah', 'hashed_pass', 'Sarah J.', 'If there''s no mud, what''s the point?', 'USER', 'Trail Blazer', NULL, '2025-03-20T16:20:00Z'),
(1005, 'turbo_tim', 'hashed_pass', 'Tim T.', 'Boost makes everything better.', 'USER', 'Boost Addict', NULL, '2025-04-05T08:15:00Z');

-- 2. Create Categories
INSERT OR IGNORE INTO Forum_Category (Forum_Category_id, Forum_Category_Name) VALUES
(1001, 'Makes & Models'),
(1002, 'Technical & Repair'),
(1003, 'Motorsports & Events');

INSERT OR IGNORE INTO Post_Category (Post_Category_id, Post_Category_Name) VALUES
(1001, 'Showcase'),
(1002, 'Question'),
(1003, 'Build Thread'),
(1004, 'Discussion');

-- 3. Create Forums
INSERT OR IGNORE INTO Forum (ForumID, Name, Description, ParentForumID, Forum_Category_id, CreatedAt) VALUES
(1001, 'JDM Market', 'Discuss Japanese Domestic Market cars, imports, and tuning.', NULL, 1001, '2025-01-01T10:00:00Z'),
(1002, 'Euro Cars', 'European cars, maintenance, and performance.', NULL, 1001, '2025-01-01T10:00:00Z'),
(1003, 'American Muscle', 'V8s, drag racing, and classic restoration.', NULL, 1001, '2025-01-01T10:00:00Z'),
(1004, 'Engine Tuning', 'ECU mapping, turbo setups, and engine builds.', NULL, 1002, '2025-01-01T10:00:00Z');

-- 4. Assign Users to Forums
INSERT OR IGNORE INTO User_In_Forum (UID, ForumID) VALUES
(1002, 1001), (1005, 1001), -- JDM guys
(1003, 1002), (1005, 1002), -- Euro guys
(1001, 1003), -- Muscle guys
(1005, 1004), (1002, 1004); -- Tuning guys

-- 5. Create Posts
INSERT OR IGNORE INTO Post (PID, Title, Content, UID, ForumID, ParentPID, Post_Category_id, PublishedAt, ImageUrls, Likes, Dislikes) VALUES
-- Showcase: JDM King showing off his Supra
(1001, 'Finally got my dream car! 1994 Supra MKIV', 'Just picked this beauty up yesterday. It''s completely stock for now, but I have big plans. What do you guys think I should upgrade first?', 1002, 1001, NULL, 1001, '2025-05-20T10:00:00Z', '["https://images.unsplash.com/photo-1611859266238-4b98091d9d9b?auto=format&fit=crop&q=80&w=1000"]', 45, 1),

-- Question: Gearhead Gary asking about a carburetor issue
(1002, 'Holley 750 CFM Carb running rich at idle?', 'Hey everyone, I''ve got a 1969 Camaro with a 350 small block. It''s running super rich at idle and fouling the plugs. I''ve adjusted the mixture screws but no luck. Any ideas?', 1001, 1003, NULL, 1002, '2025-05-21T14:30:00Z', NULL, 12, 0),

-- Showcase: Euro Tuner showing his M3
(1003, 'E46 M3 Track Build Progress', 'Fitted the new coilovers and big brake kit this weekend. The stance is absolutely perfect now. Taking it to the Nürburgring next month!', 1003, 1002, NULL, 1003, '2025-05-22T09:15:00Z', '["https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&q=80&w=1000", "https://images.unsplash.com/photo-1616422285623-14ff01621477?auto=format&fit=crop&q=80&w=1000"]', 88, 2),

-- Question: Turbo Tim asking about boost controllers
(1004, 'Manual vs Electronic Boost Controller?', 'I''m putting together a single turbo setup for my RB25DET. Is it worth spending the extra cash on an electronic boost controller, or will a manual one do the job fine?', 1005, 1004, NULL, 1002, '2025-05-23T11:00:00Z', NULL, 15, 0);


-- 6. Create Comments
INSERT OR IGNORE INTO Comment (CID, Content, UID, PID, ParentCID, PublishedAt, ImageUrls, Likes, Dislikes) VALUES
-- Comments on Post 1 (Supra)
(1001, 'Beautiful ride man! Leave it stock, they are getting so rare to find unmolested.', 1001, 1001, NULL, '2025-05-20T10:15:00Z', NULL, 10, 0),
(1002, 'Needs a big single turbo immediately. Get rid of the sequential twins!', 1005, 1001, NULL, '2025-05-20T10:45:00Z', NULL, 22, 5),
(1003, 'I second the single turbo idea. But definitely upgrade the fuel system first.', 1002, 1001, 1002, '2025-05-20T11:00:00Z', NULL, 8, 0),

-- Comments on Post 2 (Carburetor issue)
(1004, 'Have you checked the float levels? Sometimes the needle and seat get some dirt stuck in them and flood the engine.', 1005, 1002, NULL, '2025-05-21T15:00:00Z', NULL, 18, 0),
(1005, 'What''s your fuel pressure at? Holleys don''t like anything over 6-7 psi. Might need a regulator.', 1003, 1002, NULL, '2025-05-21T15:30:00Z', NULL, 14, 0),
(1006, 'Good call on the fuel pressure, I''m running a mechanical pump but I''ll throw a gauge on it to check. Thanks!', 1001, 1002, 1005, '2025-05-21T16:00:00Z', NULL, 5, 0),

-- Comments on Post 3 (M3 Track Build)
(1007, 'That fitment is mint! What wheel specs are you running?', 1002, 1003, NULL, '2025-05-22T10:00:00Z', NULL, 15, 0),
(1008, '18x9.5 square setup with 265/35 tires. Had to roll the fenders slightly to avoid rubbing.', 1003, 1003, 1007, '2025-05-22T10:30:00Z', NULL, 12, 0),
(1009, 'Did you reinforce the rear subframe before putting sticky tires on it?', 1001, 1003, NULL, '2025-05-22T11:15:00Z', NULL, 25, 0),

-- Comments on Post 4 (Boost controller)
(1010, 'Electronic all the way. It gives you so much more control and spool-up is usually faster.', 1003, 1004, NULL, '2025-05-23T11:30:00Z', NULL, 20, 1),
(1011, 'If you are on a budget, an MBC works just fine. But if you have the money, EBC is better.', 1002, 1004, NULL, '2025-05-23T12:00:00Z', NULL, 10, 0);

COMMIT;
