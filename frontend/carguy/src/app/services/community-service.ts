import { Injectable } from '@angular/core';

export interface Community {
  id: number;
  name: string;
  description: string;
  category: string;
  members: number;
  posts: number;
  visibility: 'public' | 'private';
  verified: boolean;
  color?: string;
  trending?: boolean;
  activity?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CommunityService {

  private featuredCommunities: Community[] = [
    {
      id: 1,
      name: 'Track Day Warriors',
      description: 'For enthusiasts who live for the track. Share lap times, racing techniques, and track day experiences.',
      category: 'Racing',
      members: 12400,
      posts: 45600,
      visibility: 'public',
      verified: true,
      color: '#21897E',
      trending: true,
    },
    {
      id: 2,
      name: 'Electric Future',
      description: 'Discussing the transition to electric vehicles, charging infrastructure, and EV technology.',
      category: 'Technology',
      members: 18700,
      posts: 67800,
      visibility: 'public',
      verified: true,
      color: '#3BA99C',
      trending: true,
    },
    {
      id: 3,
      name: 'Vintage Restoration',
      description: 'Classic car restoration projects, sourcing parts, and preserving automotive history.',
      category: 'Restoration',
      members: 9200,
      posts: 34500,
      visibility: 'public',
      verified: true,
      color: '#69D1C5',
      trending: false,
    },
    {
      id: 4,
      name: 'Performance Tuning Lab',
      description: 'ECU tuning, dyno results, and performance modifications for maximum power.',
      category: 'Performance',
      members: 15600,
      posts: 52300,
      visibility: 'public',
      verified: true,
      color: '#7EBCE6',
      trending: true,
    }
  ];

  private allCommunities: Community[] = [
    {
      id: 1,
      name: 'Track Day Warriors',
      description: 'For enthusiasts who live for the track. Share lap times, racing techniques, and track day experiences.',
      category: 'Racing',
      members: 12400,
      posts: 45600,
      visibility: 'public',
      verified: true,
      color: '#21897E',
      trending: true,
    },
    {
      id: 2,
      name: 'Electric Future',
      description: 'Discussing the transition to electric vehicles, charging infrastructure, and EV technology.',
      category: 'Technology',
      members: 18700,
      posts: 67800,
      visibility: 'public',
      verified: true,
      color: '#3BA99C',
      trending: true,
    },
    {
      id: 3,
      name: 'Vintage Restoration',
      description: 'Classic car restoration projects, sourcing parts, and preserving automotive history.',
      category: 'Restoration',
      members: 9200,
      posts: 34500,
      visibility: 'public',
      verified: true,
      color: '#69D1C5',
      trending: false,
    },
    {
      id: 4,
      name: 'Performance Tuning Lab',
      description: 'ECU tuning, dyno results, and performance modifications for maximum power.',
      category: 'Performance',
      members: 15600,
      posts: 52300,
      visibility: 'public',
      verified: true,
      color: '#7EBCE6',
      trending: true,
    },
    {
      id: 5,
      name: 'Weekend Cruisers',
      description: 'Sunday drives, scenic routes, and casual car meets for weekend warriors.',
      category: 'Social',
      members: 8900,
      posts: 23400,
      visibility: 'public',
      verified: false,
      activity: 'Very Active',
    },
    {
      id: 6,
      name: 'DIY Detailing Pros',
      description: 'Learn professional detailing techniques, product reviews, and paint correction.',
      category: 'Detailing',
      members: 11200,
      posts: 38700,
      visibility: 'public',
      verified: false,
      activity: 'Active',
    },
    {
      id: 7,
      name: 'Supercar Owners Club',
      description: 'Exclusive community for supercar owners. Share experiences and connect with fellow enthusiasts.',
      category: 'Luxury',
      members: 3400,
      posts: 12800,
      visibility: 'private',
      verified: true,
      activity: 'Active',
    },
    {
      id: 8,
      name: 'Off-Road Adventures',
      description: 'Trail riding, overlanding, and 4x4 modifications for the adventurous.',
      category: 'Off-Road',
      members: 7600,
      posts: 28900,
      visibility: 'public',
      verified: false,
      activity: 'Very Active',
    },
    {
      id: 12,
      name: 'Motorsport Fanatics',
      description: 'Discussing F1, NASCAR, WEC, and all forms of professional motorsport.',
      category: 'Racing',
      members: 21500,
      posts: 89400,
      visibility: 'public',
      verified: true,
      activity: 'Very Active',
    }
  ];

  private categories = [
    { name: 'Racing', count: 23, color: '#21897E' },
    { name: 'Technology', count: 18, color: '#3BA99C' },
    { name: 'Restoration', count: 15, color: '#69D1C5' },
    { name: 'Performance', count: 31, color: '#7EBCE6' },
    { name: 'Social', count: 42, color: '#f43098' },
    { name: 'Detailing', count: 12, color: '#00d390' },
    { name: 'Luxury', count: 8, color: '#ff627d' },
    { name: 'Off-Road', count: 19, color: '#21897E' }
  ];

  private trendingTopics = [
    { topic: 'EV Charging Infrastructure', posts: 1543 },
    { topic: 'Summer Tire Recommendations', posts: 1287 },
    { topic: 'Track Day Insurance', posts: 982 },
    { topic: 'Ceramic Coating vs PPF', posts: 876 },
    { topic: 'Best Dashcams 2026', posts: 743 },
  ];

  getFeatured() { return this.featuredCommunities; }
  getAll() { return this.allCommunities; }
  getCategories() { return this.categories; }
  getTrending() { return this.trendingTopics; }
}
