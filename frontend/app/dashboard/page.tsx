'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '../../components/Header';
import { apiRequest, getAuthToken } from '../../utils/api';
import { Heart, X, Search, SlidersHorizontal, Image as ImageIcon, MapPin, Calendar, ArrowRight, Eye, ShieldAlert, Sparkles } from 'lucide-react';

interface ProfileItem {
  id: number;
  name: string;
  gender: string;
  dob: string;
  height: number;
  complexion: string;
  education: string;
  occupation: string;
  rasi: string;
  nakshatram: string;
  gothram: string;
  marital_status: string;
  image_base64: string;
  is_image_revealed: boolean;
  has_pending_request: boolean;
  birth_place?: string;
  address?: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<ProfileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [error, setError] = useState('');
  
  // Search & Filter state
  const [filters, setFilters] = useState({
    min_age: '',
    max_age: '',
    min_height: '',
    max_height: '',
    rasi: '',
    nakshatram: '',
    gothram: '',
    location: '',
  });

  const getAge = (dobString: string) => {
    const today = new Date();
    const birthDate = new Date(dobString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const fetchProfiles = useCallback(async () => {
    setLoading(true);
    setError('');
    
    // Construct query parameters
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, val]) => {
      if (val) params.append(key, val);
    });

    try {
      const res = await apiRequest(`profiles/?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        // Set list. Django REST framework paginates by default, get results
        setProfiles(data.results || data);
        setCurrentIndex(0);
      } else {
        setError('Could not fetch matches. Authenticate and try again.');
      }
    } catch (e) {
      setError('Connection failed. Please check backend status.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    if (!getAuthToken()) {
      router.push('/login');
      return;
    }
    fetchProfiles();
  }, [fetchProfiles, router]);

  const handleSwipe = async (direction: 'left' | 'right', profileId: number) => {
    const action = direction === 'right' ? 'like' : 'pass';
    
    try {
      // Optimistic state update
      setCurrentIndex((prev) => prev + 1);

      await apiRequest('permissions/swipes/', {
        method: 'POST',
        body: JSON.stringify({
          profile: profileId,
          action: action
        })
      });
    } catch (err) {
      console.error('Error logging swipe: ', err);
    }
  };

  const handleRequestAccess = async (profileId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await apiRequest('permissions/image-requests/', {
        method: 'POST',
        body: JSON.stringify({ profile: profileId })
      });
      if (res.ok) {
        // Update local profile state to show requested status
        setProfiles(prev =>
          prev.map(p => (p.id === profileId ? { ...p, has_pending_request: true } : p))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const handleResetFilters = () => {
    setFilters({
      min_age: '',
      max_age: '',
      min_height: '',
      max_height: '',
      rasi: '',
      nakshatram: '',
      gothram: '',
      location: '',
    });
  };

  const currentProfile = profiles[currentIndex];

  return (
    <div className="main-layout">
      <Header />
      
      <div className="content-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* Toggle Filters Panel */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Discover Matches</h2>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="btn-secondary"
            style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
          >
            <SlidersHorizontal size={16} /> Filters
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel" 
            style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Min Age</label>
                <input type="number" name="min_age" className="form-input" value={filters.min_age} onChange={handleFilterChange} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Max Age</label>
                <input type="number" name="max_age" className="form-input" value={filters.max_age} onChange={handleFilterChange} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Min Height (cm)</label>
                <input type="number" name="min_height" className="form-input" value={filters.min_height} onChange={handleFilterChange} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Max Height (cm)</label>
                <input type="number" name="max_height" className="form-input" value={filters.max_height} onChange={handleFilterChange} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Rasi</label>
                <input type="text" name="rasi" className="form-input" placeholder="e.g. Mesha" value={filters.rasi} onChange={handleFilterChange} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Nakshatram</label>
                <input type="text" name="nakshatram" className="form-input" placeholder="e.g. Aswini" value={filters.nakshatram} onChange={handleFilterChange} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Gothram</label>
                <input type="text" name="gothram" className="form-input" placeholder="e.g. Kashyapa" value={filters.gothram} onChange={handleFilterChange} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Location</label>
                <input type="text" name="location" className="form-input" placeholder="e.g. Chennai" value={filters.location} onChange={handleFilterChange} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button onClick={handleResetFilters} className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                Reset
              </button>
              <button onClick={fetchProfiles} className="btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}>
                Apply Filters
              </button>
            </div>
          </motion.div>
        )}

        {/* Swipe Card Deck Area */}
        <div style={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          padding: '2rem 0'
        }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem' }}>
              <div style={{
                border: '4px solid rgba(255,255,255,0.05)',
                borderTop: '4px solid var(--primary)',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 1rem auto'
              }}></div>
              <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
              <p style={{ color: 'var(--text-muted)' }}>Searching for profiles...</p>
            </div>
          ) : error ? (
            <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem', maxWidth: '400px' }}>
              <ShieldAlert size={48} color="var(--error)" style={{ marginBottom: '1rem' }} />
              <p style={{ color: '#FCA5A5', marginBottom: '1.5rem' }}>{error}</p>
              <button onClick={fetchProfiles} className="btn-primary">Retry</button>
            </div>
          ) : !currentProfile ? (
            <div className="glass-panel" style={{ 
              textAlign: 'center', 
              padding: '4rem 2rem', 
              maxWidth: '500px', 
              border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: '24px'
            }}>
              <Sparkles size={48} color="var(--primary)" style={{ marginBottom: '1rem', opacity: 0.8 }} />
              <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', fontWeight: 700 }}>You've reached the end!</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.5', marginBottom: '2rem' }}>
                There are no more matching opposite-gender profiles available. Try relaxing your filters or add another profile for yourself.
              </p>
              <button onClick={() => { handleResetFilters(); setTimeout(fetchProfiles, 100); }} className="btn-secondary">
                Reset Filters & Reload
              </button>
            </div>
          ) : (
            <div style={{ position: 'relative', width: '100%', maxWidth: '420px', height: '620px' }}>
              <AnimatePresence>
                <motion.div
                  key={currentProfile.id}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  onDragEnd={(e, info) => {
                    if (info.offset.x > 150) {
                      handleSwipe('right', currentProfile.id);
                    } else if (info.offset.x < -150) {
                      handleSwipe('left', currentProfile.id);
                    }
                  }}
                  style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    cursor: 'grab'
                  }}
                >
                  <div className="glass-panel" style={{
                    height: '100%',
                    padding: 0,
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '24px',
                    boxShadow: '0 30px 60px rgba(0,0,0,0.6)'
                  }}>
                    {/* Image Area */}
                    <div style={{ position: 'relative', height: '360px', width: '100%', background: '#111' }}>
                      {currentProfile.image_base64 ? (
                        <img 
                          src={currentProfile.image_base64} 
                          alt="Profile" 
                          style={{ 
                            width: '100%', 
                            height: '100%', 
                            objectFit: 'cover',
                            pointerEvents: 'none'
                          }} 
                        />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)' }}>
                          <ImageIcon size={64} style={{ opacity: 0.2 }} />
                        </div>
                      )}

                      {/* Image Blur Permission Overlay */}
                      {!currentProfile.is_image_revealed && (
                        <div style={{
                          position: 'absolute',
                          inset: 0,
                          background: 'rgba(11, 10, 17, 0.45)',
                          backdropFilter: 'blur(10px)',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '1rem',
                          textAlign: 'center',
                          pointerEvents: 'auto'
                        }}>
                          <Eye size={24} style={{ color: 'var(--primary)', marginBottom: '0.75rem' }} />
                          <h4 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '0.25rem' }}>Image Blurred</h4>
                          <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', maxWidth: '220px', marginBottom: '1.25rem' }}>
                            You need approval from the profile manager to view the photo.
                          </p>
                          {currentProfile.has_pending_request ? (
                            <span style={{
                              padding: '6px 16px',
                              borderRadius: '8px',
                              backgroundColor: 'rgba(245, 158, 11, 0.1)',
                              border: '1px solid rgba(245, 158, 11, 0.2)',
                              color: 'var(--accent)',
                              fontSize: '0.8rem',
                              fontWeight: 600
                            }}>
                              Access Requested
                            </span>
                          ) : (
                            <button 
                              onClick={(e) => handleRequestAccess(currentProfile.id, e)}
                              className="btn-primary" 
                              style={{ padding: '6px 16px', borderRadius: '8px', fontSize: '0.8rem' }}
                            >
                              Request Access
                            </button>
                          )}
                        </div>
                      )}

                      {/* Floating Gender Badge */}
                      <span style={{
                        position: 'absolute',
                        top: '16px',
                        left: '16px',
                        padding: '4px 12px',
                        borderRadius: '20px',
                        background: 'rgba(11, 10, 17, 0.65)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: currentProfile.gender === 'Male' ? '#60A5FA' : '#F472B6'
                      }}>
                        {currentProfile.gender}
                      </span>
                    </div>

                    {/* Details Area */}
                    <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.5rem' }}>
                          <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{currentProfile.name}</h3>
                          <span style={{ color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: 600 }}>
                            {getAge(currentProfile.dob)} yrs
                          </span>
                        </div>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                          {currentProfile.rasi && <span className="badge" style={{ backgroundColor: 'rgba(255,255,255,0.04)', padding: '3px 8px', borderRadius: '6px', fontSize: '0.75rem', border: '1px solid rgba(255,255,255,0.05)' }}>Rasi: {currentProfile.rasi}</span>}
                          {currentProfile.nakshatram && <span className="badge" style={{ backgroundColor: 'rgba(255,255,255,0.04)', padding: '3px 8px', borderRadius: '6px', fontSize: '0.75rem', border: '1px solid rgba(255,255,255,0.05)' }}>Star: {currentProfile.nakshatram}</span>}
                          {currentProfile.gothram && <span className="badge" style={{ backgroundColor: 'rgba(255,255,255,0.04)', padding: '3px 8px', borderRadius: '6px', fontSize: '0.75rem', border: '1px solid rgba(255,255,255,0.05)' }}>Gothram: {currentProfile.gothram}</span>}
                          {currentProfile.marital_status && <span className="badge" style={{ backgroundColor: 'rgba(255,255,255,0.04)', padding: '3px 8px', borderRadius: '6px', fontSize: '0.75rem', border: '1px solid rgba(255,255,255,0.05)' }}>{currentProfile.marital_status}</span>}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                          {currentProfile.education && <p><strong>Education:</strong> {currentProfile.education}</p>}
                          {currentProfile.occupation && <p><strong>Profession:</strong> {currentProfile.occupation}</p>}
                          {currentProfile.height && <p><strong>Height:</strong> {currentProfile.height} cm</p>}
                        </div>
                      </div>

                      {/* Swiping Buttons */}
                      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1rem' }}>
                        <button
                          onClick={() => handleSwipe('left', currentProfile.id)}
                          style={{
                            width: '52px',
                            height: '52px',
                            borderRadius: '50%',
                            backgroundColor: 'rgba(239, 68, 68, 0.08)',
                            border: '1px solid rgba(239, 68, 68, 0.2)',
                            color: '#F87171',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'var(--transition-smooth)'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.2)'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.08)'}
                        >
                          <X size={24} />
                        </button>
                        <button
                          onClick={() => handleSwipe('right', currentProfile.id)}
                          style={{
                            width: '52px',
                            height: '52px',
                            borderRadius: '50%',
                            backgroundColor: 'rgba(16, 185, 129, 0.08)',
                            border: '1px solid rgba(16, 185, 129, 0.2)',
                            color: '#34D399',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'var(--transition-smooth)'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(16, 185, 129, 0.2)'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(16, 185, 129, 0.08)'}
                        >
                          <Heart size={24} fill="#34D399" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}
