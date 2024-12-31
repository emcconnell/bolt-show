const LIKES_KEY = 'bolt_showcase_likes';

class LikeStorageService {
  private static instance: LikeStorageService;
  private likedProjects: Set<string>;

  private constructor() {
    this.likedProjects = new Set();
    this.loadLikedProjects();
  }

  static getInstance(): LikeStorageService {
    if (!LikeStorageService.instance) {
      LikeStorageService.instance = new LikeStorageService();
    }
    return LikeStorageService.instance;
  }

  private loadLikedProjects(): void {
    try {
      const storedLikes = localStorage.getItem(LIKES_KEY);
      if (storedLikes) {
        this.likedProjects = new Set(JSON.parse(storedLikes));
      }
    } catch (error) {
      console.error('[LikeStorage] Failed to load likes:', error);
      this.likedProjects.clear();
    }
  }

  private saveLikedProjects(): void {
    try {
      localStorage.setItem(LIKES_KEY, JSON.stringify([...this.likedProjects]));
    } catch (error) {
      console.error('[LikeStorage] Failed to save likes:', error);
    }
  }

  hasLiked(projectId: string): boolean {
    return this.likedProjects.has(projectId);
  }

  async likeProject(projectId: string): Promise<boolean> {
    if (this.hasLiked(projectId)) {
      return false;
    }

    this.likedProjects.add(projectId);
    this.saveLikedProjects();
    return true;
  }
}

export const likeStorage = LikeStorageService.getInstance();