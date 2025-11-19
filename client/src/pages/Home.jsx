import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay, EffectFade } from 'swiper/modules';
import SwiperCore from 'swiper';
import 'swiper/css/bundle';
import 'swiper/css/effect-fade';
import ListingItem from '../components/ListingItem';
import { FaSearch, FaHome, FaTag, FaArrowRight, FaBed, FaBath, FaMapMarkerAlt } from 'react-icons/fa';

SwiperCore.use([Navigation, Autoplay, EffectFade]);

export default function Home() {
  const [offerListings, setOfferListings] = useState([]);
  const [saleListings, setSaleListings] = useState([]);
  const [rentListings, setRentListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllListings = async () => {
      try {
        setLoading(true);
        
        // Fetch all three categories in parallel
        const [offersRes, rentRes, saleRes] = await Promise.all([
          fetch('/api/listing/get?offer=true&limit=4'),
          fetch('/api/listing/get?type=rent&limit=4'),
          fetch('/api/listing/get?type=sale&limit=4'),
        ]);

        const [offersData, rentData, saleData] = await Promise.all([
          offersRes.json(),
          rentRes.json(),
          saleRes.json(),
        ]);

        // Handle both old format (array) and new format (object with listings)
        setOfferListings(Array.isArray(offersData) ? offersData : (offersData.listings || []));
        setRentListings(Array.isArray(rentData) ? rentData : (rentData.listings || []));
        setSaleListings(Array.isArray(saleData) ? saleData : (saleData.listings || []));
        setLoading(false);
      } catch (error) {
        console.error('Error fetching listings:', error);
        setLoading(false);
      }
    };

    fetchAllListings();
  }, []);

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50'>
      {/* Hero Section */}
      <section className='relative overflow-hidden'>
        {/* Background Image from Unsplash - Always visible */}
        <div
          className='absolute inset-0 z-0'
          style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1973&q=80)`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
          }}
        ></div>
        
        <div className='relative h-[500px] md:h-[600px] lg:h-[700px] flex items-center justify-center z-10'>
          <div className='text-center text-white px-4 max-w-4xl'>
            <h1 className='text-4xl md:text-5xl lg:text-6xl font-bold mb-4'>
              Find Your Next <span className='text-green-400'>Perfect</span> Place
            </h1>
            <p className='text-xl md:text-2xl mb-6 text-slate-200'>
              Discover amazing properties for rent or sale
            </p>
            <Link
              to='/search'
              className='inline-flex items-center gap-2 px-8 py-4 bg-white text-slate-800 rounded-xl font-semibold hover:bg-slate-100 transition-all shadow-lg hover:shadow-xl'
            >
              <FaSearch />
              Start Searching
            </Link>
          </div>
        </div>

        {/* Search Bar Overlay */}
        <div className='absolute bottom-8 left-0 right-0 z-30 px-4'>
          <div className='max-w-4xl mx-auto'>
            <Link
              to='/search'
              className='block w-full bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-2xl hover:bg-white transition-all'
            >
              <div className='flex items-center gap-3 text-slate-600'>
                <FaSearch className='text-2xl text-slate-400' />
                <span className='text-lg'>Search properties...</span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16'>
        {/* Quick Stats */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-16'>
          <div className='bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border border-slate-200'>
            <div className='flex items-center gap-4'>
              <div className='p-4 bg-blue-100 rounded-xl'>
                <FaHome className='text-3xl text-blue-600' />
              </div>
              <div>
                <p className='text-3xl font-bold text-slate-800'>{saleListings.length}+</p>
                <p className='text-slate-600'>Properties for Sale</p>
              </div>
            </div>
          </div>
          <div className='bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border border-slate-200'>
            <div className='flex items-center gap-4'>
              <div className='p-4 bg-green-100 rounded-xl'>
                <FaHome className='text-3xl text-green-600' />
              </div>
              <div>
                <p className='text-3xl font-bold text-slate-800'>{rentListings.length}+</p>
                <p className='text-slate-600'>Properties for Rent</p>
              </div>
            </div>
          </div>
          <div className='bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border border-slate-200'>
            <div className='flex items-center gap-4'>
              <div className='p-4 bg-orange-100 rounded-xl'>
                <FaTag className='text-3xl text-orange-600' />
              </div>
              <div>
                <p className='text-3xl font-bold text-slate-800'>{offerListings.length}+</p>
                <p className='text-slate-600'>Special Offers</p>
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className='text-center py-12'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-slate-700 mx-auto mb-4'></div>
            <p className='text-slate-600'>Loading properties...</p>
          </div>
        )}

        {/* Special Offers Section */}
        {!loading && offerListings.length > 0 && (
          <section className='mb-16'>
            <div className='flex items-center justify-between mb-8'>
              <div>
                <h2 className='text-3xl md:text-4xl font-bold text-slate-800 mb-2'>
                  Special Offers
                </h2>
                <p className='text-slate-600'>Limited time deals on premium properties</p>
              </div>
              <Link
                to='/search?offer=true'
                className='hidden md:flex items-center gap-2 px-6 py-3 bg-slate-800 text-white rounded-xl font-semibold hover:bg-slate-900 transition-all'
              >
                View All
                <FaArrowRight />
              </Link>
            </div>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
              {offerListings.map((listing) => (
                <ListingItem listing={listing} key={listing._id} />
              ))}
            </div>
            <div className='mt-6 text-center md:hidden'>
              <Link
                to='/search?offer=true'
                className='inline-flex items-center gap-2 px-6 py-3 bg-slate-800 text-white rounded-xl font-semibold hover:bg-slate-900 transition-all'
              >
                View All Offers
                <FaArrowRight />
              </Link>
            </div>
          </section>
        )}

        {/* Properties for Rent Section */}
        {!loading && rentListings.length > 0 && (
          <section className='mb-16'>
            <div className='flex items-center justify-between mb-8'>
              <div>
                <h2 className='text-3xl md:text-4xl font-bold text-slate-800 mb-2'>
                  Properties for Rent
                </h2>
                <p className='text-slate-600'>Find your perfect rental property</p>
              </div>
              <Link
                to='/search?type=rent'
                className='hidden md:flex items-center gap-2 px-6 py-3 bg-slate-800 text-white rounded-xl font-semibold hover:bg-slate-900 transition-all'
              >
                View All
                <FaArrowRight />
              </Link>
            </div>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
              {rentListings.map((listing) => (
                <ListingItem listing={listing} key={listing._id} />
              ))}
            </div>
            <div className='mt-6 text-center md:hidden'>
              <Link
                to='/search?type=rent'
                className='inline-flex items-center gap-2 px-6 py-3 bg-slate-800 text-white rounded-xl font-semibold hover:bg-slate-900 transition-all'
              >
                View All Rentals
                <FaArrowRight />
              </Link>
            </div>
          </section>
        )}

        {/* Properties for Sale Section */}
        {!loading && saleListings.length > 0 && (
          <section className='mb-16'>
            <div className='flex items-center justify-between mb-8'>
              <div>
                <h2 className='text-3xl md:text-4xl font-bold text-slate-800 mb-2'>
                  Properties for Sale
                </h2>
                <p className='text-slate-600'>Own your dream property today</p>
              </div>
              <Link
                to='/search?type=sale'
                className='hidden md:flex items-center gap-2 px-6 py-3 bg-slate-800 text-white rounded-xl font-semibold hover:bg-slate-900 transition-all'
              >
                View All
                <FaArrowRight />
              </Link>
            </div>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
              {saleListings.map((listing) => (
                <ListingItem listing={listing} key={listing._id} />
              ))}
            </div>
            <div className='mt-6 text-center md:hidden'>
              <Link
                to='/search?type=sale'
                className='inline-flex items-center gap-2 px-6 py-3 bg-slate-800 text-white rounded-xl font-semibold hover:bg-slate-900 transition-all'
              >
                View All Sales
                <FaArrowRight />
              </Link>
            </div>
          </section>
        )}

        {/* Empty State */}
        {!loading && offerListings.length === 0 && rentListings.length === 0 && saleListings.length === 0 && (
          <div className='text-center py-16'>
            <FaHome className='text-6xl text-slate-300 mx-auto mb-4' />
            <h3 className='text-2xl font-bold text-slate-800 mb-2'>No properties available</h3>
            <p className='text-slate-600 mb-6'>Be the first to create a listing!</p>
            <Link
              to='/create-listing'
              className='inline-flex items-center gap-2 px-6 py-3 bg-slate-800 text-white rounded-xl font-semibold hover:bg-slate-900 transition-all'
            >
              Create Listing
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
