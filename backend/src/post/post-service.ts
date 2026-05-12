import { Post } from "../../data/model";
import { PostRepository } from "./post-repository";

export class PostService {
    constructor(private postRepository: PostRepository) {}

    public getAllRootPosts(): Post[] {
        return this.postRepository.findAllRootPosts();
    }

    public getPostById(id: number): Post | undefined {
        return this.postRepository.findPostById(id);
    }

    public getRepliesByParentId(parentId: number): Post[] {
        return this.postRepository.findRepliesByParentId(parentId);
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

    public createPost(post: Post): void {
        this.postRepository.createPost(post);
    }

    public createReply(post: Post): void {
        this.postRepository.createReply(post);
    }

    public likePost(id: number): void {
        this.postRepository.likePost(id);
    }

    public dislikePost(id: number): void {
        this.postRepository.dislikePost(id);
    }
}