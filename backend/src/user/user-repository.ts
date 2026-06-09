import { DB } from "../database";
import { User } from "../../data/model";

export class UserRepository {
    public static findAllUsers(): User[] {
        const db = DB.getInstance();
        const result = db.prepare(`
            SELECT 
                UID as uid, 
                Username as username, 
                Password as password, 
                PublicName as publicname, 
                Description as description, 
                Title as title, 
                Image as image, 
                CreatedAt as createdAt,
                Role as role,
                (SELECT COUNT(*) FROM Post WHERE UID = User.UID) as totalPosts,
                (SELECT COUNT(*) FROM Comment WHERE UID = User.UID) as totalComments,
                (
                    (SELECT IFNULL(SUM(Likes - Dislikes), 0) FROM Post WHERE UID = User.UID) + 
                    (SELECT IFNULL(SUM(Likes - Dislikes), 0) FROM Comment WHERE UID = User.UID)
                ) as totalAura
            FROM User
        `).all();
        return result as unknown as User[];
    }

    public static findUserById(id: number) {
        const db = DB.getInstance();
        const result = db.prepare(`
            SELECT 
                UID as uid, 
                Username as username, 
                Password as password, 
                PublicName as publicname, 
                Description as description, 
                Title as title, 
                Image as image, 
                CreatedAt as createdAt,
                Role as role,
                (SELECT COUNT(*) FROM Post WHERE UID = User.UID) as totalPosts,
                (SELECT COUNT(*) FROM Comment WHERE UID = User.UID) as totalComments,
                (
                    (SELECT IFNULL(SUM(Likes - Dislikes), 0) FROM Post WHERE UID = User.UID) + 
                    (SELECT IFNULL(SUM(Likes - Dislikes), 0) FROM Comment WHERE UID = User.UID)
                ) as totalAura
            FROM User 
            WHERE UID = ?
        `).get(id);
        return result;
    }

    public static findUserByUsername(username: string) {
        const db = DB.getInstance();
        const result = db.prepare(`
            SELECT 
                UID as uid, 
                Username as username, 
                Password as password, 
                PublicName as publicname, 
                Description as description, 
                Title as title, 
                Image as image, 
                CreatedAt as createdAt,
                Role as role,
                (SELECT COUNT(*) FROM Post WHERE UID = User.UID) as totalPosts,
                (SELECT COUNT(*) FROM Comment WHERE UID = User.UID) as totalComments,
                (
                    (SELECT IFNULL(SUM(Likes - Dislikes), 0) FROM Post WHERE UID = User.UID) + 
                    (SELECT IFNULL(SUM(Likes - Dislikes), 0) FROM Comment WHERE UID = User.UID)
                ) as totalAura
            FROM User 
            WHERE Username = ?
        `).get(username);
        console.log(result);
        return result;
    }

    public static updateUser(user: User) {
        const db = DB.getInstance();
        db.prepare(`
            UPDATE User
            SET Username = ?, PublicName = ?, Description = ?
            WHERE UID = ?
        `).run(
            user.username,
            user.publicname,
            user.description,
            user.uid
        );
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

