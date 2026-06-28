import { Post } from "../../data/model";
import { PostRepository } from "./post-repository";

export class PostService {
    constructor(private postRepository: PostRepository) {}

    public getAllRootPosts(): Post[] {
        return this.postRepository.findAllRootPosts();
    }

    public getTrendingPosts(limit: number = 10): Post[] {
        return this.postRepository.findTrendingPosts(limit);
    }

    public getPostById(id: number, currentUserId?: number): Post | undefined {
        return this.postRepository.findPostById(id, currentUserId);
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

    public createPost(post: Post): number {
        return this.postRepository.createPost(post);
    }

    public createReply(post: Post): void {
        this.postRepository.createReply(post);
    }

    public likePost(id: number): void {
        this.postRepository.likePost(id);
    }

    public unlikePost(id: number): void {
        this.postRepository.unlikePost(id);
    }

    public dislikePost(id: number): void {
        this.postRepository.dislikePost(id);
    }

    public undislikePost(id: number): void {
        this.postRepository.undislikePost(id);
    }

    public bookmarkPost(uid: number, pid: number): void {
        this.postRepository.bookmarkPost(uid, pid);
    }

    public unbookmarkPost(uid: number, pid: number): void {
        this.postRepository.unbookmarkPost(uid, pid);
    }

    public isBookmarked(uid: number, pid: number): boolean {
        return this.postRepository.isBookmarked(uid, pid);
    }

    public getBookmarkedPosts(uid: number): Post[] {
        return this.postRepository.findBookmarkedPosts(uid);
    }

    public recordPollVote(pid: number, uid: number, optionIndex: number): void {
        this.postRepository.recordPollVote(pid, uid, optionIndex);
    }
}