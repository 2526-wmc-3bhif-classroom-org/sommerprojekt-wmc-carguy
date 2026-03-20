import {findAllForums, findForumByCategory, findForumById} from "./forum-repository";

export function getAllForums(){
    return findAllForums();
}

export function getForumById(id:number){
    return findForumById(id);
}

export function getForumByCategory(id:number){
    return findForumByCategory(id);
}