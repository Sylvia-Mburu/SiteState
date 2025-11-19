import { useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { FaBed, FaBath, FaParking, FaCouch, FaTag, FaImage, FaTrash, FaUpload, FaCheckCircle } from 'react-icons/fa';

export default function CreateListing() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [formData, setFormData] = useState({
    imageUrls: [],
    name: '',
    description: '',
    address: '',
    type: 'rent',
    bedrooms: 1,
    bathrooms: 1,
    regularPrice: 50,
    discountPrice: 0,
    offer: false,
    parking: false,
    furnished: false,
  });
  const [imageUploadError, setImageUploadError] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleImageSubmit = (e) => {
    if (files.length > 0 && files.length + formData.imageUrls.length < 7) {
      setUploading(true);
      setImageUploadError(false);
      const promises = [];

      for (let i = 0; i < files.length; i++) {
        promises.push(storeImage(files[i]));
      }
      Promise.all(promises)
        .then((urls) => {
          setFormData({
            ...formData,
            imageUrls: formData.imageUrls.concat(urls),
          });
          setImageUploadError(false);
          setUploading(false);
        })
        .catch((err) => {
          setImageUploadError('Image upload failed (2 mb max per image)');
          setUploading(false);
        });
    } else {
      setImageUploadError('You can only upload 6 images per listing');
      setUploading(false);
    }
  };

  const storeImage = async (file) => {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append('image', file);

      const xhr = new XMLHttpRequest();
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = (e.loaded / e.total) * 100;
          console.log(`Upload is ${progress}% done`);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          resolve(response.url);
        } else {
          reject(new Error('Upload failed'));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed'));
      });

      xhr.open('POST', '/api/upload/single');
      xhr.send(formData);
    });
  };

  const handleRemoveImage = (index) => {
    setFormData({
      ...formData,
      imageUrls: formData.imageUrls.filter((_, i) => i !== index),
    });
  };

  const handleChange = (e) => {
    if (e.target.id === 'sale' || e.target.id === 'rent') {
      setFormData({
        ...formData,
        type: e.target.id,
      });
    }

    if (
      e.target.id === 'parking' ||
      e.target.id === 'furnished' ||
      e.target.id === 'offer'
    ) {
      setFormData({
        ...formData,
        [e.target.id]: e.target.checked,
      });
    }

    if (
      e.target.type === 'number' ||
      e.target.type === 'text' ||
      e.target.type === 'textarea'
    ) {
      setFormData({
        ...formData,
        [e.target.id]: e.target.value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData.imageUrls.length < 1)
        return setError('You must upload at least one image');
      if (+formData.regularPrice < +formData.discountPrice)
        return setError('Discount price must be lower than regular price');
      setLoading(true);
      setError(false);
      setSuccess(false);
      const res = await fetch('/api/listing/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-clerk-user-id': user?.id || '',
        },
        body: JSON.stringify({
          ...formData,
          userRef: user?.id,
        }),
      });
      const data = await res.json();
      setLoading(false);
      if (data.success === false || !data._id) {
        setError(data.message || 'Failed to create listing');
      } else {
        setSuccess(true);
        setTimeout(() => {
          navigate(`/listing/${data._id}`);
        }, 1500);
      }
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <main className='min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4'>
      <div className='max-w-6xl mx-auto'>
        <div className='bg-white rounded-2xl shadow-xl p-8 md:p-12'>
          <div className='mb-8'>
            <h1 className='text-4xl font-bold text-slate-800 mb-2'>Create New Listing</h1>
            <p className='text-slate-600'>Fill in the details below to create your property listing</p>
          </div>

          {success && (
            <div className='mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3'>
              <FaCheckCircle className='text-green-600 text-xl' />
              <p className='text-green-800 font-medium'>Listing created successfully! Redirecting...</p>
            </div>
          )}

          {error && (
            <div className='mb-6 p-4 bg-red-50 border border-red-200 rounded-lg'>
              <p className='text-red-800'>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className='space-y-8'>
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
              {/* Left Column - Property Details */}
              <div className='space-y-6'>
                <div>
                  <label className='block text-sm font-semibold text-slate-700 mb-2'>
                    Property Name *
                  </label>
                  <input
                    type='text'
                    placeholder='e.g., Modern Apartment in Downtown'
                    className='w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all'
                    id='name'
                    maxLength='62'
                    minLength='10'
                    required
                    onChange={handleChange}
                    value={formData.name}
                  />
                </div>

                <div>
                  <label className='block text-sm font-semibold text-slate-700 mb-2'>
                    Description *
                  </label>
                  <textarea
                    placeholder='Describe your property in detail...'
                    className='w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all min-h-[120px] resize-none'
                    id='description'
                    required
                    onChange={handleChange}
                    value={formData.description}
                  />
                </div>

                <div>
                  <label className='block text-sm font-semibold text-slate-700 mb-2'>
                    Address *
                  </label>
                  <input
                    type='text'
                    placeholder='Full address of the property'
                    className='w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all'
                    id='address'
                    required
                    onChange={handleChange}
                    value={formData.address}
                  />
                </div>

                {/* Property Type */}
                <div>
                  <label className='block text-sm font-semibold text-slate-700 mb-3'>
                    Property Type *
                  </label>
                  <div className='flex gap-4'>
                    <label className={`flex items-center gap-2 px-4 py-3 border-2 rounded-xl cursor-pointer transition-all ${
                      formData.type === 'sale' 
                        ? 'border-slate-600 bg-slate-100' 
                        : 'border-slate-300 hover:border-slate-400'
                    }`}>
                      <input
                        type='radio'
                        id='sale'
                        name='type'
                        className='hidden'
                        onChange={handleChange}
                        checked={formData.type === 'sale'}
                      />
                      <span className='font-medium'>For Sale</span>
                    </label>
                    <label className={`flex items-center gap-2 px-4 py-3 border-2 rounded-xl cursor-pointer transition-all ${
                      formData.type === 'rent' 
                        ? 'border-slate-600 bg-slate-100' 
                        : 'border-slate-300 hover:border-slate-400'
                    }`}>
                      <input
                        type='radio'
                        id='rent'
                        name='type'
                        className='hidden'
                        onChange={handleChange}
                        checked={formData.type === 'rent'}
                      />
                      <span className='font-medium'>For Rent</span>
                    </label>
                  </div>
                </div>

                {/* Features */}
                <div>
                  <label className='block text-sm font-semibold text-slate-700 mb-3'>
                    Features
                  </label>
                  <div className='grid grid-cols-2 gap-3'>
                    <label className='flex items-center gap-3 p-3 border border-slate-300 rounded-xl cursor-pointer hover:bg-slate-50 transition-all'>
                      <input
                        type='checkbox'
                        id='parking'
                        className='w-5 h-5 text-slate-600 rounded'
                        onChange={handleChange}
                        checked={formData.parking}
                      />
                      <FaParking className='text-slate-600' />
                      <span className='font-medium'>Parking</span>
                    </label>
                    <label className='flex items-center gap-3 p-3 border border-slate-300 rounded-xl cursor-pointer hover:bg-slate-50 transition-all'>
                      <input
                        type='checkbox'
                        id='furnished'
                        className='w-5 h-5 text-slate-600 rounded'
                        onChange={handleChange}
                        checked={formData.furnished}
                      />
                      <FaCouch className='text-slate-600' />
                      <span className='font-medium'>Furnished</span>
                    </label>
                    <label className='flex items-center gap-3 p-3 border border-slate-300 rounded-xl cursor-pointer hover:bg-slate-50 transition-all'>
                      <input
                        type='checkbox'
                        id='offer'
                        className='w-5 h-5 text-slate-600 rounded'
                        onChange={handleChange}
                        checked={formData.offer}
                      />
                      <FaTag className='text-slate-600' />
                      <span className='font-medium'>Special Offer</span>
                    </label>
                  </div>
                </div>

                {/* Property Details */}
                <div className='grid grid-cols-2 gap-4'>
                  <div className='bg-slate-50 p-4 rounded-xl'>
                    <label className='block text-sm font-semibold text-slate-700 mb-2'>
                      <FaBed className='inline mr-2' />
                      Bedrooms
                    </label>
                    <input
                      type='number'
                      id='bedrooms'
                      min='1'
                      max='10'
                      required
                      className='w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent'
                      onChange={handleChange}
                      value={formData.bedrooms}
                    />
                  </div>
                  <div className='bg-slate-50 p-4 rounded-xl'>
                    <label className='block text-sm font-semibold text-slate-700 mb-2'>
                      <FaBath className='inline mr-2' />
                      Bathrooms
                    </label>
                    <input
                      type='number'
                      id='bathrooms'
                      min='1'
                      max='10'
                      required
                      className='w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent'
                      onChange={handleChange}
                      value={formData.bathrooms}
                    />
                  </div>
                </div>

                {/* Pricing */}
                <div className='space-y-4'>
                  <div className='bg-gradient-to-r from-slate-50 to-slate-100 p-5 rounded-xl'>
                    <label className='block text-sm font-semibold text-slate-700 mb-2'>
                      Regular Price *
                    </label>
                    <div className='flex items-center gap-2'>
                      <span className='text-slate-500 font-medium'>$</span>
                      <input
                        type='number'
                        id='regularPrice'
                        min='50'
                        max='10000000'
                        required
                        className='flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent'
                        onChange={handleChange}
                        value={formData.regularPrice}
                      />
                      {formData.type === 'rent' && (
                        <span className='text-sm text-slate-600 font-medium'>/ month</span>
                      )}
                    </div>
                  </div>

                  {formData.offer && (
                    <div className='bg-gradient-to-r from-green-50 to-emerald-50 p-5 rounded-xl border border-green-200'>
                      <label className='block text-sm font-semibold text-slate-700 mb-2'>
                        Discounted Price *
                      </label>
                      <div className='flex items-center gap-2'>
                        <span className='text-slate-500 font-medium'>$</span>
                        <input
                          type='number'
                          id='discountPrice'
                          min='0'
                          max='10000000'
                          required
                          className='flex-1 px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent'
                          onChange={handleChange}
                          value={formData.discountPrice}
                        />
                        {formData.type === 'rent' && (
                          <span className='text-sm text-slate-600 font-medium'>/ month</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column - Images */}
              <div className='space-y-6'>
                <div className='bg-slate-50 p-6 rounded-xl border-2 border-dashed border-slate-300'>
                  <div className='flex items-center gap-3 mb-4'>
                    <FaImage className='text-slate-600 text-2xl' />
                    <div>
                      <h3 className='font-semibold text-slate-800'>Property Images</h3>
                      <p className='text-sm text-slate-600'>Upload up to 6 images (max 2MB each)</p>
                    </div>
                  </div>

                  <div className='flex gap-3 mb-4'>
                    <label className='flex-1 cursor-pointer'>
                      <input
                        onChange={(e) => setFiles(e.target.files)}
                        type='file'
                        id='images'
                        accept='image/*'
                        multiple
                        className='hidden'
                      />
                      <div className='w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl hover:border-slate-400 transition-all text-center font-medium text-slate-700'>
                        Choose Files
                      </div>
                    </label>
                    <button
                      type='button'
                      disabled={uploading || files.length === 0}
                      onClick={handleImageSubmit}
                      className='px-6 py-3 bg-slate-700 text-white rounded-xl font-medium hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2'
                    >
                      <FaUpload />
                      {uploading ? 'Uploading...' : 'Upload'}
                    </button>
                  </div>

                  {imageUploadError && (
                    <p className='text-red-600 text-sm mb-4 bg-red-50 p-3 rounded-lg'>{imageUploadError}</p>
                  )}

                  <div className='grid grid-cols-2 gap-3'>
                    {formData.imageUrls.map((url, index) => (
                      <div
                        key={url}
                        className='relative group bg-white p-2 rounded-xl border border-slate-200'
                      >
                        <img
                          src={url}
                          alt={`Listing ${index + 1}`}
                          className='w-full h-32 object-cover rounded-lg'
                        />
                        <button
                          type='button'
                          onClick={() => handleRemoveImage(index)}
                          className='absolute top-3 right-3 p-2 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600'
                        >
                          <FaTrash />
                        </button>
                        {index === 0 && (
                          <span className='absolute bottom-3 left-3 px-2 py-1 bg-slate-800 text-white text-xs font-medium rounded'>
                            Cover
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className='flex justify-end gap-4 pt-6 border-t border-slate-200'>
              <button
                type='button'
                onClick={() => navigate(-1)}
                className='px-6 py-3 border border-slate-300 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-all'
              >
                Cancel
              </button>
              <button
                type='submit'
                disabled={loading || uploading || formData.imageUrls.length === 0}
                className='px-8 py-3 bg-gradient-to-r from-slate-700 to-slate-800 text-white rounded-xl font-semibold hover:from-slate-800 hover:to-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl'
              >
                {loading ? 'Creating Listing...' : 'Create Listing'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
