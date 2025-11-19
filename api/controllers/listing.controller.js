import Listing from '../models/listing.model.js';
import { errorHandler } from '../utils/error.js';

export const createListing = async (req, res, next) => {
  try {
    // Get user ID from request (sent from frontend with Clerk user ID)
    const userId = req.body.userRef || req.headers['x-clerk-user-id'];
    
    console.log('Creating listing for user:', userId);
    console.log('Request body userRef:', req.body.userRef);
    console.log('Request header user ID:', req.headers['x-clerk-user-id']);
    
    if (!userId) {
      return next(errorHandler(401, 'User ID is required'));
    }

    const listingData = {
      ...req.body,
      userRef: userId,
    };

    console.log('Listing data to create:', { ...listingData, imageUrls: listingData.imageUrls?.length || 0 });

    const listing = await Listing.create(listingData);
    console.log('Listing created successfully:', { id: listing._id, name: listing.name, userRef: listing.userRef });
    return res.status(201).json(listing);
  } catch (error) {
    console.error('Error creating listing:', error);
    next(error);
  }
};

export const deleteListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return next(errorHandler(404, 'Listing not found!'));
    }

    // Get user ID from request
    const userId = req.body.userId || req.headers['x-clerk-user-id'] || req.query.userId;

    if (!userId) {
      return next(errorHandler(401, 'User ID is required'));
    }

    if (userId !== listing.userRef) {
      return next(errorHandler(401, 'You can only delete your own listings!'));
    }

    await Listing.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Listing has been deleted!' });
  } catch (error) {
    next(error);
  }
};

export const updateListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);
    
    if (!listing) {
      return next(errorHandler(404, 'Listing not found!'));
    }

    // Get user ID from request
    const userId = req.body.userRef || req.headers['x-clerk-user-id'] || req.query.userId;

    if (!userId) {
      return next(errorHandler(401, 'User ID is required'));
    }

    if (userId !== listing.userRef) {
      return next(errorHandler(401, 'You can only update your own listings!'));
    }

    const updatedListing = await Listing.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.status(200).json(updatedListing);
  } catch (error) {
    next(error);
  }
};

export const getListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return next(errorHandler(404, 'Listing not found!'));
    }
    res.status(200).json(listing);
  } catch (error) {
    next(error);
  }
};

export const getListings = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 9;
    const startIndex = parseInt(req.query.startIndex) || 0;
    let offer = req.query.offer;

    if (offer === undefined || offer === 'false') {
      offer = { $in: [false, true] };
    }

    let furnished = req.query.furnished;

    if (furnished === undefined || furnished === 'false') {
      furnished = { $in: [false, true] };
    }

    let parking = req.query.parking;

    if (parking === undefined || parking === 'false') {
      parking = { $in: [false, true] };
    }

    let type = req.query.type;

    if (type === undefined || type === 'all') {
      type = { $in: ['sale', 'rent'] };
    }

    const searchTerm = req.query.searchTerm || '';

    const sort = req.query.sort || 'createdAt';

    const order = req.query.order || 'desc';

    // Build query
    const query = {
      name: { $regex: searchTerm, $options: 'i' },
      offer,
      furnished,
      parking,
      type,
    };

    // Get total count for pagination
    const total = await Listing.countDocuments(query);

    // Get listings
    const listings = await Listing.find(query)
      .sort({ [sort]: order })
      .limit(limit)
      .skip(startIndex);

    return res.status(200).json({
      listings,
      total,
      currentPage: Math.floor(startIndex / limit) + 1,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    next(error);
  }
};
