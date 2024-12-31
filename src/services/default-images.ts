export const DEFAULT_PROFILE_IMAGES = [
  {
    id: 'knight-alt',
    url: '/images/noun-knight-swordsman-4016881-FFFFFF.png',
    category: 'avatar',
    description: 'Valiant Knight Avatar'
  },
  {
    id: 'wizard',
    url: '/images/noun-wizard-4016879-FFFFFF.png',
    category: 'avatar',
    description: 'Mystical Wizard Avatar'
  },
  {
    id: 'alchemist',
    url: '/images/noun-alchemist-4016870-FFFFFF.png',
    category: 'avatar',
    description: 'Skilled Alchemist Avatar'
  },
  {
    id: 'samurai',
    url: '/images/noun-samurai-4016872-FFFFFF.png',
    category: 'avatar',
    description: 'Honorable Samurai Avatar'
  },
  {
    id: 'dragonborn',
    url: '/images/noun-dragonborn-spear-4016875-FFFFFF.png',
    category: 'avatar',
    description: 'Mighty Dragonborn Avatar'
  },
  {
    id: 'adventurer',
    url: '/images/noun-adventurer-female-4016867-FFFFFF.png',
    category: 'avatar',
    description: 'Brave Adventurer Avatar'
  },
  {
    id: 'martial-artist',
    url: '/images/noun-martial-art-female-4016877-FFFFFF.png',
    category: 'avatar',
    description: 'Skilled Martial Artist Avatar'
  },
  {
    id: 'priest',
    url: '/images/noun-priest-female-4016871-FFFFFF.png',
    category: 'avatar',
    description: 'Holy Priest Avatar'
  },
  {
    id: 'monk',
    url: '/images/noun-fighter-monk-4016880-FFFFFF.png',
    category: 'avatar',
    description: 'Disciplined Monk Avatar'
  }
];

export function getRandomDefaultImage() {
  const randomIndex = Math.floor(Math.random() * DEFAULT_PROFILE_IMAGES.length);
  return DEFAULT_PROFILE_IMAGES[randomIndex];
}

export function getDefaultImageById(id: string) {
  return DEFAULT_PROFILE_IMAGES.find(img => img.id === id);
}

export function getDefaultImagesByCategory(category: string) {
  return DEFAULT_PROFILE_IMAGES.filter(img => img.category === category);
}