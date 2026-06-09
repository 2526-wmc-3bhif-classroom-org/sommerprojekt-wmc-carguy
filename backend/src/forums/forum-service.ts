import { Forum } from "../../data/model";
import { ForumRepository } from "./forum-repository";

export class ForumService {

    constructor(private forumRepository: ForumRepository) {}

    public getAllForums(): Forum[] {
        return this.forumRepository.findAllForums();
    }

    public getTrendingForums(limit: number = 5): Forum[] {
        return this.forumRepository.findTrendingForums(limit);
    }

    public getForumById(id: number): Forum | undefined {
        return this.forumRepository.findForumById(id);
    }

    public getForumByCategory(categoryId: number): Forum[] {
        return this.forumRepository.findForumsByCategory(categoryId);
    }

    public createForum(forum: Forum, authorUid?: number): number {
        return this.forumRepository.createForum(forum, authorUid);
    }

    public updateForum(id: number, name: string, description?: string): boolean {
        return this.forumRepository.updateForum(id, name, description);
    }

    public deleteForum(id: number): boolean {
        return this.forumRepository.deleteForum(id);
    }

    public joinForum(userId: number, forumId: number): boolean {
        return this.forumRepository.joinForum(userId, forumId);
    }

    public leaveForum(userId: number, forumId: number): boolean {
        return this.forumRepository.leaveForum(userId, forumId);
    }

    public isUserInForum(userId: number, forumId: number): boolean {
        return this.forumRepository.isUserInForum(userId, forumId);
    }
}