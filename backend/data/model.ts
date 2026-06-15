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
  totalPosts?: number;
  totalComments?: number;
  totalAura?: number;
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
  imageUrls?: string[];
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
  memberCount?: number;
  authorId?: number;
}

export interface Comment {
  cid: number;
  content: string;
  author: User;
  post: Post;
  parentComment?: Comment;
  replies?: Comment[];
  publishedAt: Date;
  imageUrls?: string[];
  likes: number;
  dislikes: number;
}

export interface PostCategory {
  postCategoryId: number;
  postCategoryName: string;
}

export interface ForumCategory {
  forumCategoryId: number;
  forumCategoryName: string;
}

export interface UserInForum {
  uid: number;
  forumId: number;
}

export interface Guide {
  id: number;
  title: string;
  description: string;
  content: string[];
  author: User;
  publishedAt: string;
  likes: number;
  dislikes: number;
}