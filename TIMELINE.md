# Timeline Feature

The Timeline is the main feed for logged-in users, showing posts from their gaming community including group posts, user posts, and events.

## Features

- **Real-time Feed**: Shows latest posts from groups and users you follow
- **Post Types**: Displays group posts, user posts, and events
- **Interactive Actions**: Like, comment, and share functionality
- **Pull to Refresh**: Swipe down to refresh the timeline
- **Infinite Scroll**: Automatically loads more posts as you scroll
- **Empty State**: Helpful message when no posts are available

## Post Types

### Group Posts
- **Icon**: `person.3.fill` (blue)
- **Source**: Posts from groups you're a member of
- **Shows**: Group name and author information

### User Posts
- **Icon**: `person.fill` (green)
- **Source**: Posts from users you follow
- **Shows**: Author information only

### Events
- **Icon**: `calendar` (orange)
- **Source**: Gaming events from your groups
- **Shows**: Event details and group information

## API Integration

The timeline integrates with the LFG API:

- `GET /api/timeline/` - Fetch timeline posts with pagination
- Supports pagination with `page` parameter
- Returns posts with author, group, and engagement data

## Components

### TimelinePost Component
Located in `components/TimelinePost.tsx`

**Features:**
- Displays post content with proper formatting
- Shows author information and timestamps
- Interactive like and comment buttons
- Different styling based on post type
- Responsive design for different screen sizes

**Props:**
```typescript
interface TimelinePostProps {
  post: TimelinePostData;
  onLike?: (postId: number) => void;
  onComment?: (postId: number) => void;
}
```

### Timeline Screen
Located in `app/(tabs)/timeline.tsx`

**Features:**
- FlatList for efficient scrolling
- Pull-to-refresh functionality
- Infinite scroll loading
- Loading states and empty states
- Error handling

## Data Structure

```typescript
interface TimelinePostData {
  id: number;
  type: 'group_post' | 'user_post' | 'event';
  title: string;
  content: string;
  author: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    full_name?: string;
  };
  group?: {
    id: number;
    name: string;
  };
  created_at: string;
  updated_at: string;
  likes_count?: number;
  comments_count?: number;
  is_liked?: boolean;
}
```

## User Experience

### Loading States
- Initial loading spinner when first opening timeline
- Pull-to-refresh indicator when refreshing
- Smooth loading of additional posts

### Empty State
- Helpful message when no posts are available
- Suggests joining groups or following users
- Clean, non-intrusive design

### Interactions
- **Like**: Tap heart icon to like/unlike posts
- **Comment**: Tap comment icon to view/add comments
- **Share**: Tap share icon to share posts
- **Refresh**: Pull down to refresh timeline

## Styling

The timeline uses a clean, card-based design:
- White cards with subtle shadows
- Color-coded icons for different post types
- Consistent spacing and typography
- Responsive layout for different screen sizes

## Future Enhancements

- **Real-time Updates**: WebSocket integration for live updates
- **Post Creation**: Ability to create new posts from timeline
- **Advanced Filtering**: Filter by post type or group
- **Search**: Search through timeline posts
- **Notifications**: Push notifications for new posts

## Testing

To test the timeline feature:

1. **Login**: Use valid credentials to access the app
2. **Navigate**: Go to the Timeline tab
3. **Refresh**: Pull down to refresh the timeline
4. **Scroll**: Scroll down to load more posts
5. **Interact**: Tap like/comment buttons (currently console logs)

The timeline provides a comprehensive social feed experience for your LFG gaming community!
