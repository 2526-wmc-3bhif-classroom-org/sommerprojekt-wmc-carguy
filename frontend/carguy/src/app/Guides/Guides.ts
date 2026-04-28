import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Guide {
  id: number;
  title: string;
  description: string;
  readTime: string;
  content: string[];
}

@Component({
  selector: 'app-guides',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './Guides.html',
  styleUrl: './Guides.css'
})
export class GuidesComponent implements OnDestroy {
  selectedGuide: Guide | null = null;
  guides: Guide[] = [
    {
      id: 1,
      title: 'Setting Up Your Profile',
      description: 'Learn how to perfectly set up your profile and fill your virtual garage with your favorite cars.',
      readTime: '5 min',
      content: [
        'First, navigate to your profile page by clicking your avatar in the top right corner.',
        'Click on "Edit Profile" to add a personal bio, social links, and upload a profile picture that represents you.',
        'To build your "Virtual Garage", click the "Add Vehicle" button. You can specify the make, model, year, and even upload photos of your actual car.',
        'Don\'t forget to save your changes!'
      ]
    },
    {
      id: 2,
      title: 'Finding the Right Community',
      description: 'Discover how to find, join, and participate in the best car communities for your interests.',
      readTime: '8 min',
      content: [
        'Navigate to the "Communities" tab using the main navigation bar.',
        'You can browse through curated categories (like JDM, Muscle, or Euro) or use the search bar to find niche groups.',
        'Once you find a community you like, click the "Join" button on the community card.',
        'Introduce yourself in the community\'s main feed to start interacting with other enthusiasts!'
      ]
    },
    {
      id: 3,
      title: 'Exploring Brands & Models',
      description: 'A guide to efficiently using our brand directory to learn everything about your dream cars.',
      readTime: '6 min',
      content: [
        'Click on "Brands" in the top navigation to view our comprehensive list of car manufacturers.',
        'You can search for specific brands or sort them by popularity and region.',
        'Clicking on a brand card will take you to its dedicated page, where you can see all their popular models, historical specs, and user reviews.',
        'Use this section to research your next project car or dream build.'
      ]
    },
    {
      id: 4,
      title: 'Crafting the Perfect Post',
      description: 'Tips & tricks on how to create engaging posts in communities and start discussions.',
      readTime: '7 min',
      content: [
        'Go to a community you have joined and click the "Create Post" button.',
        'Start with a catchy, descriptive title so people know exactly what you are talking about.',
        'In the description, provide enough context. If you are asking a mechanical question, include your car\'s exact year, make, and model.',
        'Always try to attach high-quality photos. Car guys love pictures! A good photo can drastically increase your post\'s engagement.'
      ]
    },
    {
      id: 5,
      title: 'Connecting with Others',
      description: 'How to use our platform to exchange ideas and connect with other car enthusiasts.',
      readTime: '4 min',
      content: [
        'The best way to connect is by being active in the comment sections of posts you find interesting.',
        'Share your automotive knowledge, offer help to those asking questions, and be respectful to everyone.',
        'If you find a user with a similar build or interests, click on their profile and check out their garage.',
        'Building a network makes the CarGuy experience much more enjoyable.'
      ]
    },
    {
      id: 6,
      title: 'Advanced Search Tips',
      description: 'Master the search function to quickly and precisely find exactly the content, models, or members you are looking for.',
      readTime: '9 min',
      content: [
        'Use the global search bar in the top navigation to look for specific topics.',
        'You can filter your results to only show "Communities", "Brands", or specific "Posts".',
        'For exact matches, wrap your search query in quotes. For example: "Porsche 911 GT3".',
        'Use keywords like "help" or "build" alongside your car model to find relevant project threads.'
      ]
    }
  ];

  openGuide(guide: Guide): void {
    this.selectedGuide = guide;
    // Prevent scrolling on the background when modal is open
    document.body.style.overflow = 'hidden';
  }

  closeGuide(): void {
    this.selectedGuide = null;
    // Restore scrolling
    document.body.style.overflow = 'auto';
  }

  // Ensure we restore scrolling if the user navigates away while the modal is open
  ngOnDestroy(): void {
    document.body.style.overflow = 'auto';
  }
}
