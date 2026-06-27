import { Guide, User } from "../../data/model";
import { GuideRepository } from "./guide-repository";
import { UserRepository } from "../user/user-repository";

export class GuideService {
    constructor(
        private guideRepository: GuideRepository,
        private userRepository: UserRepository
    ) {}

    public getAllGuides(): Guide[] {
        return this.guideRepository.findAllGuides();
    }

    public getGuideById(id: number): Guide | undefined {
        return this.guideRepository.findGuideById(id);
    }

    public createGuide(title: string, description: string, content: string[], authorUsername: string): void {
        const user = this.userRepository.findUserByUsername(authorUsername);
        if (!user) throw new Error("User not found");

        const isVerified = (user.totalAura ?? 0) >= 100 || user.role === "admin";
        if (!isVerified) throw new Error("Only verified users with 100+ Aura or admins can post guides.");

        this.guideRepository.createGuide({
            title,
            description,
            content,
            author: user as User
        });
    }

    public updateGuide(id: number, title: string, description: string, content: string[], authorUsername: string): void {
        const user = this.userRepository.findUserByUsername(authorUsername);
        if (!user) throw new Error("User not found");

        const authorUid = this.guideRepository.findGuideAuthorUid(id);
        if (authorUid === undefined) throw new Error("Guide not found");

        if ((user as any).uid !== authorUid) {
            throw new Error("You can only edit your own guides.");
        }

        this.guideRepository.updateGuide(id, title, description, content);
    }

    public deleteGuide(id: number, authorUsername: string): void {
        const user = this.userRepository.findUserByUsername(authorUsername);
        if (!user) throw new Error("User not found");

        const authorUid = this.guideRepository.findGuideAuthorUid(id);
        if (authorUid === undefined) throw new Error("Guide not found");

        if ((user as any).uid !== authorUid) {
            throw new Error("You can only delete your own guides.");
        }

        this.guideRepository.deleteGuide(id);
    }
}
