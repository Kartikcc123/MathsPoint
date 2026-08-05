import React, { useState, useEffect } from 'react';
import { X, Upload, Loader } from 'lucide-react';
import { createAdvertisement, updateAdvertisement } from '../../services/advertisementService';

const AdvertisementFormModal = ({ ad, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    buttonText: '',
    redirectLink: '',
    priority: 0,
    status: 'active',
    type: 'image',
    backgroundColor: 'bg-gradient-to-r from-blue-500 to-purple-600',
  });
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progressText, setProgressText] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (ad) {
      setFormData({
        title: ad.title || '',
        description: ad.description || '',
        buttonText: ad.buttonText || '',
        redirectLink: ad.redirectLink || '',
        priority: ad.priority || 0,
        status: ad.status || 'active',
        type: ad.type || 'image',
        backgroundColor: ad.backgroundColor || 'bg-gradient-to-r from-blue-500 to-purple-600',
      });
      setPreviewUrl(ad.desktopImage || null);
    }
  }, [ad]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('Image size exceeds 10 MB limit.');
        return;
      }
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!ad && !file && formData.type === 'image') {
      setError('Please select a banner image.');
      return;
    }
    
    if (formData.type === 'text-card' && !formData.title) {
      setError('Title is required for Text Cards.');
      return;
    }

    try {
      setIsSubmitting(true);
      setProgressText(formData.type === 'image' ? 'Uploading and processing...' : 'Saving Text Card...');
      
      const submitData = new FormData();
      Object.keys(formData).forEach(key => {
        submitData.append(key, formData[key]);
      });
      if (file) {
        submitData.append('image', file);
      }

      if (ad) {
        await updateAdvertisement(ad._id, submitData);
      } else {
        await createAdvertisement(submitData);
      }
      
      setProgressText('Completed Successfully!');
      setTimeout(() => {
        onSuccess();
      }, 500);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to save advertisement. Check AWS credentials.');
      setIsSubmitting(false);
      setProgressText('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">
            {ad ? 'Edit Advertisement' : 'Create Advertisement'}
          </h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          <form id="ad-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="flex gap-4 mb-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="type" value="image" checked={formData.type === 'image'} onChange={handleInputChange} className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-gray-700">Image Banner</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="type" value="text-card" checked={formData.type === 'text-card'} onChange={handleInputChange} className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-gray-700">Colorful Text Card</span>
              </label>
            </div>

            {formData.type === 'image' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Banner Image</label>
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:bg-gray-50 transition-colors relative cursor-pointer" onClick={() => document.getElementById('image-upload').click()}>
                  {previewUrl ? (
                    <div className="relative aspect-[16/9] w-full">
                      <img src={previewUrl} alt="Preview" className="w-full h-full object-contain rounded-lg" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center text-white font-medium rounded-lg">
                        Click to change image
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
                        <Upload size={24} />
                      </div>
                      <p className="font-medium text-gray-700 mb-1">Click to upload banner image</p>
                      <p className="text-sm text-gray-500 mb-2">JPG, PNG, WebP up to 10MB</p>
                      <div className="text-xs bg-yellow-50 text-yellow-700 px-3 py-1 rounded-full border border-yellow-200">
                        Recommended size: 1920 × 600 (aspect ratio 3.2:1)
                      </div>
                    </div>
                  )}
                  <input 
                    type="file" 
                    id="image-upload" 
                    accept="image/jpeg, image/png, image/webp" 
                    className="hidden" 
                    onChange={handleFileChange} 
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Choose Background Color</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    'bg-gradient-to-r from-blue-500 to-purple-600',
                    'bg-gradient-to-r from-emerald-500 to-teal-500',
                    'bg-gradient-to-r from-orange-400 to-pink-500',
                    'bg-gradient-to-r from-slate-800 to-slate-900',
                    'bg-gradient-to-r from-cyan-500 to-blue-500',
                    'bg-gradient-to-r from-rose-400 to-red-500',
                    'bg-gradient-to-r from-violet-500 to-fuchsia-500',
                    'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-800'
                  ].map((color) => (
                    <div 
                      key={color} 
                      onClick={() => handleInputChange({ target: { name: 'backgroundColor', value: color } })}
                      className={`h-16 rounded-xl cursor-pointer border-2 transition-all ${color} ${formData.backgroundColor === color ? 'border-blue-600 scale-105 shadow-md' : 'border-transparent hover:scale-105'}`}
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title {formData.type === 'text-card' && '*'}</label>
                <input type="text" name="title" value={formData.title} onChange={handleInputChange} required={formData.type === 'text-card'} className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="e.g. Summer Sale 50% Off" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Button Text</label>
                <input type="text" name="buttonText" value={formData.buttonText} onChange={handleInputChange} className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="e.g. Attempt Now" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description / Subtitles (separate with | or new line)</label>
              <textarea name="description" value={formData.description} onChange={handleInputChange} rows="3" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="e.g. Just 15 mins | 15 quick questions" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Redirect URL</label>
              <input type="url" name="redirectLink" value={formData.redirectLink} onChange={handleInputChange} className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="https://" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <input type="number" name="priority" value={formData.priority} onChange={handleInputChange} className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="Higher number = higher priority" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select name="status" value={formData.status} onChange={handleInputChange} className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            {isSubmitting && (
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-center gap-3 text-blue-700">
                <Loader className="animate-spin text-blue-600" size={20} />
                <span className="font-medium">{progressText}</span>
              </div>
            )}
          </form>
        </div>

        <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-xl">
          <button type="button" onClick={onClose} disabled={isSubmitting} className="px-5 py-2.5 text-gray-700 font-medium hover:bg-gray-200 rounded-lg transition-colors">
            Cancel
          </button>
          <button type="submit" form="ad-form" disabled={isSubmitting} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2">
            {isSubmitting ? <Loader className="animate-spin" size={18} /> : null}
            {ad ? 'Update' : 'Upload & Process'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdvertisementFormModal;
