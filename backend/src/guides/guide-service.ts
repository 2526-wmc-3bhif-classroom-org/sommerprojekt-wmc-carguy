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
        if (!user) {
            throw new Error("User not found");
        }

        const isVerified = (user.totalAura ?? 0) >= 100 || user.role === "admin";
        if (!isVerified) {
            throw new Error("Only verified users with 100+ Aura or admins can post guides.");
        }

        this.guideRepository.createGuide({
            title,
            description,
            content,
            author: user as User
        });
    }
}
