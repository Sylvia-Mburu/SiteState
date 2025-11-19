import { Clerk } from '@clerk/clerk-sdk-node';
import { errorHandler } from '../utils/error.js';

const clerk = new Clerk({ apiKey: process.env.CLERK_SECRET_KEY });

export const verifyClerkUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(errorHandler(401, 'Unauthorized - No token provided'));
    }

    const token = authHeader.split(' ')[1];
    
    try {
      const session = await clerk.sessions.verifySession(token);
      req.user = { id: session.userId };
      next();
    } catch (error) {
      return next(errorHandler(401, 'Unauthorized - Invalid token'));
    }
  } catch (error) {
    next(error);
  }
};

// Alternative middleware that accepts Clerk user ID from request body/query
export const verifyClerkUserOptional = async (req, res, next) => {
  try {
    const userId = req.headers['x-clerk-user-id'] || req.body.userId || req.query.userId;
    
    if (userId) {
      try {
        await clerk.users.getUser(userId);
        req.user = { id: userId };
      } catch (error) {
        // If user doesn't exist in Clerk, still allow but log
        console.log('User not found in Clerk:', userId);
      }
    }
    next();
  } catch (error) {
    next();
  }
};

