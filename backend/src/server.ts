import express from "express"
import {commentRouter} from "./comment/comment-router";

const app = express();
app.use(express.json());

app.listen(3000, () => {
    console.log("Server running on port 3000");
});

app.use(commentRouter, "/api");