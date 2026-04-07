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
      title: 'Getting Started with CarGuy',
      description: 'Learn the basics of our platform, how to set up your profile, and start exploring car brands.',
      readTime: '5 min'
    },
    {
      id: 2,
      title: 'Finding the Right Community',
      description: 'Discover how to search, filter, and join the best car communities that match your interests.',
      readTime: '8 min'
    },
    {
      id: 3,
      title: 'Advanced Search Tips',
      description: 'Take your search skills to the next level with our advanced filtering and sorting options.',
      readTime: '6 min'
    },
    {
      id: 4,
      title: 'Managing Your Garage',
      description: 'A comprehensive guide on how to add, edit, and showcase your vehicles in your virtual garage.',
      readTime: '10 min'
    },
    {
      id: 5,
      title: 'Connecting with Enthusiasts',
      description: 'Tips and etiquette for messaging and connecting with other car enthusiasts on the platform.',
      readTime: '4 min'
    },
    {
      id: 6,
      title: 'Troubleshooting Common Issues',
      description: 'Quick fixes and solutions for the most commonly encountered issues on the platform.',
      readTime: '7 min'
    }
  ];
}
