import { DB } from "../database";
import { User } from "../../data/model";

export class UserRepository {
    public static findAllUsers(): User[] {
        const db = DB.getInstance();
        const result = db.prepare("SELECT UID as uid, Username as username, Password as password, PublicName as publicName, Description as description, Title as title, Image as image, CreatedAt as createdAt FROM User").all();
        return result as unknown as User[];
    }

    public static findUserById(id: number) {
        const db = DB.getInstance();
        const result = db.prepare("SELECT UID as uid, Username as username, Password as password, PublicName as publicName, Description as description, Title as title, Image as image, CreatedAt as createdAt FROM User WHERE UID = ?").get(id);
        return result;
    }

    public static findUserByUsername(username: string) {
        const db = DB.getInstance();
        const result = db.prepare("SELECT UID as uid, Username as username, Password as password, PublicName as publicname, Description as description, Title as title, Image as image, CreatedAt as createdAt FROM User WHERE Username = ?").get(username);
        console.log(result);
        return result;
    }

    public static createNewUser(user: User): void {
        const db = DB.getInstance();

        db.prepare(`
                INSERT INTO User (UID, PublicName, Username, Password, CreatedAt, Role)
                VALUES (?, ?, ?, ?, ?, ?)
            `).run(
            user.uid,
            user.publicname,
            user.username,
            user.password,
            user.createdAt instanceof Date ? user.createdAt.toISOString() : user.createdAt,
            user.role
        );
    }
}

