import React, { useState, useEffect } from 'react';
import { getAdvertisements, deleteAdvertisement } from '../../services/advertisementService';
import { Plus, Edit, Trash2, LayoutGrid, List as ListIcon, Image as ImageIcon } from 'lucide-react';
import AdvertisementFormModal from '../../components/Admin/AdvertisementFormModal';

const AdminAdvertisements = () => {
  const [ads, setAds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAd, setSelectedAd] = useState(null);

  const fetchAds = async () => {
    try {
      setIsLoading(true);
      const data = await getAdvertisements();
      setAds(data.advertisements || []);
    } catch (error) {
      console.error('Error fetching ads', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAds();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this advertisement?')) {
      try {
        await deleteAdvertisement(id);
        fetchAds();
      } catch (error) {
        alert('Failed to delete');
      }
    }
  };

  const handleEdit = (ad) => {
    setSelectedAd(ad);
    setIsModalOpen(true);
  };

  const openNewModal = () => {
    setSelectedAd(null);
    setIsModalOpen(true);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Advertisement Management</h1>
        <button 
          onClick={openNewModal}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus size={20} />
          <span>New Advertisement</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6 flex justify-between items-center">
        <div className="flex gap-2">
          <button 
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <LayoutGrid size={20} />
          </button>
          <button 
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <ListIcon size={20} />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : ads.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <ImageIcon className="text-gray-400" size={32} />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No advertisements</h3>
          <p className="text-gray-500">Get started by creating a new banner ad.</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ads.map(ad => (
            <div key={ad._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
              <div className={`aspect-[16/9] relative ${ad.type === 'text-card' ? ad.backgroundColor : 'bg-gray-100'} flex flex-col items-center justify-center p-4 text-center`}>
                {ad.type === 'text-card' ? (
                  <h4 className={`font-bold text-lg ${ad.backgroundColor.includes('gray-100') ? 'text-gray-900' : 'text-white'}`}>{ad.title}</h4>
                ) : (
                  <img src={ad.thumbnailImage} alt={ad.title} className="w-full h-full object-contain" />
                )}
                <div className={`absolute top-3 right-3 px-2 py-1 rounded text-xs font-bold ${ad.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                  {ad.status.toUpperCase()}
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-gray-900 truncate mb-1">{ad.title}</h3>
                <div className="flex justify-between text-sm text-gray-500 mb-4">
                  <span>Priority: {ad.priority}</span>
                  <span>Clicks: {ad.clicks}</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(ad)} className="flex-1 flex items-center justify-center gap-1 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded transition-colors text-sm">
                    <Edit size={16} /> Edit
                  </button>
                  <button onClick={() => handleDelete(ad._id)} className="flex-1 flex items-center justify-center gap-1 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded transition-colors text-sm">
                    <Trash2 size={16} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="p-4 font-medium text-gray-500">Banner</th>
                <th className="p-4 font-medium text-gray-500">Title</th>
                <th className="p-4 font-medium text-gray-500">Status</th>
                <th className="p-4 font-medium text-gray-500">Priority</th>
                <th className="p-4 font-medium text-gray-500">Performance</th>
                <th className="p-4 font-medium text-gray-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {ads.map(ad => (
                <tr key={ad._id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="p-4">
                    <div className={`w-24 h-14 rounded overflow-hidden flex items-center justify-center text-center p-1 ${ad.type === 'text-card' ? ad.backgroundColor : 'bg-gray-100'}`}>
                      {ad.type === 'text-card' ? (
                        <span className={`text-[10px] font-bold leading-tight ${ad.backgroundColor.includes('gray-100') ? 'text-gray-900' : 'text-white'}`}>{ad.title.substring(0, 20)}</span>
                      ) : (
                        <img src={ad.thumbnailImage} alt={ad.title} className="w-full h-full object-contain" />
                      )}
                    </div>
                  </td>
                  <td className="p-4 font-medium text-gray-900">{ad.title}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${ad.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                      {ad.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-4 text-gray-600">{ad.priority}</td>
                  <td className="p-4">
                    <div className="text-sm">
                      <div className="text-gray-900">{ad.impressions} Views</div>
                      <div className="text-gray-500">{ad.clicks} Clicks</div>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <button onClick={() => handleEdit(ad)} className="p-2 text-gray-500 hover:text-blue-600 transition-colors">
                      <Edit size={18} />
                    </button>
                    <button onClick={() => handleDelete(ad._id)} className="p-2 text-gray-500 hover:text-red-600 transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <AdvertisementFormModal 
          ad={selectedAd} 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={() => {
            setIsModalOpen(false);
            fetchAds();
          }} 
        />
      )}
    </div>
  );
};

export default AdminAdvertisements;
