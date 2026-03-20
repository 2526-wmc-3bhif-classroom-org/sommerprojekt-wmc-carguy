import {findPostById, findPostByUser, findPostByForum, findAllPosts, findPostByCategory} from "./post-repository";

export function getAllPosts(){
    return findAllPosts();
}

export function getPostById(id:number){
    return findPostById(id);
}

export function getPostByForum(id:number){
    return findPostByForum(id);
}

export function getPostByUser(id:number){
    return findPostByUser(id);
}

export function getPostByCategory(id:number){
    return findPostByCategory(id);
}