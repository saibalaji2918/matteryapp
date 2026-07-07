'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiRequest } from '../../utils/api';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    mobile: '',
    password: '',
    confirm_password: '',
    gender: 'Male',
    dob: '',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.email.toLowerCase().endsWith('@gmail.com')) {
      newErrors.email = 'Only Gmail addresses (@gmail.com) are allowed.';
    }
    
    if (formData.password !== formData.confirm_password) {
      newErrors.confirm_password = 'Passwords do not match.';
    }
    
    if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError('');
    setErrors({});
    
    if (!validate()) return;
    
    setLoading(true);

    try {
      const res = await apiRequest('accounts/register/', {
        method: 'POST',
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        router.push('/login');
      } else {
        if (typeof data === 'object') {
          const apiErrors: Record<string, string> = {};
          Object.keys(data).forEach((key) => {
            if (Array.isArray(data[key])) {
              apiErrors[key] = data[key].join(' ');
            } else {
              apiErrors[key] = data[key];
            }
          });
          setErrors(apiErrors);
        } else {
          setGeneralError('Registration failed. Please try again.');
        }
      }
    } catch (err) {
      setGeneralError('Something went wrong. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem',
      position: 'relative'
    }}>
      <div className="glass-panel" style={{
        maxWidth: '550px',
        width: '100%',
        boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
        border: '1px solid rgba(255,255,255,0.06)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ 
            display: 'inline-flex', 
            padding: '12px', 
            borderRadius: '16px', 
            background: 'linear-gradient(135deg, rgba(219,39,119,0.1), rgba(217,70,239,0.1))',
            marginBottom: '1rem'
          }}>
            <Sparkles size={32} color="#D946EF" />
          </div>
          <h2 style={{ fontSize: '2rem', fontFamily: 'var(--font-sans)', fontWeight: 800, letterSpacing: '-0.025em' }}>
            Create Account
          </h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', fontSize: '0.95rem' }}>
            Register to set up and manage matrimonial profiles
          </p>
        </div>

        {generalError && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            color: '#FCA5A5',
            padding: '0.8rem 1rem',
            borderRadius: '10px',
            marginBottom: '1.5rem',
            fontSize: '0.9rem'
          }}>
            {generalError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Username</label>
              <input
                type="text"
                name="username"
                className="form-input"
                value={formData.username}
                onChange={handleChange}
                required
              />
              {errors.username && <span style={{ color: '#FCA5A5', fontSize: '0.8rem' }}>{errors.username}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Email (Gmail only)</label>
              <input
                type="email"
                name="email"
                className="form-input"
                placeholder="name@gmail.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
              {errors.email && <span style={{ color: '#FCA5A5', fontSize: '0.8rem' }}>{errors.email}</span>}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Mobile Number</label>
              <input
                type="text"
                name="mobile"
                className="form-input"
                placeholder="+919876543210"
                value={formData.mobile}
                onChange={handleChange}
                required
              />
              {errors.mobile && <span style={{ color: '#FCA5A5', fontSize: '0.8rem' }}>{errors.mobile}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Gender</label>
              <select
                name="gender"
                className="form-select"
                value={formData.gender}
                onChange={handleChange}
                required
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
              {errors.gender && <span style={{ color: '#FCA5A5', fontSize: '0.8rem' }}>{errors.gender}</span>}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Date of Birth</label>
            <input
              type="date"
              name="dob"
              className="form-input"
              value={formData.dob}
              onChange={handleChange}
              required
            />
            {errors.dob && <span style={{ color: '#FCA5A5', fontSize: '0.8rem' }}>{errors.dob}</span>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                name="password"
                className="form-input"
                value={formData.password}
                onChange={handleChange}
                required
              />
              {errors.password && <span style={{ color: '#FCA5A5', fontSize: '0.8rem' }}>{errors.password}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input
                type="password"
                name="confirm_password"
                className="form-input"
                value={formData.confirm_password}
                onChange={handleChange}
                required
              />
              {errors.confirm_password && <span style={{ color: '#FCA5A5', fontSize: '0.8rem' }}>{errors.confirm_password}</span>}
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', height: '48px', fontSize: '1rem' }}
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: 'var(--primary)', fontWeight: '600' }}>
            Log In
          </Link>
        </div>
      </div>
    </div>
  );
}
