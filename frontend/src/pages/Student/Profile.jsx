import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import { Camera, Edit, Save, X, UserCircle } from 'lucide-react';

const Profile = () => {
  const { user, login } = useContext(AuthContext); // Use login to update context user state
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    city: user?.city || '',
    academicClass: user?.academicClass || '',
    board: user?.board || '',
    exams: user?.exams || '',
    language: user?.language || '',
  });
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await api.put('/student/profile', formData);
      
      // Update local AuthContext with new user data
      // We assume login(res.data) works if your context is setup that way, 
      // or we just need to refresh the page. Let's just refresh for safety if login doesn't take user data directly.
      // But typically, a context might have a setUser method.
      
      setIsEditing(false);
      window.location.reload(); // Quickest way to ensure all navbars update correctly
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300 pb-10">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">My Profile</h1>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100">
          {error}
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Left Column: Avatar & Basic Info */}
        <div className="w-full md:w-64 shrink-0 flex flex-col items-center p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="relative mb-4">
            <div className="w-32 h-32 bg-[#ffca28] rounded-full flex items-center justify-center text-slate-800 text-5xl font-bold shadow-inner overflow-hidden">
               {user?.avatar ? (
                 <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
               ) : (
                 user?.name?.charAt(0) || <UserCircle className="w-20 h-20 opacity-50" />
               )}
            </div>
            {isEditing && (
              <button className="absolute bottom-0 right-0 p-2 bg-[#5a4bda] text-white rounded-full hover:bg-indigo-700 transition shadow-md">
                <Camera className="w-4 h-4" />
              </button>
            )}
          </div>
          <h2 className="text-xl font-bold text-slate-800 text-center leading-tight mb-1">{user?.name}</h2>
          <p className="text-sm font-semibold text-slate-500 mb-6">{user?.phone || 'No phone added'}</p>

          <div className="w-full py-2 px-4 bg-orange-50 text-orange-600 rounded-xl border border-orange-100 flex items-center justify-center gap-2 font-bold text-sm">
            <span className="text-lg">🛡️</span> Level 1
          </div>
        </div>

        {/* Right Column: Profile Details Form */}
        <div className="flex-1 w-full bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-slate-100">
            <h3 className="text-lg font-bold text-slate-800">Profile Detail</h3>
            {!isEditing ? (
              <button 
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1.5 text-sm font-semibold text-[#5a4bda] hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition"
              >
                <Edit className="w-4 h-4" /> Edit
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsEditing(false)}
                  className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:bg-slate-50 px-3 py-1.5 rounded-lg transition"
                >
                  <X className="w-4 h-4" /> Cancel
                </button>
                <button 
                  onClick={handleSave}
                  disabled={isLoading}
                  className="flex items-center gap-1.5 text-sm font-semibold text-white bg-[#5a4bda] hover:bg-indigo-700 px-4 py-1.5 rounded-lg transition disabled:opacity-50"
                >
                  {isLoading ? 'Saving...' : <><Save className="w-4 h-4" /> Save</>}
                </button>
              </div>
            )}
          </div>

          <div className="p-6 space-y-8">
            {/* Personal Details */}
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Personal Details</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500">Name</label>
                  {isEditing ? (
                    <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full text-sm p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#5a4bda] focus:ring-1 focus:ring-[#5a4bda]" />
                  ) : (
                    <p className="text-sm font-semibold text-slate-800">{user?.name}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500">Mobile No</label>
                  {isEditing ? (
                    <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="w-full text-sm p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#5a4bda] focus:ring-1 focus:ring-[#5a4bda]" />
                  ) : (
                    <p className="text-sm font-semibold text-slate-800">{user?.phone || 'N/A'}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500">Email</label>
                  <p className="text-sm font-semibold text-slate-800">{user?.email}</p>
                  {isEditing && <p className="text-[10px] text-slate-400">Email cannot be changed.</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500">Living City/Village/Town</label>
                  {isEditing ? (
                    <input type="text" name="city" value={formData.city} onChange={handleChange} className="w-full text-sm p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#5a4bda] focus:ring-1 focus:ring-[#5a4bda]" />
                  ) : (
                    <p className="text-sm font-semibold text-slate-800">{user?.city || 'N/A'}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Academic Details */}
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Academic Details</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500">Class</label>
                  {isEditing ? (
                    <input type="text" name="academicClass" value={formData.academicClass} onChange={handleChange} className="w-full text-sm p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#5a4bda] focus:ring-1 focus:ring-[#5a4bda]" />
                  ) : (
                    <p className="text-sm font-semibold text-slate-800">{user?.academicClass || 'N/A'}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500">Board/State Board</label>
                  {isEditing ? (
                    <input type="text" name="board" value={formData.board} onChange={handleChange} className="w-full text-sm p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#5a4bda] focus:ring-1 focus:ring-[#5a4bda]" />
                  ) : (
                    <p className="text-sm font-semibold text-slate-800">{user?.board || 'N/A'}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500">Exams</label>
                  {isEditing ? (
                    <input type="text" name="exams" value={formData.exams} onChange={handleChange} className="w-full text-sm p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#5a4bda] focus:ring-1 focus:ring-[#5a4bda]" />
                  ) : (
                    <p className="text-sm font-semibold text-slate-800">{user?.exams || 'N/A'}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500">Language</label>
                  {isEditing ? (
                    <input type="text" name="language" value={formData.language} onChange={handleChange} className="w-full text-sm p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#5a4bda] focus:ring-1 focus:ring-[#5a4bda]" />
                  ) : (
                    <p className="text-sm font-semibold text-slate-800">{user?.language || 'N/A'}</p>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
