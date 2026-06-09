import { Post, User, Forum } from "../../model";

const API_BASE_URL = "http://localhost:3000/api";

export interface SearchResults {
  posts: Post[];
  users: User[];
  communities: Forum[];
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Request failed with status ${response.status}`);
  }
  return response.json();
}

export const SearchService = {
  async search(query: string): Promise<SearchResults> {
    if (!query || query.trim() === "") {
      return { posts: [], users: [], communities: [] };
    }
    const res = await fetch(`${API_BASE_URL}/search?q=${encodeURIComponent(query)}`);
    return handleResponse<SearchResults>(res);
  }
};
