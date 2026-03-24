import { Post } from "../../data/model";
import { PostRepository } from "./post-repository";

export class PostService {
    constructor(private postRepository: PostRepository) {}

    public getAllPosts(): Post[] {
        return this.postRepository.findAllPosts();
    }

    public getPostById(id: number): Post | undefined {
        return this.postRepository.findPostById(id);
    }

    public getPostByForum(forumId: number): Post[] {
        return this.postRepository.findPostByForum(forumId);
    }

    public getPostByUser(userId: number): Post[] {
        return this.postRepository.findPostByUser(userId);
    }

    public getPostByCategory(categoryId: number): Post[] {
        return this.postRepository.findPostByCategory(categoryId);
    }
}