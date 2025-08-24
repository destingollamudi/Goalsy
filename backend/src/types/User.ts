export interface User {
  uid: string;
  username: string;           // stored lowercase
  displayUsername: string;    // original case for display
  displayName: string;
  email: string;
  emailVerified: boolean;     // track verification status
  photoURL?: string;
  bio?: string;
  privacy: 'public' | 'followers' | 'private';
  followerCount: number;
  followingCount: number;
  goalCount: number;          // total ever created
  streakCount: number;        // best streak ever
  bestStreakGoalId?: string;  // links to the goal with best streak
  joinDate: number;
  lastActive: number;
  profileComplete: boolean;   // has username/displayName been set?
  settings: UserSettings;
}

export interface UserSettings {
  notifications: {
    likes: boolean;
    comments: boolean;
    follows: boolean;
    streakReminders: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'followers' | 'private';
    goalVisibility: 'public' | 'followers' | 'private';
  };
}

export interface CreateUserInput {
  email: string;
  password: string;
  username: string;
  displayName: string;
  bio?: string;
}

// Username validation
export function isValidUsername(username: string): boolean {
  if (!username || typeof username !== 'string') return false;
  if (username.length < 3 || username.length > 30) return false;
  
  const validPattern = /^[a-zA-Z0-9._]+$/;
  return validPattern.test(username);
}

// Normalize username (store lowercase, validate uniqueness)
export function normalizeUsername(username: string): string {
  return username.toLowerCase().trim();
}