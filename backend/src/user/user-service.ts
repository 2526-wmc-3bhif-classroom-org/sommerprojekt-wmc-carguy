import { User, UserInput, UserClaims } from "../../data/model";
import { UserRepository } from "./user-repository";
import * as bcrypt from 'bcrypt';

export class UserService {
    constructor(private userRepository: UserRepository) {}

    public getAllUsers(): User[] {
        return this.userRepository.findAllUsers() as User[];
    }

    public getUserById(id: number): User | undefined {
        return this.userRepository.findUserById(id) as User;
    }

    public getUserByUsername(userName: string): User | undefined {
        return this.userRepository.findUserByUsername(userName) as User;
    }

    public createUser(user: User){
        this.userRepository.createNewUser(user);
    }

    public checkUserCredentials(input: UserInput): UserClaims | undefined {
        const user: User | undefined = this.userRepository.findUserByUsernameWithPassword(input.username) as User | undefined;
        if (user === undefined) throw new Error("User not found");
        if (!bcrypt.compareSync(input.password, user.password)) throw new Error("Wrong password");
        return {
            username: user.username,
            role: user.role,
        };
    }

    public createNewUser(input: UserInput) : User {
        if (!input.username || !input.password) {
            throw new Error("Username and password are required");
        }

        // Check if username already exists
        const existing = this.userRepository.findUserByUsername(input.username);
        if (existing) {
            throw new Error("Username already taken");
        }

        const hashedPassword = bcrypt.hashSync(input.password, 10);

        const maxId = this.userRepository.getMaxUserId();
        const user: User = {
            uid: maxId + 1,
            username: input.username,
            password: hashedPassword,
            publicname: input.publicname ? input.publicname : input.username,
            role: "user",
            createdAt: new Date(),
        };

        this.userRepository.createNewUser(user);
        return user;
    }

    public updateUserInfo(realUserName: string, newUserData: Partial<User>): User {
        if (!realUserName || !newUserData) {
            throw new Error("User not found");
        }

        const realUser: User = this.userRepository.findUserByUsername(realUserName);
        if (!realUser) {
            throw new Error("User not found");
        }

        if (newUserData.username) realUser.username = newUserData.username;
        if (newUserData.publicname) realUser.publicname = newUserData.publicname;
        if (newUserData.description !== undefined) realUser.description = newUserData.description;
        if (newUserData.image !== undefined) realUser.image = newUserData.image;

        this.userRepository.updateUser(realUser);

        return realUser;
    }
}