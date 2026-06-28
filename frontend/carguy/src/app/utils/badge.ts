import { User } from '../../model';

export interface Badge {
  name: string;
  icon: string;
  class: string;
  tooltip: string;
}

export function getUserBadges(user?: User | null): Badge[] {
  if (!user) return [];
  const badges: Badge[] = [];

  if (user.role === 'admin' || user.username === 'admin') {
    badges.push({
      name: 'Admin',
      icon: '🛡️',
      class: 'bg-red-500/10 text-red-400 border border-red-500/20',
      tooltip: 'Platform Administrator'
    });
  }

  const aura = user.totalAura || 0;
  if (aura >= 500) {
    badges.push({
      name: 'Master Tuner',
      icon: '🔧',
      class: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
      tooltip: 'Master Tuner (500+ Aura)'
    });
  } else if (aura >= 200) {
    badges.push({
      name: 'Gearhead',
      icon: '🏎️',
      class: 'bg-accent/10 text-accent border border-accent/20',
      tooltip: 'Gearhead (200+ Aura)'
    });
  } else if (aura >= 100) {
    badges.push({
      name: 'Enthusiast',
      icon: '🏁',
      class: 'bg-primary/10 text-primary border border-primary/20',
      tooltip: 'Enthusiast (100+ Aura)'
    });
  }

  const postsCount = user.totalPosts || 0;
  if (postsCount >= 10) {
    badges.push({
      name: 'Super Poster',
      icon: '✍️',
      class: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
      tooltip: 'Super Poster (10+ Posts)'
    });
  }

  const commentsCount = user.totalComments || 0;
  if (commentsCount >= 20) {
    badges.push({
      name: 'Chatterbox',
      icon: '💬',
      class: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
      tooltip: 'Chatterbox (20+ Comments)'
    });
  }

  return badges;
}
