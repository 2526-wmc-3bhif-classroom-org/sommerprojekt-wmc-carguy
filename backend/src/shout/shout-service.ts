import { ShoutRepository } from "./shout-repository";
import { Shout } from "../../data/model";

export class ShoutService {
    constructor(private shoutRepository: ShoutRepository) {}

    public getRecentShouts(): Shout[] {
        return this.shoutRepository.findRecentShouts();
    }

    public postShout(content: string, userId: number): void {
        this.shoutRepository.createShout(content, userId);
    }

    public removeShout(sid: number): void {
        this.shoutRepository.deleteShout(sid);
    }
}
