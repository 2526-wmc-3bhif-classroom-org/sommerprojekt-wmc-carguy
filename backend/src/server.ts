import express from "express"
import cors from "cors";
import { forumRouter } from "./forums/forum-router";
import { userRouter } from "./user/user-router";
import { postRouter } from "./post/post-router";
import { commentRouter } from "./comments/comment-router";
import { guideRouter } from "./guides/guide-router";
import { searchRouter } from "./search/search-router";
import { shoutRouter } from "./shout/shout-router";
import { garageRouter } from "./garage/garage-router";
import { moderationRouter } from "./moderation/moderation-router";
import { eventRouter } from "./event/event-router";
import { DB } from "./database";

const app = express();
app.use(express.json({ limit: '5mb' }));
app.use(cors());

app.use("/api", forumRouter);
app.use("/api", userRouter);
app.use("/api", postRouter);
app.use("/api", commentRouter);
app.use("/api", guideRouter);
app.use("/api", searchRouter);
app.use("/api", shoutRouter);
app.use("/api", garageRouter);
app.use("/api", moderationRouter);
app.use("/api", eventRouter);

const startServer = async () => {
    try {
        // Initialize and verify database connection on startup
        DB.getInstance();
        console.log("Database connected successfully!");

        // 2. Start the Express listener
        app.listen(3000, () => {
            console.log("Server running on port 3000");
        });
    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
};

process.on('exit', (code) => {
    console.log(`Process exited with code: ${code}`);
});

process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION:', err);
    process.exit(1);
});

startServer();