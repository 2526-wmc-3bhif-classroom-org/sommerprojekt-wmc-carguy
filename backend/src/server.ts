import express from "express"
import {commentRouter} from "./comment/comment-router";
import {forumRouter} from "./forums/forum-router";
import {userRouter} from "./user/user-router";
import {postRouter} from "./post/post-router";

const app = express();
app.use(express.json());

app.use("/api", commentRouter);
app.use("/api", forumRouter);
app.use("/api", userRouter);
app.use("/api", postRouter);

app.listen(3000, () => {
    console.log("Server running on port 3000");
});