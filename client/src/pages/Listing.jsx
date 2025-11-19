import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import SwiperCore from 'swiper';
import { useUser } from '@clerk/clerk-react';
import { Navigation, Pagination, Thumbs } from 'swiper/modules';
import 'swiper/css/bundle';
import 'swiper/css/pagination';
import {
  FaBath,
  FaBed,
  FaChair,
  FaMapMarkerAlt,
  FaParking,
  FaShare,
} from 'react-icons/fa';
import Contact from '../components/Contact';

SwiperCore.use([Navigation, Pagination, Thumbs]);

export default function Listing() {
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [contact, setContact] = useState(false);
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const params = useParams();
  const { user } = useUser();

  useEffect(() => {
    const fetchListing = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/listing/get/${params.listingId}`);
        const data = await res.json();
        if (data.success === false) {
          setError(true);
          setLoading(false);
          return;
        }
        setListing(data);
        setLoading(false);
        setError(false);
      } catch (error) {
        setError(true);
        setLoading(false);
      }
    };
    fetchListing();
  }, [params.listingId]);

  if (loading) {
    return (
      <main className='min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-slate-700 mx-auto mb-4'></div>
          <p className='text-slate-600 text-lg'>Loading listing...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className='min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center'>
        <div className='text-center'>
          <p className='text-red-600 text-xl font-semibold mb-4'>Something went wrong!</p>
          <Link to='/' className='text-slate-700 hover:text-slate-900 underline'>
            Go back to home
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className='min-h-screen bg-gradient-to-br from-slate-50 to-slate-100'>
      {listing && (
        <div>
          {/* Image Gallery Section */}
          <div className='relative bg-white shadow-lg'>
            {/* Main Image Swiper */}
            <div className='relative'>
              <Swiper
                navigation={true}
                pagination={{ clickable: true }}
                thumbs={{ swiper: thumbsSwiper }}
                modules={[Navigation, Pagination, Thumbs]}
                className='main-swiper'
                style={{
                  '--swiper-navigation-color': '#fff',
                  '--swiper-pagination-color': '#fff',
                }}
              >
                {listing.imageUrls.map((url, index) => (
                  <SwiperSlide key={url}>
                    <div className='relative w-full h-[400px] sm:h-[500px] md:h-[600px] lg:h-[700px]'>
                      <img
                        src={url}
                        alt={`${listing.name} - Image ${index + 1}`}
                        className='w-full h-full object-cover'
                        loading={index === 0 ? 'eager' : 'lazy'}
                      />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>

              {/* Share Button */}
              <div className='absolute top-4 right-4 z-10'>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    setCopied(true);
                    setTimeout(() => {
                      setCopied(false);
                    }, 2000);
                  }}
                  className='bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg hover:bg-white transition-all'
                  aria-label='Share listing'
                >
                  <FaShare className='text-slate-700 text-lg' />
                </button>
                {copied && (
                  <div className='absolute top-16 right-0 bg-slate-800 text-white px-4 py-2 rounded-lg shadow-lg whitespace-nowrap'>
                    Link copied!
                  </div>
                )}
              </div>
            </div>

            {/* Thumbnail Navigation */}
            {listing.imageUrls.length > 1 && (
              <div className='bg-slate-50 p-4 border-t border-slate-200'>
                <Swiper
                  onSwiper={setThumbsSwiper}
                  spaceBetween={10}
                  slidesPerView={4}
                  freeMode={true}
                  watchSlidesProgress={true}
                  modules={[Thumbs]}
                  breakpoints={{
                    640: {
                      slidesPerView: 5,
                    },
                    768: {
                      slidesPerView: 6,
                    },
                  }}
                  className='thumb-swiper'
                >
                  {listing.imageUrls.map((url, index) => (
                    <SwiperSlide key={url}>
                      <div className='relative aspect-video cursor-pointer rounded-lg overflow-hidden border-2 border-transparent hover:border-slate-400 transition-all'>
                        <img
                          src={url}
                          alt={`Thumbnail ${index + 1}`}
                          className='w-full h-full object-cover'
                        />
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
            )}
          </div>

          {/* Content Section */}
          <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
            <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
              {/* Main Content */}
              <div className='lg:col-span-2 space-y-6'>
                {/* Title and Price */}
                <div>
                  <h1 className='text-3xl sm:text-4xl font-bold text-slate-800 mb-3'>
                    {listing.name}
                  </h1>
                  <div className='flex items-center gap-2 text-slate-600 mb-4'>
                    <FaMapMarkerAlt className='text-green-600' />
                    <span className='text-lg'>{listing.address}</span>
                  </div>
                  <div className='flex items-baseline gap-3 mb-4'>
                    <span className='text-4xl font-bold text-slate-800'>
                      ${listing.offer
                        ? listing.discountPrice.toLocaleString('en-US')
                        : listing.regularPrice.toLocaleString('en-US')}
                    </span>
                    {listing.type === 'rent' && (
                      <span className='text-xl text-slate-600'>/ month</span>
                    )}
                    {listing.offer && (
                      <span className='text-lg text-slate-500 line-through'>
                        ${listing.regularPrice.toLocaleString('en-US')}
                      </span>
                    )}
                  </div>
                </div>

                {/* Badges */}
                <div className='flex flex-wrap gap-3'>
                  <span className='px-4 py-2 bg-slate-700 text-white rounded-lg font-semibold'>
                    {listing.type === 'rent' ? 'For Rent' : 'For Sale'}
                  </span>
                  {listing.offer && (
                    <span className='px-4 py-2 bg-green-600 text-white rounded-lg font-semibold'>
                      ${(+listing.regularPrice - +listing.discountPrice).toLocaleString('en-US')} OFF
                    </span>
                  )}
                </div>

                {/* Description */}
                <div className='bg-white rounded-xl p-6 shadow-sm'>
                  <h2 className='text-2xl font-bold text-slate-800 mb-4'>Description</h2>
                  <p className='text-slate-700 leading-relaxed text-lg whitespace-pre-line'>
                    {listing.description}
                  </p>
                </div>

                {/* Property Features */}
                <div className='bg-white rounded-xl p-6 shadow-sm'>
                  <h2 className='text-2xl font-bold text-slate-800 mb-4'>Property Details</h2>
                  <div className='grid grid-cols-2 sm:grid-cols-4 gap-4'>
                    <div className='flex items-center gap-3 p-4 bg-slate-50 rounded-lg'>
                      <FaBed className='text-2xl text-slate-600' />
                      <div>
                        <p className='text-sm text-slate-600'>Bedrooms</p>
                        <p className='text-lg font-semibold text-slate-800'>
                          {listing.bedrooms}
                        </p>
                      </div>
                    </div>
                    <div className='flex items-center gap-3 p-4 bg-slate-50 rounded-lg'>
                      <FaBath className='text-2xl text-slate-600' />
                      <div>
                        <p className='text-sm text-slate-600'>Bathrooms</p>
                        <p className='text-lg font-semibold text-slate-800'>
                          {listing.bathrooms}
                        </p>
                      </div>
                    </div>
                    <div className='flex items-center gap-3 p-4 bg-slate-50 rounded-lg'>
                      <FaParking className='text-2xl text-slate-600' />
                      <div>
                        <p className='text-sm text-slate-600'>Parking</p>
                        <p className='text-lg font-semibold text-slate-800'>
                          {listing.parking ? 'Yes' : 'No'}
                        </p>
                      </div>
                    </div>
                    <div className='flex items-center gap-3 p-4 bg-slate-50 rounded-lg'>
                      <FaChair className='text-2xl text-slate-600' />
                      <div>
                        <p className='text-sm text-slate-600'>Furnished</p>
                        <p className='text-lg font-semibold text-slate-800'>
                          {listing.furnished ? 'Yes' : 'No'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className='lg:col-span-1'>
                <div className='bg-white rounded-xl p-6 shadow-lg sticky top-24'>
                  <div className='space-y-4'>
                    <div className='text-center pb-4 border-b border-slate-200'>
                      <p className='text-3xl font-bold text-slate-800 mb-1'>
                        ${listing.offer
                          ? listing.discountPrice.toLocaleString('en-US')
                          : listing.regularPrice.toLocaleString('en-US')}
                      </p>
                      {listing.type === 'rent' && (
                        <p className='text-slate-600'>per month</p>
                      )}
                      {listing.offer && (
                        <p className='text-sm text-green-600 font-semibold mt-1'>
                          Save ${(+listing.regularPrice - +listing.discountPrice).toLocaleString('en-US')}
                        </p>
                      )}
                    </div>

                    {user && listing.userRef !== user.id && !contact && (
                      <button
                        onClick={() => setContact(true)}
                        className='w-full bg-gradient-to-r from-slate-700 to-slate-800 text-white rounded-xl py-4 font-semibold hover:from-slate-800 hover:to-slate-900 transition-all shadow-lg hover:shadow-xl'
                      >
                        Contact Landlord
                      </button>
                    )}

                    {contact && <Contact listing={listing} />}

                    {!user && (
                      <div className='text-center p-4 bg-slate-50 rounded-lg'>
                        <p className='text-sm text-slate-600 mb-3'>
                          Sign in to contact the landlord
                        </p>
                        <Link
                          to='/sign-in'
                          className='inline-block w-full bg-slate-700 text-white rounded-xl py-3 font-semibold hover:bg-slate-800 transition-all'
                        >
                          Sign In
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
