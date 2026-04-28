import { Component } from '@angular/core';

export interface Guide {
  id: number;
  title: string;
  description: string;
  readTime: string;
}

@Component({
  selector: 'app-guides',
  standalone: true,
  imports: [],
  templateUrl: './Guides.html',
  styleUrl: './Guides.css'
})
export class GuidesComponent {
  guides: Guide[] = [
    {
      id: 1,
      title: 'Setting Up Your Profile',
      description: 'Learn how to perfectly set up your profile and fill your virtual garage with your favorite cars.',
      readTime: '5 min'
    },
    {
      id: 2,
      title: 'Finding the Right Community',
      description: 'Discover how to find, join, and participate in the best car communities for your interests.',
      readTime: '8 min'
    },
    {
      id: 3,
      title: 'Exploring Brands & Models',
      description: 'A guide to efficiently using our brand directory to learn everything about your dream cars.',
      readTime: '6 min'
    },
    {
      id: 4,
      title: 'Crafting the Perfect Post',
      description: 'Tips & tricks on how to create engaging posts in communities and start discussions.',
      readTime: '7 min'
    },
    {
      id: 5,
      title: 'Connecting with Others',
      description: 'How to use our platform to exchange ideas and connect with other car enthusiasts.',
      readTime: '4 min'
    },
    {
      id: 6,
      title: 'Advanced Search Tips',
      description: 'Master the search function to quickly and precisely find exactly the content, models, or members you are looking for.',
      readTime: '9 min'
    }
  ];
}
