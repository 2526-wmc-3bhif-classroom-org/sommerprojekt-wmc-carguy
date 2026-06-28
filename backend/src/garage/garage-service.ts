import { GarageRepository } from "./garage-repository";
import { GarageVehicle } from "../../data/model";

export class GarageService {
    constructor(private garageRepository: GarageRepository) {}

    public getUserVehicles(uid: number): GarageVehicle[] {
        return this.garageRepository.findUserVehicles(uid);
    }

    public addVehicle(uid: number, make: string, model: string, year: number, mods?: string, imageUrl?: string): void {
        this.garageRepository.createVehicle(uid, make, model, year, mods, imageUrl);
    }

    public removeVehicle(gvid: number, uid: number): void {
        const vehicle = this.garageRepository.findVehicleById(gvid);
        if (!vehicle) {
            throw new Error("Vehicle not found");
        }
        if (vehicle.uid !== uid) {
            throw new Error("Unauthorized deletion");
        }
        this.garageRepository.deleteVehicle(gvid);
    }
}
