import { FaSearch, FaHome, FaPlusCircle, FaInfoCircle, FaUser, FaBars, FaTimes } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { SignInButton, UserButton, useAuth } from '@clerk/clerk-react';
import { useEffect, useState } from 'react';

export default function Header() {
  const { isSignedIn, isLoaded } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set('searchTerm', searchTerm);
    const searchQuery = urlParams.toString();
    navigate(`/search?${searchQuery}`);
    setMobileMenuOpen(false);
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const searchTermFromUrl = urlParams.get('searchTerm');
    if (searchTermFromUrl) {
      setSearchTerm(searchTermFromUrl);
    }
  }, [location.search]);

  const navLinks = [
    { path: '/', label: 'Home', icon: FaHome, show: true },
    { path: '/search', label: 'Search', icon: FaSearch, show: true },
    { path: '/create-listing', label: 'Create Listing', icon: FaPlusCircle, show: isSignedIn },
    { path: '/about', label: 'About', icon: FaInfoCircle, show: true },
    { path: '/profile', label: 'My Listings', icon: FaUser, show: isSignedIn },
  ];

  const visibleLinks = navLinks.filter(link => link.show);

  return (
    <header className='bg-white shadow-lg sticky top-0 z-50'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between items-center h-16'>
          {/* Logo */}
          <Link to='/' className='flex items-center' onClick={() => setMobileMenuOpen(false)}>
            <h1 className='font-bold text-xl sm:text-2xl'>
              <span className='text-slate-600'>Site</span>
              <span className='text-slate-800'>State</span>
            </h1>
          </Link>

          {/* Desktop Search Bar */}
          <form
            onSubmit={handleSubmit}
            className='hidden md:flex flex-1 max-w-lg mx-8'
          >
            <div className='relative w-full'>
              <input
                type='text'
                placeholder='Search properties...'
                className='w-full px-4 py-2 pl-10 pr-4 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <FaSearch className='absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400' />
            </div>
          </form>

          {/* Desktop Navigation */}
          <nav className='hidden lg:flex items-center gap-1'>
            {visibleLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className='flex items-center gap-2 px-4 py-2 text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-all font-medium'
                >
                  <Icon className='text-sm' />
                  <span>{link.label}</span>
                </Link>
              );
            })}
            
            {isLoaded && (
              <div className='ml-2 pl-2 border-l border-slate-300'>
                {isSignedIn ? (
                  <UserButton afterSignOutUrl='/' />
                ) : (
                  <SignInButton mode='modal'>
                    <button className='flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-all font-medium'>
                      Sign In
                    </button>
                  </SignInButton>
                )}
              </div>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className='lg:hidden p-2 text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-all'
            aria-label='Toggle menu'
          >
            {mobileMenuOpen ? (
              <FaTimes className='text-xl' />
            ) : (
              <FaBars className='text-xl' />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className='lg:hidden border-t border-slate-200 py-4'>
            {/* Mobile Search */}
            <form onSubmit={handleSubmit} className='mb-4'>
              <div className='relative'>
                <input
                  type='text'
                  placeholder='Search properties...'
                  className='w-full px-4 py-2 pl-10 pr-4 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <FaSearch className='absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400' />
              </div>
            </form>

            {/* Mobile Navigation Links */}
            <nav className='flex flex-col gap-2'>
              {visibleLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className='flex items-center gap-3 px-4 py-3 text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-all font-medium'
                  >
                    <Icon />
                    <span>{link.label}</span>
                  </Link>
                );
              })}

              {isLoaded && (
                <div className='pt-2 border-t border-slate-200'>
                  {isSignedIn ? (
                    <div className='flex items-center gap-3 px-4 py-3'>
                      <span className='text-slate-700 font-medium'>Account</span>
                      <UserButton afterSignOutUrl='/' />
                    </div>
                  ) : (
                    <SignInButton mode='modal'>
                      <button className='w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-all font-medium'>
                        Sign In
                      </button>
                    </SignInButton>
                  )}
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
