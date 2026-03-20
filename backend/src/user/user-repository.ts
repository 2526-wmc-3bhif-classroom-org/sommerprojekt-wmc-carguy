import { DB } from "../database";

export function findAllUsers() {
    const db = DB.createDBConnection();
    const result = db.prepare("SELECT * FROM User").all();
    db.close();
    return result;
}

export function findUserById(id: number) {
    const db = DB.createDBConnection();
    const result = db.prepare("SELECT * FROM User WHERE UID = ?").get(id);
    db.close();
    return result;
}