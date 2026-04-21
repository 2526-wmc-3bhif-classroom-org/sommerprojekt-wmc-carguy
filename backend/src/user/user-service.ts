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

    public static checkUserCredentials(user: UserInput): UserClaims | undefined {
        try {
            const users: User[] | undefined = UserRepository.findAllUsers();
            if(users === undefined) throw new Error("No user found");
            const findUserByEmail: User | undefined = users.find((userSearch) => userSearch.email === user.email);
            if(findUserByEmail === undefined) throw new Error("No user found");
            if(!bcrypt.compareSync(user.password, findUserByEmail.password)) throw new Error("Wrong password");
            return {
                email: findUserByEmail.email,
                role: findUserByEmail.role,
            }
        }catch(err) {
            if(err instanceof Error) {
                throw new Error(err.message);
            }
        }
    }

    public static createNewUser(user: User) {
        console.log(user);
        if(user.email === undefined || user.email === null) throw new Error("User credentials are required");
        UserRepository.createNewUser(user);
    }
}