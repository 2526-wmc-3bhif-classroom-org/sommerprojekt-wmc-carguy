export interface User {
  uid: number;
  username: string;
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
  title?: string;
  content: string;
  author: User;
  publishedAt: Date;
  forum: Forum;
  likes: number;
  dislikes: number;
  imageUrls?: string[];
  comments?: Comment[];
  commentCount?: number;
  category?: PostCategory;
  poll?: any;
  parentPost?: Post;
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
  memberCount?: number;
  authorId?: number;
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

export interface Guide {
  id: number;
  title: string;
  description: string;
  content: string[];
  author?: User;
  publishedAt?: string;
  likes?: number;
  dislikes?: number;
}

export interface Shout {
  sid: number;
  content: string;
  author: User;
  publishedAt: string;
}

export interface GarageVehicle {
  gvid: number;
  uid: number;
  make: string;
  model: string;
  year: number;
  mods?: string;
  imageUrl?: string;
}

