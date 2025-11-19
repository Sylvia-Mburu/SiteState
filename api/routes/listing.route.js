import express from 'express';
import { createListing, deleteListing, updateListing, getListing, getListings } from '../controllers/listing.controller.js';

const router = express.Router();

// Create a listing
router.post('/create', createListing);

// Delete a listing
router.delete('/delete/:id', deleteListing);

// Update a listing
router.put('/update/:id', updateListing);
router.post('/update/:id', updateListing); // Also support POST for compatibility

// Get a single listing
router.get('/get/:id', getListing);

// Get all listings
router.get('/get', getListings);

export default router;
