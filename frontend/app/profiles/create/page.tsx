'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../../components/Header';
import { apiRequest } from '../../../utils/api';
import { User, Shield, Info, Heart, Award, Home, Phone, Upload } from 'lucide-react';

export default function CreateProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    gender: 'Male',
    dob: '',
    marital_status: 'Never Married',
    birth_time: '',
    birth_place: '',
    height: '',
    complexion: '',
    education: '',
    occupation: '',
    nakshatram: '',
    rasi: '',
    gothram: '',
    mother_gothram: '',
    father_name: '',
    father_occupation: '',
    mother_name: '',
    siblings: '',
    siblings_occupation: '',
    inlaw_name: '',
    address: '',
    mobile: '',
    email: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image file exceeds the 5MB size limit.');
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const uploadData = new FormData();
      Object.entries(formData).forEach(([key, val]) => {
        uploadData.append(key, val);
      });
      if (imageFile) {
        uploadData.append('image', imageFile);
      }

      const res = await apiRequest('profiles/', {
        method: 'POST',
        body: uploadData,
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/dashboard');
        }, 1500);
      } else {
        setError(JSON.stringify(data) || 'Failed to create profile. Please check validation requirements.');
      }
    } catch (err) {
      setError('Connection failure. Try checking your environment config.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-layout">
      <Header />
      <div className="content-container" style={{ maxWidth: '900px' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-sans)', fontWeight: 800, marginBottom: '0.5rem' }}>
            Register Matrimonial Profile
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Enter the marriage-eligibility profile details.
          </p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            color: '#FCA5A5',
            padding: '1rem',
            borderRadius: '12px',
            marginBottom: '2.5rem'
          }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            color: '#A7F3D0',
            padding: '1rem',
            borderRadius: '12px',
            marginBottom: '2.5rem',
            textAlign: 'center',
            fontWeight: 600
          }}>
            Profile Created Successfully! Redirecting to Dashboard...
          </div>
        )}

        <form onSubmit={handleSubmit} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Section 1: Basic Details */}
          <div>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem', marginBottom: '1.25rem', color: 'var(--primary)' }}>
              <User size={18} /> Basic Details
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input type="text" name="name" className="form-input" value={formData.name} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Gender</label>
                <select name="gender" className="form-select" value={formData.gender} onChange={handleChange} required>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">Date of Birth</label>
                <input type="date" name="dob" className="form-input" value={formData.dob} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Marital Status</label>
                <select name="marital_status" className="form-select" value={formData.marital_status} onChange={handleChange} required>
                  <option value="Never Married">Never Married</option>
                  <option value="Divorced">Divorced</option>
                  <option value="Widowed">Widowed</option>
                  <option value="Awaiting Divorce">Awaiting Divorce</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Image Upload */}
          <div>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem', marginBottom: '1.25rem', color: 'var(--primary)' }}>
              <Upload size={18} /> Profile Image
            </h3>
            <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
              <div style={{
                width: '120px',
                height: '120px',
                borderRadius: '16px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px dashed var(--bg-card-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden'
              }}>
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <User size={40} style={{ opacity: 0.3 }} />
                )}
              </div>
              <div style={{ flex: 1 }}>
                <input
                  type="file"
                  accept="image/*"
                  id="image-upload-input"
                  style={{ display: 'none' }}
                  onChange={handleImageChange}
                />
                <label
                  htmlFor="image-upload-input"
                  className="btn-secondary"
                  style={{ cursor: 'pointer', padding: '0.6rem 1.2rem', fontSize: '0.9rem' }}
                >
                  <Upload size={16} /> Choose Image
                </label>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                  Supported formats: JPG, PNG. Max size: 5MB. Blurs automatically by default.
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: Horoscope & Astro */}
          <div>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem', marginBottom: '1.25rem', color: 'var(--primary)' }}>
              <Info size={18} /> Horoscope & Astro Details
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">Birth Time</label>
                <input type="time" name="birth_time" className="form-input" value={formData.birth_time} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Birth Place</label>
                <input type="text" name="birth_place" className="form-input" value={formData.birth_place} onChange={handleChange} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">Rasi</label>
                <input type="text" name="rasi" className="form-input" value={formData.rasi} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Nakshatram</label>
                <input type="text" name="nakshatram" className="form-input" value={formData.nakshatram} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Gothram</label>
                <input type="text" name="gothram" className="form-input" value={formData.gothram} onChange={handleChange} />
              </div>
            </div>
          </div>

          {/* Section 4: physical & Education */}
          <div>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem', marginBottom: '1.25rem', color: 'var(--primary)' }}>
              <Award size={18} /> Appearance & Professional details
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">Height (in cm)</label>
                <input type="number" step="0.1" name="height" className="form-input" placeholder="e.g. 172.5" value={formData.height} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Complexion</label>
                <input type="text" name="complexion" className="form-input" value={formData.complexion} onChange={handleChange} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">Education Qualification</label>
                <input type="text" name="education" className="form-input" value={formData.education} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Occupation</label>
                <input type="text" name="occupation" className="form-input" value={formData.occupation} onChange={handleChange} />
              </div>
            </div>
          </div>

          {/* Section 5: Family Details */}
          <div>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem', marginBottom: '1.25rem', color: 'var(--primary)' }}>
              <Home size={18} /> Family & Parentage
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">Father's Name</label>
                <input type="text" name="father_name" className="form-input" value={formData.father_name} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Father's Occupation</label>
                <input type="text" name="father_occupation" className="form-input" value={formData.father_occupation} onChange={handleChange} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">Mother's Name</label>
                <input type="text" name="mother_name" className="form-input" value={formData.mother_name} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Mother's Gothram</label>
                <input type="text" name="mother_gothram" className="form-input" value={formData.mother_gothram} onChange={handleChange} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">Siblings (Brothers/Sisters)</label>
                <input type="text" name="siblings" className="form-input" placeholder="e.g. 1 Brother, 1 Sister" value={formData.siblings} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Sibling's Occupation</label>
                <input type="text" name="siblings_occupation" className="form-input" value={formData.siblings_occupation} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Inlaws Names / Details</label>
                <input type="text" name="inlaw_name" className="form-input" value={formData.inlaw_name} onChange={handleChange} />
              </div>
            </div>
          </div>

          {/* Section 6: Contact & Address */}
          <div>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem', marginBottom: '1.25rem', color: 'var(--primary)' }}>
              <Phone size={18} /> Contact & Address
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">Contact Mobile</label>
                <input type="text" name="mobile" className="form-input" value={formData.mobile} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Contact Email</label>
                <input type="email" name="email" className="form-input" value={formData.email} onChange={handleChange} required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Home Address</label>
              <textarea name="address" rows={3} className="form-textarea" value={formData.address} onChange={handleChange}></textarea>
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', height: '52px', fontSize: '1.1rem', marginTop: '1rem' }}
          >
            {loading ? 'Registering Profile...' : 'Save Profile'}
          </button>
        </form>
      </div>
    </div>
  );
}
