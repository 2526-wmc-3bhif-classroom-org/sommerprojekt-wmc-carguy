import { User } from "../../data/model";
import { UserRepository } from "./user-repository";

export class UserService {

    constructor(private userRepository: UserRepository) {}

    public getAllUsers(): User[] {
        return this.userRepository.findAllUsers();
    }

    public getUserById(id: number): User | undefined {
        return this.userRepository.findUserById(id);
    }
}