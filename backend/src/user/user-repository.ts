import { DB } from "../database";
import { User } from "../../data/model";


export class UserRepository {
    public findAllUsers() {
        const db = DB.getInstance();
        const result = db.prepare("SELECT UID as uid, Username as username, Password as password, PublicName as publicName, Description as description, Title as title, Image as image, CreatedAt as createdAt FROM User").all();
        return result;
    }

    public findUserById(id: number) {
        const db = DB.getInstance();
        const result = db.prepare("SELECT UID as uid, Username as username, Password as password, PublicName as publicName, Description as description, Title as title, Image as image, CreatedAt as createdAt FROM User WHERE UID = ?").get(id);
        return result;
    }

    public findUserByUsername(username: string) {
        const db = DB.getInstance();
        const result = db.prepare("SELECT UID as uid, Username as username, Password as password, PublicName as publicName, Description as description, Title as title, Image as image, CreatedAt as createdAt FROM User WHERE Username = ?").get(username);
        return result;
    }

    public create(user: User): void {
        const db = DB.getInstance();

        db.prepare(`
                INSERT INTO User (UID, Username, Password, CreatedAt, Role)
                VALUES (?, ?, ?, ?)
            `).run(
            user.uid,
            user.username,
            user.password,
            user.createdAt,
            user.role
        );
    }
}

