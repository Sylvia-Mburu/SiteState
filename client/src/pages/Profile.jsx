import { useUser, useClerk } from '@clerk/clerk-react';
import { useRef, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEdit, FaTrash, FaPlus, FaImage, FaBed, FaBath, FaMapMarkerAlt } from 'react-icons/fa';

export default function Profile() {
  const fileRef = useRef(null);
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const navigate = useNavigate();
  const [file, setFile] = useState(undefined);
  const [filePerc, setFilePerc] = useState(0);
  const [fileUploadError, setFileUploadError] = useState(false);
  const [formData, setFormData] = useState({});
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [userListings, setUserListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loadingListings, setLoadingListings] = useState(false);

  useEffect(() => {
    if (file) {
      handleFileUpload(file);
    }
  }, [file]);

  useEffect(() => {
    if (user && isLoaded) {
      fetchUserListings();
    }
  }, [user, isLoaded]);

  const fetchUserListings = async () => {
    if (!user) return;
    try {
      setLoadingListings(true);
      const res = await fetch(`/api/user/listings/${user.id}`, {
        headers: {
          'x-clerk-user-id': user.id,
        },
      });
      const data = await res.json();
      if (data.success === false) {
        console.error('Failed to fetch listings:', data.message);
        setUserListings([]);
      } else {
        console.log('Fetched listings:', data);
        setUserListings(Array.isArray(data) ? data : []);
      }
      setLoadingListings(false);
    } catch (error) {
      console.error('Error fetching listings:', error);
      setUserListings([]);
      setLoadingListings(false);
    }
  };

  const handleFileUpload = async (file) => {
    try {
      setFileUploadError(false);
      setFilePerc(0);
      const formDataToSend = new FormData();
      formDataToSend.append('image', file);

      const xhr = new XMLHttpRequest();
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100;
          setFilePerc(Math.round(percentComplete));
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          setFormData({ ...formData, avatar: response.url });
          setFilePerc(100);
        } else {
          setFileUploadError(true);
        }
      });

      xhr.addEventListener('error', () => {
        setFileUploadError(true);
      });

      xhr.open('POST', '/api/upload/single');
      xhr.send(formDataToSend);
    } catch (error) {
      setFileUploadError(true);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    try {
      setLoading(true);
      setError(null);
      await user.update({
        unsafeMetadata: {
          ...user.unsafeMetadata,
          ...formData
        }
      });
      setUpdateSuccess(true);
      setLoading(false);
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!user) return;
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }
    try {
      setLoading(true);
      await user.delete();
      setLoading(false);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      setError(error.message);
    }
  };

  const handleListingDelete = async (listingId) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) {
      return;
    }
    try {
      const res = await fetch(`/api/listing/delete/${listingId}`, {
        method: 'DELETE',
        headers: {
          'x-clerk-user-id': user?.id || '',
        },
      });
      const data = await res.json();
      if (data.success === false) {
        setError(data.message || 'Failed to delete listing');
        return;
      }
      setUserListings((prev) =>
        prev.filter((listing) => listing._id !== listingId)
      );
    } catch (error) {
      setError(error.message);
    }
  };

  if (!isLoaded) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-slate-700'></div>
      </div>
    );
  }

  return (
    <main className='min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4'>
      <div className='max-w-6xl mx-auto'>
        {/* Profile Section */}
  

        {/* My Listings Section */}
        <div className='bg-white rounded-2xl shadow-xl p-8'>
          <div className='flex justify-between items-center mb-6'>
            <h2 className='text-3xl font-bold text-slate-800'>My Listings</h2>
            {loadingListings && (
              <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-slate-700'></div>
            )}
          </div>

          {userListings.length === 0 && !loadingListings && (
            <div className='text-center py-12'>
              <FaImage className='text-6xl text-slate-300 mx-auto mb-4' />
              <p className='text-xl text-slate-600 mb-2'>No listings yet</p>
              <p className='text-slate-500 mb-6'>Create your first listing to get started!</p>
              <Link
                to='/create-listing'
                className='inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-semibold hover:from-green-700 hover:to-green-800 transition-all shadow-lg'
              >
                <FaPlus />
                Create Listing
              </Link>
            </div>
          )}

          {userListings.length > 0 && (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {userListings.map((listing) => (
                <div
                  key={listing._id}
                  className='border border-slate-200 rounded-xl overflow-hidden hover:shadow-lg transition-all bg-white'
                >
                  <Link to={`/listing/${listing._id}`}>
                    <div className='relative h-48 overflow-hidden'>
                      <img
                        src={listing.imageUrls[0]}
                        alt={listing.name}
                        className='w-full h-full object-cover hover:scale-105 transition-transform duration-300'
                      />
                      <div className='absolute top-2 right-2'>
                        <span className='px-3 py-1 bg-slate-800 text-white text-xs font-semibold rounded-full'>
                          {listing.type === 'rent' ? 'For Rent' : 'For Sale'}
                        </span>
                      </div>
                    </div>
                  </Link>
                  <div className='p-4'>
                    <Link to={`/listing/${listing._id}`}>
                      <h3 className='font-bold text-lg text-slate-800 mb-2 hover:text-slate-600 transition-colors line-clamp-1'>
                        {listing.name}
                      </h3>
                    </Link>
                    <div className='flex items-center gap-1 text-slate-600 text-sm mb-3'>
                      <FaMapMarkerAlt className='text-green-600' />
                      <span className='line-clamp-1'>{listing.address}</span>
                    </div>
                    <div className='flex items-center gap-4 text-slate-600 text-sm mb-4'>
                      <span className='flex items-center gap-1'>
                        <FaBed />
                        {listing.bedrooms}
                      </span>
                      <span className='flex items-center gap-1'>
                        <FaBath />
                        {listing.bathrooms}
                      </span>
                    </div>
                    <div className='flex items-center justify-between pt-4 border-t border-slate-200'>
                      <p className='text-xl font-bold text-slate-800'>
                        ${listing.offer
                          ? listing.discountPrice.toLocaleString('en-US')
                          : listing.regularPrice.toLocaleString('en-US')}
                        {listing.type === 'rent' && <span className='text-sm font-normal text-slate-600'>/mo</span>}
                      </p>
                      <div className='flex gap-2'>
                        <Link
                          to={`/update-listing/${listing._id}`}
                          className='p-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-all'
                          title='Edit listing'
                        >
                          <FaEdit />
                        </Link>
                        <button
                          onClick={() => handleListingDelete(listing._id)}
                          className='p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all'
                          title='Delete listing'
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
