import express from 'express';
import { deleteUser, test, updateUser, getUserListings, getUser } from '../controllers/user.controller.js';

const router = express.Router();

// Test route
router.get('/test', test);

// Update user
router.put('/update/:id', updateUser);

// Delete user
router.delete('/delete/:id', deleteUser);

// Get user listings
router.get('/listings/:id', getUserListings);

// Get user by ID
router.get('/:id', getUser);

export default router;
