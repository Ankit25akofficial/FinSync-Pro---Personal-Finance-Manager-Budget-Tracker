import { clerkClient } from '@clerk/express';

// Middleware to verify Clerk authentication
export const requireAuth = async (req, res, next) => {
  try {
    const { userId } = req.auth;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized - No user ID found' });
    }
    
    // Get user from Clerk
    const user = await clerkClient.users.getUser(userId);
    
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized - User not found' });
    }
    
    // Attach user info to request
    req.user = {
      userId: user.id,
      email: user.emailAddresses[0]?.emailAddress,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.publicMetadata?.role || 'user'
    };
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ error: 'Unauthorized - Invalid token' });
  }
};

// Middleware to check admin role
export const requireAdmin = async (req, res, next) => {
  try {
    await requireAuth(req, res, () => {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden - Admin access required' });
      }
      next();
    });
  } catch (error) {
    res.status(403).json({ error: 'Forbidden - Admin access required' });
  }
};

