import { ShoutRepository } from "./shout-repository";
import { Shout } from "../../data/model";

export class ShoutService {
    constructor(private shoutRepository: ShoutRepository) {}

    public getRecentShouts(): Shout[] {
        return this.shoutRepository.findRecentShouts();
    }

    public postShout(content: string, userId: number): void {
        // Basic offline moderation check (slurs/bad words) - AI moderation will hook in here as well
        const normalized = content.toLowerCase();
        const banned = ["slur", "offensive", "abuse"]; // Basic check, will be enhanced in AI moderator task
        for (const word of banned) {
            if (normalized.includes(word)) {
                throw new Error("Message contains flagged terms. Keep the community clean!");
            }
        }

        this.shoutRepository.createShout(content, userId);
    }

    public removeShout(sid: number): void {
        this.shoutRepository.deleteShout(sid);
    }
}
