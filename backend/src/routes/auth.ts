import express from 'express';
import ServiceContainer from '../container/ServiceContainer';
import { authenticateToken, requireEmailVerification } from '../middleware/auth';
import { CreateUserInput } from '../types/User';

const router = express.Router();

// Check username availability (no auth needed)
router.get('/check-username/:username', async (req, res) => {
  try {
    const userService = ServiceContainer.getInstance().getUserService();
    const { username } = req.params;
    const isAvailable = await userService.isUsernameAvailable(username);
    
    res.json({ 
      username,
      available: isAvailable,
      valid: require('../types/User').isValidUsername(username)
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Get current user profile
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const userService = ServiceContainer.getInstance().getUserService();
    
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const user = await userService.getUserByUid(req.user.uid);
    
    if (!user) {
      return res.status(404).json({ 
        error: 'Profile not found',
        code: 'PROFILE_INCOMPLETE'
      });
    }

    res.json({ user });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Complete profile after Firebase Auth registration
router.post('/complete-profile', authenticateToken, requireEmailVerification, async (req, res) => {
  try {
    const userService = ServiceContainer.getInstance().getUserService();
    const { username, displayName, bio } = req.body;
    
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Check if user already exists
    const existingUser = await userService.getUserByUid(req.user.uid);
    if (existingUser) {
      return res.status(400).json({ error: 'Profile already completed' });
    }

    const userData: CreateUserInput = {
      email: req.user.email!,
      password: '', // Not needed since Firebase Auth handles this
      username,
      displayName,
      bio: bio || ''
    };

    const user = await userService.createUser(req.user.uid, userData);
    
    res.json({ 
      success: true, 
      message: 'Profile completed successfully',
      user 
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;