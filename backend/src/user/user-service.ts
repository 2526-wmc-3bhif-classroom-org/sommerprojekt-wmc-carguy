import { User, UserInput, UserClaims } from "../../data/model";
import { UserRepository } from "./user-repository";
import * as bcrypt from 'bcrypt';

export class UserService {

    public static getAllUsers(): User[] {
        return UserRepository.findAllUsers() as User[];
    }

    public static getUserById(id: number): User | undefined {
        return UserRepository.findUserById(id) as User;
    }

    public static getUserByUsername(userName: string): User | undefined {
        return UserRepository.findUserByUsername(userName) as User;
    }

    public static createUser(user: User){
        UserRepository.createNewUser(user);
    }

    public static checkUserCredentials(input: UserInput): UserClaims | undefined {
        const user: User | undefined = UserRepository.findUserByUsername(input.username) as User | undefined;
        if (user === undefined) throw new Error("User not found");
        if (!bcrypt.compareSync(input.password, user.password)) throw new Error("Wrong password");
        return {
            username: user.username,
            role: user.role,
        };
    }

    public static createNewUser(input: UserInput) {
        if (!input.username || !input.password) {
            throw new Error("Username and password are required");
        }

        // Check if username already exists
        const existing = UserRepository.findUserByUsername(input.username);
        if (existing) {
            throw new Error("Username already taken");
        }

        const hashedPassword = bcrypt.hashSync(input.password, 10);

        const user: User = {
            uid: Date.now(), // Simple unique ID generation
            username: input.username,
            password: hashedPassword,
            publicName: input.username,
            role: "user",
            createdAt: new Date(),
        };

        UserRepository.createNewUser(user);
    }
}