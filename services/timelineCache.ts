import { TimelinePost } from './api';

interface TimelineCacheState {
  posts: Map<number, TimelinePost>;
  postIds: number[];
  sinceCursor?: string;
  beforeCursor?: string;
  hasMore: boolean;
  isLoading: boolean;
  lastFetchScope?: 'refresh' | 'older';
  lastFetchTime?: number;
}

interface FetchScope {
  type: 'refresh' | 'older';
  timestamp: number;
}

class TimelineCacheService {
  private state: TimelineCacheState = {
    posts: new Map(),
    postIds: [],
    hasMore: true,
    isLoading: false,
  };

  private currentFetchScope?: FetchScope;

  // Get all posts in chronological order (newest first)
  getPosts(): TimelinePost[] {
    return this.state.postIds
      .map(id => this.state.posts.get(id))
      .filter((post): post is TimelinePost => post !== undefined)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  // Get current cursors
  getCursors() {
    return {
      since: this.state.sinceCursor,
      before: this.state.beforeCursor,
    };
  }

  // Check if we can load more
  canLoadMore(): boolean {
    return this.state.hasMore && !this.state.isLoading;
  }

  // Check if we can refresh
  canRefresh(): boolean {
    return !this.state.isLoading;
  }

  // Set loading state
  setLoading(isLoading: boolean) {
    this.state.isLoading = isLoading;
  }

  // Check if a fetch scope is still current
  private isCurrentFetchScope(scope: FetchScope): boolean {
    return this.currentFetchScope === undefined || 
           this.currentFetchScope.timestamp <= scope.timestamp;
  }

  // Merge new posts idempotently
  private mergePosts(newPosts: TimelinePost[], scope: FetchScope): void {
    if (!this.isCurrentFetchScope(scope)) {
      console.log('🚫 Ignoring stale fetch response');
      return;
    }

    console.log('📝 Merging posts:', newPosts.length, 'new posts');
    
    let addedCount = 0;
    let updatedCount = 0;

    for (const post of newPosts) {
      const existingPost = this.state.posts.get(post.id);
      
      if (existingPost) {
        // Update existing post (handles edits/deletes)
        this.state.posts.set(post.id, post);
        updatedCount++;
      } else {
        // Add new post
        this.state.posts.set(post.id, post);
        this.state.postIds.push(post.id);
        addedCount++;
      }
    }

    console.log(`📊 Merge complete: +${addedCount} new, ~${updatedCount} updated`);
  }

  // Update cursors based on fetch scope
  private updateCursors(newItems: TimelinePost[], scope: FetchScope): void {
    if (!this.isCurrentFetchScope(scope)) {
      return;
    }

    if (newItems.length > 0) {
      if (scope.type === 'refresh') {
        // For refresh, update since cursor to the newest item
        const newestItem = newItems.reduce((newest, current) => 
          new Date(current.created_at) > new Date(newest.created_at) ? current : newest
        );
        this.state.sinceCursor = newestItem.created_at;
      } else if (scope.type === 'older') {
        // For older, update before cursor to the oldest item
        const oldestItem = newItems.reduce((oldest, current) => 
          new Date(current.created_at) < new Date(oldest.created_at) ? current : oldest
        );
        this.state.beforeCursor = oldestItem.created_at;
      }
    }
  }

  // Process refresh response
  processRefreshResponse(newPosts: TimelinePost[], hasMore: boolean, nextCursor?: string): void {
    const scope: FetchScope = {
      type: 'refresh',
      timestamp: Date.now(),
    };

    if (!this.isCurrentFetchScope(scope)) {
      console.log('🚫 Ignoring stale refresh response');
      return;
    }

    this.currentFetchScope = scope;
    this.state.lastFetchScope = 'refresh';
    this.state.lastFetchTime = scope.timestamp;

    // For refresh, prepend new posts to the beginning
    this.mergePosts(newPosts, scope);
    
    // Update since cursor
    if (newPosts.length > 0) {
      const newestItem = newPosts.reduce((newest, current) => 
        new Date(current.created_at) > new Date(newest.created_at) ? current : newest
      );
      this.state.sinceCursor = newestItem.created_at;
    }

    this.state.hasMore = hasMore;
    this.state.isLoading = false;

    console.log('🔄 Refresh processed:', {
      newPosts: newPosts.length,
      totalPosts: this.state.posts.size,
      hasMore,
      sinceCursor: this.state.sinceCursor,
    });
  }

  // Process older posts response
  processOlderResponse(newPosts: TimelinePost[], hasMore: boolean, prevCursor?: string): void {
    const scope: FetchScope = {
      type: 'older',
      timestamp: Date.now(),
    };

    if (!this.isCurrentFetchScope(scope)) {
      console.log('🚫 Ignoring stale older response');
      return;
    }

    this.currentFetchScope = scope;
    this.state.lastFetchScope = 'older';
    this.state.lastFetchTime = scope.timestamp;

    // For older posts, append to the end
    this.mergePosts(newPosts, scope);
    
    // Update before cursor
    if (newPosts.length > 0) {
      const oldestItem = newPosts.reduce((oldest, current) => 
        new Date(current.created_at) < new Date(oldest.created_at) ? current : oldest
      );
      this.state.beforeCursor = oldestItem.created_at;
    }

    this.state.hasMore = hasMore;
    this.state.isLoading = false;

    console.log('📜 Older posts processed:', {
      newPosts: newPosts.length,
      totalPosts: this.state.posts.size,
      hasMore,
      beforeCursor: this.state.beforeCursor,
    });
  }

  // Clear cache (useful for logout)
  clear(): void {
    this.state = {
      posts: new Map(),
      postIds: [],
      hasMore: true,
      isLoading: false,
    };
    this.currentFetchScope = undefined;
    console.log('🧹 Timeline cache cleared');
  }

  // Get cache statistics
  getStats() {
    return {
      totalPosts: this.state.posts.size,
      isLoading: this.state.isLoading,
      hasMore: this.state.hasMore,
      sinceCursor: this.state.sinceCursor,
      beforeCursor: this.state.beforeCursor,
      lastFetchScope: this.state.lastFetchScope,
      lastFetchTime: this.state.lastFetchTime,
    };
  }
}

export const timelineCache = new TimelineCacheService();
