import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ListingItem from '../components/ListingItem';
import { FaSearch, FaFilter, FaSort, FaChevronLeft, FaChevronRight, FaHome, FaTag, FaParking, FaCouch } from 'react-icons/fa';

export default function Search() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebardata, setSidebardata] = useState({
    searchTerm: '',
    type: 'all',
    parking: false,
    furnished: false,
    offer: false,
    sort: 'createdAt',
    order: 'desc',
  });

  const [loading, setLoading] = useState(false);
  const [listings, setListings] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalListings, setTotalListings] = useState(0);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const listingsPerPage = 12;

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const searchTermFromUrl = urlParams.get('searchTerm');
    const typeFromUrl = urlParams.get('type');
    const parkingFromUrl = urlParams.get('parking');
    const furnishedFromUrl = urlParams.get('furnished');
    const offerFromUrl = urlParams.get('offer');
    const sortFromUrl = urlParams.get('sort');
    const orderFromUrl = urlParams.get('order');
    const pageFromUrl = urlParams.get('page');

    if (pageFromUrl) {
      setCurrentPage(parseInt(pageFromUrl));
    } else {
      setCurrentPage(1);
    }

    if (
      searchTermFromUrl ||
      typeFromUrl ||
      parkingFromUrl ||
      furnishedFromUrl ||
      offerFromUrl ||
      sortFromUrl ||
      orderFromUrl
    ) {
      setSidebardata({
        searchTerm: searchTermFromUrl || '',
        type: typeFromUrl || 'all',
        parking: parkingFromUrl === 'true' ? true : false,
        furnished: furnishedFromUrl === 'true' ? true : false,
        offer: offerFromUrl === 'true' ? true : false,
        sort: sortFromUrl || 'createdAt',
        order: orderFromUrl || 'desc',
      });
    }

    fetchListings();
  }, [location.search]);

  const fetchListings = async () => {
    setLoading(true);
    const urlParams = new URLSearchParams(location.search);
    const page = parseInt(urlParams.get('page')) || 1;
    const startIndex = (page - 1) * listingsPerPage;
    
    urlParams.set('limit', listingsPerPage.toString());
    urlParams.set('startIndex', startIndex.toString());
    
    // Remove page from params as it's not a backend param
    urlParams.delete('page');

    try {
      const res = await fetch(`/api/listing/get?${urlParams.toString()}`);
      const data = await res.json();
      
      // Handle both old format (array) and new format (object with pagination)
      if (Array.isArray(data)) {
        // Old format - calculate pagination manually
        const hasMore = data.length === listingsPerPage;
        setTotalListings((page - 1) * listingsPerPage + data.length + (hasMore ? 1 : 0));
        setTotalPages(hasMore ? page + 1 : page);
        setListings(data);
      } else {
        // New format with pagination info
        setListings(data.listings || []);
        setTotalListings(data.total || 0);
        setTotalPages(data.totalPages || 1);
        setCurrentPage(data.currentPage || 1);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching listings:', error);
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    if (
      e.target.id === 'all' ||
      e.target.id === 'rent' ||
      e.target.id === 'sale'
    ) {
      setSidebardata({ ...sidebardata, type: e.target.id });
    }

    if (e.target.id === 'searchTerm') {
      setSidebardata({ ...sidebardata, searchTerm: e.target.value });
    }

    if (
      e.target.id === 'parking' ||
      e.target.id === 'furnished' ||
      e.target.id === 'offer'
    ) {
      setSidebardata({
        ...sidebardata,
        [e.target.id]:
          e.target.checked || e.target.checked === 'true' ? true : false,
      });
    }

    if (e.target.id === 'sort_order') {
      const sort = e.target.value.split('_')[0] || 'createdAt';
      const order = e.target.value.split('_')[1] || 'desc';
      setSidebardata({ ...sidebardata, sort, order });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const urlParams = new URLSearchParams();
    urlParams.set('searchTerm', sidebardata.searchTerm);
    urlParams.set('type', sidebardata.type);
    urlParams.set('parking', sidebardata.parking);
    urlParams.set('furnished', sidebardata.furnished);
    urlParams.set('offer', sidebardata.offer);
    urlParams.set('sort', sidebardata.sort);
    urlParams.set('order', sidebardata.order);
    urlParams.set('page', '1'); // Reset to page 1 on new search
    navigate(`/search?${urlParams.toString()}`);
    setShowMobileFilters(false);
  };

  const handlePageChange = (newPage) => {
    const urlParams = new URLSearchParams(location.search);
    urlParams.set('page', newPage.toString());
    navigate(`/search?${urlParams.toString()}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPagination = () => {
    const pages = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className='flex items-center justify-center gap-2 mt-8'>
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className='p-2 rounded-lg border border-slate-300 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all'
        >
          <FaChevronLeft />
        </button>

        {startPage > 1 && (
          <>
            <button
              onClick={() => handlePageChange(1)}
              className='px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-100 transition-all'
            >
              1
            </button>
            {startPage > 2 && <span className='px-2'>...</span>}
          </>
        )}

        {pages.map((page) => (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            className={`px-4 py-2 rounded-lg border transition-all ${
              currentPage === page
                ? 'bg-slate-800 text-white border-slate-800'
                : 'border-slate-300 hover:bg-slate-100'
            }`}
          >
            {page}
          </button>
        ))}

        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className='px-2'>...</span>}
            <button
              onClick={() => handlePageChange(totalPages)}
              className='px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-100 transition-all'
            >
              {totalPages}
            </button>
          </>
        )}

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className='p-2 rounded-lg border border-slate-300 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all'
        >
          <FaChevronRight />
        </button>
      </div>
    );
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 to-slate-100'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Mobile Filter Toggle */}
        <div className='md:hidden mb-6'>
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className='w-full flex items-center justify-center gap-2 px-6 py-3 bg-white rounded-xl shadow-lg font-semibold text-slate-700 hover:bg-slate-50 transition-all'
          >
            <FaFilter />
            {showMobileFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>

        <div className='flex flex-col lg:flex-row gap-8'>
          {/* Sidebar Filters */}
          <aside
            className={`${
              showMobileFilters ? 'block' : 'hidden'
            } md:block lg:w-80 flex-shrink-0`}
          >
            <div className='bg-white rounded-2xl shadow-lg p-6 sticky top-24'>
              <div className='flex items-center gap-2 mb-6'>
                <FaFilter className='text-slate-600' />
                <h2 className='text-xl font-bold text-slate-800'>Filters</h2>
              </div>

              <form onSubmit={handleSubmit} className='space-y-6'>
                {/* Search Term */}
                <div>
                  <label className='block text-sm font-semibold text-slate-700 mb-2'>
                    Search Term
                  </label>
                  <div className='relative'>
                    <FaSearch className='absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400' />
                    <input
                      type='text'
                      id='searchTerm'
                      placeholder='Search properties...'
                      className='w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all'
                      value={sidebardata.searchTerm}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* Property Type */}
                <div>
                  <label className='block text-sm font-semibold text-slate-700 mb-3'>
                    Property Type
                  </label>
                  <div className='space-y-2'>
                    <label className='flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-all'>
                      <input
                        type='radio'
                        id='all'
                        name='type'
                        className='w-4 h-4 text-slate-600'
                        onChange={handleChange}
                        checked={sidebardata.type === 'all'}
                      />
                      <span className='font-medium'>All Types</span>
                    </label>
                    <label className='flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-all'>
                      <input
                        type='radio'
                        id='rent'
                        name='type'
                        className='w-4 h-4 text-slate-600'
                        onChange={handleChange}
                        checked={sidebardata.type === 'rent'}
                      />
                      <FaHome className='text-green-600' />
                      <span className='font-medium'>For Rent</span>
                    </label>
                    <label className='flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-all'>
                      <input
                        type='radio'
                        id='sale'
                        name='type'
                        className='w-4 h-4 text-slate-600'
                        onChange={handleChange}
                        checked={sidebardata.type === 'sale'}
                      />
                      <FaHome className='text-blue-600' />
                      <span className='font-medium'>For Sale</span>
                    </label>
                  </div>
                </div>

                {/* Amenities */}
                <div>
                  <label className='block text-sm font-semibold text-slate-700 mb-3'>
                    Amenities
                  </label>
                  <div className='space-y-2'>
                    <label className='flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-all'>
                      <input
                        type='checkbox'
                        id='parking'
                        className='w-4 h-4 text-slate-600 rounded'
                        onChange={handleChange}
                        checked={sidebardata.parking}
                      />
                      <FaParking className='text-slate-600' />
                      <span className='font-medium'>Parking</span>
                    </label>
                    <label className='flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-all'>
                      <input
                        type='checkbox'
                        id='furnished'
                        className='w-4 h-4 text-slate-600 rounded'
                        onChange={handleChange}
                        checked={sidebardata.furnished}
                      />
                      <FaCouch className='text-slate-600' />
                      <span className='font-medium'>Furnished</span>
                    </label>
                    <label className='flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-all'>
                      <input
                        type='checkbox'
                        id='offer'
                        className='w-4 h-4 text-slate-600 rounded'
                        onChange={handleChange}
                        checked={sidebardata.offer}
                      />
                      <FaTag className='text-green-600' />
                      <span className='font-medium'>Special Offer</span>
                    </label>
                  </div>
                </div>

                {/* Sort */}
                <div>
                  <label className='block text-sm font-semibold text-slate-700 mb-2'>
                    <FaSort className='inline mr-2' />
                    Sort By
                  </label>
                  <select
                    onChange={handleChange}
                    value={`${sidebardata.sort}_${sidebardata.order}`}
                    id='sort_order'
                    className='w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all'
                  >
                    <option value='regularPrice_desc'>Price: High to Low</option>
                    <option value='regularPrice_asc'>Price: Low to High</option>
                    <option value='createdAt_desc'>Newest First</option>
                    <option value='createdAt_asc'>Oldest First</option>
                  </select>
                </div>

                <button
                  type='submit'
                  className='w-full bg-gradient-to-r from-slate-700 to-slate-800 text-white py-3 rounded-xl font-semibold hover:from-slate-800 hover:to-slate-900 transition-all shadow-lg'
                >
                  Apply Filters
                </button>
              </form>
            </div>
          </aside>

          {/* Main Content */}
          <main className='flex-1'>
            {/* Results Header */}
            <div className='bg-white rounded-2xl shadow-lg p-6 mb-6'>
              <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
                <div>
                  <h1 className='text-2xl md:text-3xl font-bold text-slate-800 mb-1'>
                    Search Results
                  </h1>
                  <p className='text-slate-600'>
                    {loading ? 'Loading...' : `${listings.length} property${listings.length !== 1 ? 'ies' : ''} found`}
                  </p>
                </div>
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className='text-center py-16'>
                <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-slate-700 mx-auto mb-4'></div>
                <p className='text-slate-600'>Loading properties...</p>
              </div>
            )}

            {/* Empty State */}
            {!loading && listings.length === 0 && (
              <div className='bg-white rounded-2xl shadow-lg p-12 text-center'>
                <FaSearch className='text-6xl text-slate-300 mx-auto mb-4' />
                <h3 className='text-2xl font-bold text-slate-800 mb-2'>No properties found</h3>
                <p className='text-slate-600 mb-6'>Try adjusting your search filters</p>
              </div>
            )}

            {/* Listings Grid */}
            {!loading && listings.length > 0 && (
              <>
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
                  {listings.map((listing) => (
                    <ListingItem key={listing._id} listing={listing} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && renderPagination()}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
