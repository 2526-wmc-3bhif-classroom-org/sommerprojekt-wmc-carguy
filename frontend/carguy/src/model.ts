export interface User {
  uid: number;
  username: string;
  email?: string;
  password?: string;
  publicname: string;
  role: string;
  description?: string;
  title?: string;
  image?: string;
  createdAt: Date;
  posts?: Post[];
  comments?: Comment[];
}

export interface Post {
  pid: number;
  title: string;
  content: string;
  author: User;
  publishedAt: Date;
  forum: Forum;
  likes: number;
  dislikes: number;
  comments?: Comment[];
}

export interface Comment {
  cid: number;
  content: string;
  author: User;
  post: Post;
  parentComment?: Comment;
  replies?: Comment[];
  publishedAt: Date;
  likes: number;
  dislikes: number;
}

export interface Forum {
  forumId: number;
  name: string;
  description?: string;
  parentForum?: Forum;
  subForums?: Forum[];
  posts?: Post[];
  createdAt: Date;
}

export interface PostCategory {
  postCategoryId: number;
  postCategoryName: string;
}

export interface ForumCategory {
  forumCategoryId: number;
  forumCategoryName: string;
}
