import { DB } from "../database";
import { User } from "../../data/model";


export class UserRepository {
    public findAllUsers() {
        const db = DB.createDBConnection();
        const result = db.prepare("SELECT * FROM User").all();
        db.close();
        return result;
    }

    public findUserById(id: number) {
        const db = DB.createDBConnection();
        const result = db.prepare("SELECT * FROM User WHERE UID = ?").get(id);
        db.close();
        return result;
    }

    public create(user: User): void {
        const db = DB.createDBConnection();

        db.prepare(`
                INSERT INTO User (UID, Username, Password, CreatedAt)
                VALUES (?, ?, ?, ?)
            `).run(
            user.uid,
            user.username,
            user.password,
            user.createdAt
        );
    }
}

