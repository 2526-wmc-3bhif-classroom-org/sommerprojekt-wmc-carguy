import {findAllPosts, findAllPostsById} from "./comment-repository";

export function getAllComments(){
    return findAllPosts();
}

export function getAllCommentsById(id: number){
    return findAllPostsById(id);
}