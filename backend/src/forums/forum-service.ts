import { Forum } from "../../data/model";
import { ForumRepository } from "./forum-repository";

export class ForumService {

    constructor(private forumRepository: ForumRepository) {}

    public getAllForums(): Forum[] {
        return this.forumRepository.findAllForums();
    }

    public getForumById(id: number): Forum | undefined {
        return this.forumRepository.findForumById(id);
    }

    public getForumByCategory(categoryId: number): Forum[] {
        return this.forumRepository.findForumByCategory(categoryId);
    }

    public createForum(){

    }
}