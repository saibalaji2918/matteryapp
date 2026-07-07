'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { clearTokens } from '../utils/api';
import { Bell, Heart, LogOut, PlusCircle } from 'lucide-react';
import NotificationCenter from './NotificationCenter';

interface HeaderProps {
  notificationsCount?: number;
}

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationsCount, setNotificationsCount] = useState(0);

  const handleLogout = () => {
    clearTokens();
    router.push('/login');
  };

  return (
    <header className="navbar">
      <div className="navbar-container">
        <a href="/dashboard" className="brand-logo">
          <Heart fill="#D946EF" size={24} style={{ color: 'var(--primary)' }} />
          <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>Eternal</span>
        </a>

        <nav style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <a
            href="/dashboard"
            style={{
              color: pathname === '/dashboard' ? 'var(--primary)' : 'var(--text-muted)',
              fontWeight: pathname === '/dashboard' ? '600' : '400',
              fontSize: '0.95rem',
              transition: 'var(--transition-smooth)'
            }}
          >
            Matches Feed
          </a>
          <a
            href="/profiles/create"
            style={{
              color: pathname === '/profiles/create' ? 'var(--primary)' : 'var(--text-muted)',
              fontWeight: pathname === '/profiles/create' ? '600' : '400',
              fontSize: '0.95rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              transition: 'var(--transition-smooth)'
            }}
          >
            <PlusCircle size={16} /> Add Profile
          </a>
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', position: 'relative' }}>
          {/* Notification Button */}
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-main)',
              cursor: 'pointer',
              position: 'relative',
              padding: '8px',
              borderRadius: '50%',
              backgroundColor: showNotifications ? 'rgba(255,255,255,0.05)' : 'transparent',
              transition: 'var(--transition-smooth)'
            }}
          >
            <Bell size={22} />
            {notificationsCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '4px',
                right: '4px',
                background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                color: '#fff',
                fontSize: '0.7rem',
                fontWeight: 'bold',
                borderRadius: '50%',
                width: '16px',
                height: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 8px var(--primary-glow)'
              }}>
                {notificationsCount}
              </span>
            )}
          </button>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.9rem',
              fontWeight: 500,
              padding: '6px 12px',
              borderRadius: '8px',
              transition: 'var(--transition-smooth)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#EF4444'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            <LogOut size={16} /> Logout
          </button>

          {/* Notifications Dropdown Panel */}
          {showNotifications && (
            <NotificationCenter 
              onClose={() => setShowNotifications(false)} 
              onCountChange={setNotificationsCount} 
            />
          )}
        </div>
      </div>
    </header>
  );
}
