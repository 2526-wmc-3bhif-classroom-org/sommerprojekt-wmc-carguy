import { SearchRepository } from "./search-repository";
import { Post, User, Forum } from "../../data/model";

export interface SearchResults {
    posts: Post[];
    users: User[];
    communities: Forum[];
}

export class SearchService {
    constructor(private searchRepository: SearchRepository) {}

    public search(query: string): SearchResults {
        if (!query || query.trim() === "") {
            return { posts: [], users: [], communities: [] };
        }
        
        const posts = this.searchRepository.searchPosts(query);
        const users = this.searchRepository.searchUsers(query);
        const communities = this.searchRepository.searchForums(query);

        return {
            posts,
            users,
            communities
        };
    }
}
