import {findAllUsers, findUserById} from "./user-repository";

export function getAllUsers() {
    return findAllUsers();
}

export function getUserById(id: number) {
    return findUserById(id)
}