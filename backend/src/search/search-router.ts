import express from "express";
import { SearchRepository } from "./search-repository";
import { SearchService } from "./search-service";

const searchService = new SearchService(new SearchRepository());
export const searchRouter = express.Router();

searchRouter.get("/search", (req, res) => {
    const query = req.query.q;
    
    if (typeof query !== "string") {
        return res.status(400).send("Invalid search query");
    }

    try {
        const results = searchService.search(query);
        res.json(results);
    } catch (error) {
        console.error("Search failed:", error);
        res.status(500).send("Internal Server Error");
    }
});
