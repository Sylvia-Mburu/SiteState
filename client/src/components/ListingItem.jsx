import { Link } from 'react-router-dom';
import { FaMapMarkerAlt, FaBed, FaBath, FaTag } from 'react-icons/fa';

export default function ListingItem({ listing }) {
  return (
    <Link to={`/listing/${listing._id}`}>
      <div className='bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group cursor-pointer border border-slate-200'>
        {/* Image Container */}
        <div className='relative h-64 overflow-hidden'>
          <img
            src={
              listing.imageUrls?.[0] ||
              'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800'
            }
            alt={listing.name}
            className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-500'
          />
          {/* Badge Overlay */}
          <div className='absolute top-4 left-4 flex gap-2'>
            {listing.offer && (
              <span className='px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full flex items-center gap-1'>
                <FaTag className='text-xs' />
                Offer
              </span>
            )}
            <span className={`px-3 py-1 text-white text-xs font-bold rounded-full ${
              listing.type === 'rent' ? 'bg-green-600' : 'bg-blue-600'
            }`}>
              {listing.type === 'rent' ? 'For Rent' : 'For Sale'}
            </span>
          </div>
          {/* Price Overlay */}
          <div className='absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4'>
            <p className='text-white text-2xl font-bold'>
              ${listing.offer
                ? listing.discountPrice?.toLocaleString('en-US')
                : listing.regularPrice?.toLocaleString('en-US')}
              {listing.type === 'rent' && <span className='text-sm font-normal'>/mo</span>}
            </p>
            {listing.offer && (
              <p className='text-white/80 text-sm line-through'>
                ${listing.regularPrice?.toLocaleString('en-US')}
              </p>
            )}
          </div>
        </div>

        {/* Content */}
        <div className='p-5'>
          <h3 className='text-lg font-bold text-slate-800 mb-2 line-clamp-1 group-hover:text-slate-600 transition-colors'>
            {listing.name}
          </h3>
          
          <div className='flex items-center gap-1 text-slate-600 mb-3'>
            <FaMapMarkerAlt className='text-green-600 flex-shrink-0' />
            <p className='text-sm truncate'>{listing.address}</p>
          </div>

          <p className='text-slate-600 text-sm line-clamp-2 mb-4'>
            {listing.description}
          </p>

          {/* Property Details */}
          <div className='flex items-center gap-4 pt-4 border-t border-slate-200'>
            <div className='flex items-center gap-2 text-slate-600'>
              <FaBed className='text-slate-500' />
              <span className='text-sm font-semibold'>
                {listing.bedrooms} {listing.bedrooms === 1 ? 'Bed' : 'Beds'}
              </span>
            </div>
            <div className='flex items-center gap-2 text-slate-600'>
              <FaBath className='text-slate-500' />
              <span className='text-sm font-semibold'>
                {listing.bathrooms} {listing.bathrooms === 1 ? 'Bath' : 'Baths'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
