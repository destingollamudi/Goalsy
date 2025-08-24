import { db } from '../config/firebase';
import { User, CreateUserInput, isValidUsername, normalizeUsername } from '../types/User';
import { IUserService } from '../interfaces/IUserService';

export class FirebaseUserService implements IUserService {
  private usersCollection = db.collection('users');

  async isUsernameAvailable(username: string): Promise<boolean> {
    if (!isValidUsername(username)) {
      throw new Error('Invalid username format');
    }

    const normalizedUsername = normalizeUsername(username);
    const snapshot = await this.usersCollection
      .where('username', '==', normalizedUsername)
      .limit(1)
      .get();

    return snapshot.empty;
  }

  async createUser(uid: string, userData: CreateUserInput): Promise<User> {
    // Same implementation as before...
    if (!isValidUsername(userData.username)) {
      throw new Error('Invalid username format');
    }

    const isAvailable = await this.isUsernameAvailable(userData.username);
    if (!isAvailable) {
      throw new Error('Username already taken');
    }

    const now = Date.now();
    const normalizedUsername = normalizeUsername(userData.username);

    const user: User = {
      uid,
      username: normalizedUsername,
      displayUsername: userData.username,
      displayName: userData.displayName,
      email: userData.email,
      emailVerified: false,
      bio: userData.bio || '',
      privacy: 'public',
      followerCount: 0,
      followingCount: 0,
      goalCount: 0,
      streakCount: 0,
      joinDate: now,
      lastActive: now,
      profileComplete: true,
      settings: {
        notifications: {
          likes: true,
          comments: true,
          follows: true,
          streakReminders: true,
        },
        privacy: {
          profileVisibility: 'public',
          goalVisibility: 'public',
        },
      },
    };

    await this.usersCollection.doc(uid).set(user);
    return user;
  }

  async getUserByUid(uid: string): Promise<User | null> {
    const doc = await this.usersCollection.doc(uid).get();
    return doc.exists ? (doc.data() as User) : null;
  }

  async getUserByUsername(username: string): Promise<User | null> {
    const normalizedUsername = normalizeUsername(username);
    const snapshot = await this.usersCollection
      .where('username', '==', normalizedUsername)
      .limit(1)
      .get();

    if (snapshot.empty) return null;
    return snapshot.docs[0].data() as User;
  }

  async updateProfile(uid: string, updates: Partial<User>): Promise<User> {
    const allowedUpdates = {
      displayName: updates.displayName,
      bio: updates.bio,
      photoURL: updates.photoURL,
      privacy: updates.privacy,
      settings: updates.settings,
      lastActive: Date.now(),
    };

    const cleanUpdates = Object.fromEntries(
      Object.entries(allowedUpdates).filter(([_, value]) => value !== undefined)
    );

    await this.usersCollection.doc(uid).update(cleanUpdates);
    
    const updatedUser = await this.getUserByUid(uid);
    if (!updatedUser) throw new Error('User not found after update');
    
    return updatedUser;
  }

  async searchUsers(query: string): Promise<User[]> {
    // Simple implementation for now
    const snapshot = await this.usersCollection
      .where('displayName', '>=', query)
      .where('displayName', '<=', query + '\uf8ff')
      .limit(10)
      .get();

    return snapshot.docs.map(doc => doc.data() as User);
  }
}