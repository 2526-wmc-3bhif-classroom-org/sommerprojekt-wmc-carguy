import { DB } from "../database";
import { GarageVehicle } from "../../data/model";

export class GarageRepository {
    public findUserVehicles(uid: number): GarageVehicle[] {
        const db = DB.getInstance();
        const rows = db.prepare(`
            SELECT GVID as gvid, UID as uid, Make as make, Model as model, Year as year, Mods as mods, ImageUrl as imageUrl
            FROM GarageVehicle
            WHERE UID = ?
            ORDER BY GVID DESC
        `).all(uid) as any[];

        return rows as GarageVehicle[];
    }

    public createVehicle(uid: number, make: string, model: string, year: number, mods?: string, imageUrl?: string): void {
        const db = DB.getInstance();
        db.prepare(`
            INSERT INTO GarageVehicle (UID, Make, Model, Year, Mods, ImageUrl)
            VALUES (?, ?, ?, ?, ?, ?)
        `).run(uid, make, model, year, mods || null, imageUrl || null);
    }

    public deleteVehicle(gvid: number): void {
        const db = DB.getInstance();
        db.prepare(`
            DELETE FROM GarageVehicle WHERE GVID = ?
        `).run(gvid);
    }

    public findVehicleById(gvid: number): GarageVehicle | undefined {
        const db = DB.getInstance();
        const row = db.prepare(`
            SELECT GVID as gvid, UID as uid, Make as make, Model as model, Year as year, Mods as mods, ImageUrl as imageUrl
            FROM GarageVehicle
            WHERE GVID = ?
        `).get(gvid) as any;
        return row as GarageVehicle | undefined;
    }
}
