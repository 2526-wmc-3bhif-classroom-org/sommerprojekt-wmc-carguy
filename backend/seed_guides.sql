-- Seed Data for Guides
-- Author UIDs correspond to users seeded in seed.sql, seed_more.sql and seed.ts:
-- 1: max_mustermann (BMW E46 M3)
-- 3: carlo_benz (Mercedes E-Class)
-- 4: admin (Administrator)
-- 1001: gearhead_gary (Muscle Enthusiast)
-- 1002: jdm_king99 (Supra MKIV Owner)
-- 1006: porsche_pete (Porsche Purist)
-- 1007: wrench_wench (DIY Master)
-- 1008: bimmer_boy (Bavarian Motor Fan)

BEGIN TRANSACTION;

-- Clear existing guides to ensure a clean seed of all guides
DELETE FROM Guide;

-- Seed default, general, and vehicle-specific guides
INSERT INTO Guide (GuideID, Title, Description, Content, UID, PublishedAt, Likes, Dislikes) VALUES
-- Guide 1: General Profile Setup (Author: admin - UID 4)
(1, 
 'Setting Up Your Profile', 
 'Learn how to perfectly set up your profile and fill your virtual garage with your favorite cars.', 
 '["First, navigate to your profile page by clicking your avatar in the top right corner.","Click on \"Edit Profile\" to add a personal bio, social links, and upload a profile picture that represents you.","To build your \"Virtual Garage\", click the \"Add Vehicle\" button. You can specify the make, model, year, and even upload photos of your actual car.","Don''t forget to save your changes!"]', 
 4, 
 '2026-06-09T08:00:00.000Z', 
 12, 
 0),

-- Guide 2: General Communities (Author: admin - UID 4)
(2, 
 'Finding the Right Community', 
 'Discover how to find, join, and participate in the best car communities for your interests.', 
 '["Navigate to the \"Communities\" tab using the main navigation bar.","You can browse through curated categories (like JDM, Muscle, or Euro) or use the search bar to find niche groups.","Once you find a community you like, click the \"Join\" button on the community card.","Introduce yourself in the community''s main feed to start interacting with other enthusiasts!"]', 
 4, 
 '2026-06-09T08:05:00.000Z', 
 8, 
 0),

-- Guide 3: BMW E46 Cooling System Overhaul (Author: bimmer_boy - UID 1008)
(3, 
 'BMW E46 M3 & 3-Series Cooling Overhaul', 
 'Step-by-step instructions to prevent catastrophic failure by refreshing the notorious E46 cooling system.', 
 '["Let the car cool completely. Disconnect the negative battery terminal and raise the front of the vehicle.","Remove the splash guard and place a drain pan beneath the radiator. Open the radiator drain plug and the engine block drain plug.","Remove the expansion tank, upper and lower radiator hoses, and the fan shroud/clutch using a 32mm wrench (reverse thread).","Unbolt the water pump and thermostat housing. Clean all mating surfaces on the engine block thoroughly.","Install the new metal-impeller water pump and new thermostat housing, torqueing bolts to 10 Nm.","Slide the new radiator into position and clip in the new expansion tank with a new expansion tank cap.","Reinstall the fan, hoses, and temperature sensors. Fill the system with a 50/50 mix of BMW coolant and distilled water.","Turn key to Position 2, set heat to maximum with low fan speed, open the bleed screw, and pour coolant until bubble-free liquid flows out. Close bleed screw and start the engine."]', 
 1008, 
 '2026-06-09T08:10:00.000Z', 
 85, 
 1),

-- Guide 4: Porsche 911 (997) Oil Change (Author: porsche_pete - UID 1006)
(4, 
 'Porsche 911 (997.1) Oil Change Guide', 
 'Learn how to perform a basic oil and filter service on your Porsche 997.1 Carrera.', 
 '["Warm the engine slightly to ensure the oil drains smoothly. Turn off the car and pull it onto ramps or jack stands.","Locate the oil drain plug on the oil pan. Place a large drain pan underneath (capacity needs to be at least 9 liters).","Remove the drain plug using an 8mm Allen key. Let the oil drain completely for 15-20 minutes.","While draining, open the engine lid and locate the oil filter housing. Use a 74mm 14-flute oil filter wrench to unscrew the cap.","Replace the oil filter element inside the cap, fit the new rubber O-ring, and lubricate it with fresh oil.","Reinstall the oil filter housing cap and torque to 25 Nm.","Replace the crush washer on the drain plug. Reinstall the plug and torque to 50 Nm.","Refill the engine with 8.25 liters of Porsche A40 approved 5W-40 or 0W-40 oil. Run the engine, check for leaks, and verify the electronic oil level gauge."]', 
 1006, 
 '2026-06-09T08:15:00.000Z', 
 42, 
 0),

-- Guide 5: JDM Toyota Supra Spark Plugs (Author: jdm_king99 - UID 1002)
(5, 
 'Toyota Supra MKIV (2JZ-GTE) Spark Plug Replacement', 
 'A guide to changing spark plugs on the legendary 2JZ-GTE twin-turbo inline 6 engine.', 
 '["Remove the keys from ignition and open the hood. Remove the black plastic spark plug cover (engine center cover) using a hex key.","Disconnect and remove the bracket holding the throttle cable if it blocks access, and disconnect the main wiring harness from the coil packs.","Unscrew the 10mm bolts securing the individual coil packs. Pull each coil pack straight up and inspect for oil in the spark plug wells.","Use a 5/8\" spark plug socket with an extension to carefully unscrew the old spark plugs. Inspect the plug tips to check engine health.","Check the gap on the new spark plugs (OEM specification is 1.1mm, but reduce to 0.7-0.8mm if running high boost).","Apply a tiny dab of anti-seize to the new plug threads. Thread them in by hand first to avoid cross-threading, then torque to 20 Nm.","Apply dielectric grease inside the rubber boot of each coil pack and push them back onto the plugs. Torque 10mm bolts.","Reconnect coil pack plugs, reattach throttle bracket, install spark plug cover, and test fire the engine."]', 
 1002, 
 '2026-06-09T08:20:00.000Z', 
 67, 
 2),

-- Guide 6: General DIY Thread Repair (Author: wrench_wench - UID 1007)
(6, 
 'Repairing Stripped Oil Pan Threads (Time-Sert Guide)', 
 'How to professionally repair stripped aluminum oil pan threads using a Time-Sert thread insert.', 
 '["Drain all oil from the engine. Ensure the vehicle is securely raised on jack stands or a lift.","Select the correct Time-Sert kit size (typically M14x1.5 for many modern cars).","Apply a thick layer of grease onto the reamer tool. The grease catches aluminum shavings and stops them falling into the engine.","Ream out the damaged thread slowly, keeping the tool perfectly square. Clean shavings from the tool and repeat.","Apply grease to the tap tool and cut the new thread. Clean shavings thoroughly. Use brake cleaner to blow out any residue.","Use the counterbore tool to create a seat for the insert flange, so it sits flush.","Clean the threads with brake cleaner. Apply high-strength red threadlocker (Loctite 271) to the outer threads of the Time-Sert insert.","Thread the insert onto the installation tool. Oil the tool''s tip and wind it into the new thread. The tool will expand the insert to lock it in place.","Back the tool out, wipe away any excess threadlocker, let it cure, and install the drain plug with a new washer."]', 
 1007, 
 '2026-06-09T08:25:00.000Z', 
 110, 
 1),

-- Guide 7: Mercedes 722.6 Transmission Service (Author: carlo_benz - UID 3)
(7, 
 'Mercedes-Benz 5-Speed (722.6) Transmission Fluid Service', 
 'Keep your shifts smooth by changing the transmission fluid and conductor plate plug connector.', 
 '["Raise the vehicle evenly on all four sides. Wear eye protection as transmission fluid is highly corrosive.","Locate the transmission oil pan. Place a drain pan below, remove the drain plug, and let the fluid empty.","Unscrew the transmission pan bolts. Keep the pan level as it still contains about 2-3 liters of fluid.","Remove the old filter by pulling it straight down. Clean the inside of the oil pan, clean the pan magnet, and install a new filter.","Locate the electrical plug connector on the front passenger side of the transmission. Turn the lock tab counterclockwise and pull out the plug.","Remove the 7mm bolt holding the plastic spacer sleeve (pilot bushing). Replace the bushing with a new one containing fresh O-rings (leaks here will wick fluid into the TCU).","Install the new bushing, torque the 7mm bolt to 3 Nm, and plug the cable back in.","Reinstall the transmission pan with a new gasket. Torque pan bolts in a crisscross pattern to 8 Nm.","Refill with 4 liters of MB 236.14 approved transmission fluid. Use a transmission dipstick tool to measure the level at 80°C with engine running in Park."]', 
 3, 
 '2026-06-09T08:30:00.000Z', 
 29, 
 0),

-- Guide 8: General Dyno Tuning Prep (Author: gearhead_gary - UID 1001)
(8, 
 'Preparing Your Car for a Dyno Tuning Session', 
 'Save time and money by ensuring your vehicle is 100% ready for the rolling road.', 
 '["Verify there are zero fluid leaks (oil, coolant, power steering, transmission). Dyno shops will reject or charge clean-up fees for leaks.","Ensure the cooling system is bleeding-free and the cooling fan is working properly. The car will experience high stress and heat.","Fill up the tank with the exact octane fuel you plan on running. Dyno tuning on low fuel can cause fuel starvation under high G-forces.","Verify your spark plugs are fresh and properly gapped for your power goals. Boosted engines require smaller gaps (e.g. 0.7-0.8mm).","Inspect all vacuum lines and charge piping for boost leaks. A simple boost leak will waste the tuner''s time.","Ensure tires are in good condition, properly inflated, and wheel alignment is straight.","Bring any locking wheel nut keys, access codes for the ECU, and spare fluids just in case."]', 
 1001, 
 '2026-06-09T08:35:00.000Z', 
 53, 
 1);

COMMIT;
