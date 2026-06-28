import { EventRepository, EventModel } from "./event-repository";

export class EventService {
    constructor(private eventRepository: EventRepository) {}

    public getEvents(): EventModel[] {
        return this.eventRepository.findAllEvents();
    }

    public createEvent(title: string, description: string, location: string, eventDate: string, uid: number): void {
        this.eventRepository.createEvent(title, description, location, eventDate, uid);
    }

    public submitRsvp(eid: number, uid: number, status: string): void {
        const validStatuses = ["yes", "no", "maybe"];
        if (!validStatuses.includes(status.toLowerCase())) {
            throw new Error("Invalid RSVP status");
        }
        this.eventRepository.rsvpEvent(eid, uid, status.toLowerCase());
    }
}
