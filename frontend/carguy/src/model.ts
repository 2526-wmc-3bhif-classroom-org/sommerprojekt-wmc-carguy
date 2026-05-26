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
  totalPosts?: number;
  totalComments?: number;
  totalAura?: number;
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
  imageUrls?: string[];
  comments?: Comment[];
  commentCount?: number;
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

export interface Forum {
  forumId: number;
  name: string;
  description?: string;
  parentForum?: Forum;
  subForums?: Forum[];
  posts?: Post[];
  postCount?: number;
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
