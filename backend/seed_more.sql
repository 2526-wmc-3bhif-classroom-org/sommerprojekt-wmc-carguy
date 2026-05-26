BEGIN TRANSACTION;

-- Add a few more users
INSERT OR IGNORE INTO User (UID, Username, Password, PublicName, Description, Role, Title, Image, CreatedAt) VALUES
(1006, 'porsche_pete', 'hashed_pass', 'Pete V.', 'Air-cooled only.', 'USER', 'Porsche Purist', NULL, '2026-05-20T10:00:00Z'),
(1007, 'wrench_wench', 'hashed_pass', 'Alice M.', 'I break things and then figure out how to fix them.', 'USER', 'DIY Master', NULL, '2026-05-21T12:00:00Z'),
(1008, 'bimmer_boy', 'hashed_pass', 'Chris K.', 'E46 M3, E39 M5. N/A straight 6 and V8s.', 'USER', 'Bavarian Motor Fan', NULL, '2026-05-22T08:00:00Z'),
(1009, 'track_addict', 'hashed_pass', 'Mike R.', 'If you are not first, you are last.', 'USER', 'Track Day Bro', NULL, '2026-05-23T15:30:00Z'),
(1010, 'daily_driver', 'hashed_pass', 'Sam T.', 'Just trying to keep my civic alive.', 'USER', 'Reliability King', NULL, '2026-05-24T09:15:00Z');

-- Posts for General Car Chat (ForumID 1)
INSERT OR IGNORE INTO Post (PID, Title, Content, UID, ForumID, ParentPID, Post_Category_id, PublishedAt, ImageUrls, Likes, Dislikes) VALUES
(2001, 'What is the best daily driver for under $15k in 2026?', 'Hey all, looking for something reliable, slightly fun, and good on gas. Any suggestions? Considering a used Civic Si or a Mazda3.', 1010, 1, NULL, 4, '2026-05-24T10:00:00Z', NULL, 30, 2),
(2002, 'Car meet this weekend!', 'Is anyone going to the Cars & Coffee this Sunday downtown? I will be bringing the GT3.', 1006, 1, NULL, 4, '2026-05-25T14:30:00Z', NULL, 55, 0);

-- Posts for Porsche (ForumID 5)
INSERT OR IGNORE INTO Post (PID, Title, Content, UID, ForumID, ParentPID, Post_Category_id, PublishedAt, ImageUrls, Likes, Dislikes) VALUES
(2003, 'Finally joined the club! 997 Carrera S', 'After years of saving, I finally picked up my dream 997.1 C2S manual. Needs some TLC but the engine sounds amazing.', 1006, 5, NULL, 1, '2026-05-25T08:00:00Z', '["https://images.unsplash.com/photo-1503376712351-463d12d4d9b6?auto=format&fit=crop&q=80&w=1000"]', 120, 1),
(2004, 'IMS Bearing replacement cost?', 'For those who have done it recently, what did an IMS/RMS and clutch replacement run you at an indie shop?', 1006, 5, NULL, 2, '2026-05-26T07:10:00Z', NULL, 15, 0);

-- Posts for DIY & Repair (ForumID 3)
INSERT OR IGNORE INTO Post (PID, Title, Content, UID, ForumID, ParentPID, Post_Category_id, PublishedAt, ImageUrls, Likes, Dislikes) VALUES
(2005, 'Stripped oil pan drain plug... Help!', 'Well, I did the unthinkable. Over-torqued the drain plug on my aluminum oil pan and stripped the threads. Do I need a whole new pan or can I use a helicoil?', 1007, 3, NULL, 2, '2026-05-24T18:20:00Z', NULL, 8, 0),
(2006, 'How to bleed brakes by yourself - A Guide', 'Since many people ask, here is how I bleed my brakes using a simple $15 vacuum bleeder. Step 1: Raise the car...', 1007, 3, NULL, 3, '2026-05-26T06:45:00Z', '["https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80&w=1000", "https://images.unsplash.com/photo-1590403374261-2673a5a4c90f?auto=format&fit=crop&q=80&w=1000"]', 245, 3);

-- Posts for BMW E46 (ForumID 9)
INSERT OR IGNORE INTO Post (PID, Title, Content, UID, ForumID, ParentPID, Post_Category_id, PublishedAt, ImageUrls, Likes, Dislikes) VALUES
(2007, 'Cooling system overhaul - what am I missing?', 'Doing the entire cooling system this weekend. I have: Radiator, upper/lower hoses, water pump (metal impeller), thermostat, expansion tank, and fan clutch. Anything else?', 1008, 9, NULL, 2, '2026-05-25T11:20:00Z', NULL, 34, 0),
(2008, 'E46 M3 CSL Airbox installed!', 'Just finished installing the Karbonius CSL style airbox and loaded the Alpha-N tune. The induction noise is absolutely life-changing. Here are some pics from the install.', 1008, 9, NULL, 1, '2026-05-26T08:00:00Z', '["https://images.unsplash.com/photo-1555353540-64fd3b000b0e?auto=format&fit=crop&q=80&w=1000"]', 312, 5);

-- Posts for American Muscle (ForumID 1003)
INSERT OR IGNORE INTO Post (PID, Title, Content, UID, ForumID, ParentPID, Post_Category_id, PublishedAt, ImageUrls, Likes, Dislikes) VALUES
(2009, 'New Camshaft installed! Listen to that chop', 'Put a BTR stage 3 cam in my LS3. It idles so mean now. Need to get it tuned properly on a dyno next week.', 1001, 1003, NULL, 1, '2026-05-26T08:30:00Z', '["https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=1000"]', 156, 4);

-- Posts for Engine & Drivetrain (ForumID 6)
INSERT OR IGNORE INTO Post (PID, Title, Content, UID, ForumID, ParentPID, Post_Category_id, PublishedAt, ImageUrls, Likes, Dislikes) VALUES
(2010, 'Manual Transmission Fluid - Redline vs Royal Purple', 'It''s time to change the fluid in my 6-speed. Which one do you guys prefer? I want smoother shifts in the cold.', 1009, 6, NULL, 4, '2026-05-25T16:00:00Z', NULL, 22, 1);

-- Comments for Post 2001 (Daily driver)
INSERT OR IGNORE INTO Comment (CID, Content, UID, PID, ParentCID, PublishedAt, ImageUrls, Likes, Dislikes) VALUES
(2001, 'Mazda3 all the way. The interior quality is way above its price point.', 1008, 2001, NULL, '2026-05-24T10:15:00Z', NULL, 15, 0),
(2002, 'Civic Si is definitely more fun to drive, plus the manual gearbox is fantastic.', 1002, 2001, NULL, '2026-05-24T10:45:00Z', NULL, 20, 1),
(2003, 'What about a used GTI? Very practical and fun.', 1003, 2001, NULL, '2026-05-24T11:00:00Z', NULL, 10, 5),
(2004, 'GTI is great until the water pump fails or the timing chain tensioner goes out.', 1010, 2001, 2003, '2026-05-24T12:00:00Z', NULL, 45, 0);

-- Comments for Post 2003 (997 Carrera)
INSERT OR IGNORE INTO Comment (CID, Content, UID, PID, ParentCID, PublishedAt, ImageUrls, Likes, Dislikes) VALUES
(2005, 'Stunning car! Best modern 911 design in my opinion.', 1003, 2003, NULL, '2026-05-25T08:15:00Z', NULL, 30, 0),
(2006, 'Please tell me you checked the bore scoring before buying...', 1007, 2003, NULL, '2026-05-25T09:00:00Z', NULL, 12, 0),
(2007, 'Yes! Had a full PPI done with bore scoping. Cylinders look pristine.', 1006, 2003, 2006, '2026-05-25T09:30:00Z', NULL, 22, 0);

-- Comments for Post 2005 (Stripped oil pan)
INSERT OR IGNORE INTO Comment (CID, Content, UID, PID, ParentCID, PublishedAt, ImageUrls, Likes, Dislikes) VALUES
(2008, 'Time-Sert is way better than a helicoil for oil pans. Gives you a solid steel thread.', 1009, 2005, NULL, '2026-05-24T18:45:00Z', NULL, 40, 0),
(2009, 'Definitely use a Time-Sert. Also, put some heavy grease on the tap so it catches the aluminum shavings before they fall into the pan!', 1001, 2005, 2008, '2026-05-24T19:30:00Z', NULL, 55, 0),
(2010, 'Alternatively you can tap it one size larger and use an oversized drain plug, if there is enough material left.', 1008, 2005, NULL, '2026-05-24T20:00:00Z', NULL, 15, 2);

-- Comments for Post 2007 (E46 Cooling)
INSERT OR IGNORE INTO Comment (CID, Content, UID, PID, ParentCID, PublishedAt, ImageUrls, Likes, Dislikes) VALUES
(2011, 'Expansion tank cap! Get a new one, the old ones get stuck and cause the tank to explode from pressure.', 1003, 2007, NULL, '2026-05-25T11:45:00Z', NULL, 42, 0),
(2012, 'Also the temperature sensor in the lower radiator hose. The O-ring usually leaks if you reuse it on a new hose.', 1007, 2007, NULL, '2026-05-25T12:00:00Z', NULL, 25, 0),
(2013, 'Thanks guys, adding the cap and sensor to my FCP Euro cart now.', 1008, 2007, 2011, '2026-05-25T12:15:00Z', NULL, 15, 0);

-- Comments for Post 2008 (CSL Airbox)
INSERT OR IGNORE INTO Comment (CID, Content, UID, PID, ParentCID, PublishedAt, ImageUrls, Likes, Dislikes) VALUES
(2014, 'That carbon fiber looks absolutely insane. How is the throttle response?', 1009, 2008, NULL, '2026-05-26T08:15:00Z', NULL, 10, 0),
(2015, 'Throttle response is razor sharp. But the noise... it''s intoxicating past 4000 RPM.', 1008, 2008, 2014, '2026-05-26T08:30:00Z', NULL, 18, 0);

-- Comments for Post 2010 (Transmission Fluid)
INSERT OR IGNORE INTO Comment (CID, Content, UID, PID, ParentCID, PublishedAt, ImageUrls, Likes, Dislikes) VALUES
(2016, 'Redline MTL all the way. Put it in my car and it completely got rid of the 2nd gear grind when cold.', 1001, 2010, NULL, '2026-05-25T16:30:00Z', NULL, 22, 0),
(2017, 'I''ve had good luck with Royal Purple Synchromax. Honestly either one is a huge upgrade over the OEM lifetime fluid.', 1008, 2010, NULL, '2026-05-25T17:15:00Z', NULL, 14, 0);


-- More posts for JDM Market (ForumID 1001)
INSERT OR IGNORE INTO Post (PID, Title, Content, UID, ForumID, ParentPID, Post_Category_id, PublishedAt, ImageUrls, Likes, Dislikes) VALUES
(2011, 'R32 GTR vs R33 GTR - Which is the better buy today?', 'Prices are insane right now. Is the R33 worth the premium for the stiffer chassis and better ATTESA system, or is the R32 still the rawest skyline experience?', 1002, 1001, NULL, 4, '2026-05-26T09:00:00Z', '["https://images.unsplash.com/photo-1596707328904-8b6eeeb4e2f1?auto=format&fit=crop&q=80&w=1000"]', 140, 2);

-- Comments for Post 2011
INSERT OR IGNORE INTO Comment (CID, Content, UID, PID, ParentCID, PublishedAt, ImageUrls, Likes, Dislikes) VALUES
(2018, 'R32 is definitely lighter and feels more nimble, but the R33 is a much better grand tourer. Depends on what you want to do with it.', 1009, 2011, NULL, '2026-05-26T09:05:00Z', NULL, 18, 0),
(2019, 'I daily an R32 and it''s definitely a 90s tin can. I love it, but the R33 is way safer and more comfortable.', 1005, 2011, 2018, '2026-05-26T09:12:00Z', NULL, 25, 0);

COMMIT;
