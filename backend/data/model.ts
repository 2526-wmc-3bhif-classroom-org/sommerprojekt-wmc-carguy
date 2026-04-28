import {JwtPayload} from "jsonwebtoken";

export interface AuthRequest extends Request {
  payload: JwtPayload
}

export interface UserLogin {
  userName: string,
  password: string,
  role: string
}

export interface UserClaims {
  username: string,
  role: string
}

export interface UserInput {
  publicname?: string,
  username: string,
  password: string
}

export interface User {
  uid: number;
  username: string;
  password: string;
  publicname: string;
  role: string;
  description?: string;
  title?: string;
  image?: string;
  createdAt: Date;
  posts?: Post[];
}

export interface Post {
  pid: number;
  title?: string;
  content: string;
  author: User;
  forum: Forum;
  parentPost?: Post;
  replies?: Post[];
  publishedAt: Date;
  likes: number;
  dislikes: number;
  category?: PostCategory;
}

export interface Forum {
  forumId: number;
  name: string;
  description?: string;
  parentForum?: Forum;
  subForums?: Forum[];
  posts?: Post[];
  createdAt: Date;
  category?: ForumCategory;
}

export interface PostCategory {
  postCategoryId: number;
  postCategoryName: string;
}

export interface ForumCategory {
  forumCategoryId: number;
  forumCategoryName: string;
}