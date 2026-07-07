'use client';

import React, { useState, useEffect, useRef } from 'react';
import { apiRequest, getWsUrl, getAuthToken } from '../utils/api';
import { Check, X, Bell, Shield, Heart, Image as ImageIcon } from 'lucide-react';

interface NotificationItem {
  id: number;
  message: string;
  read: boolean;
  created_at: string;
  sender_name?: string;
}

interface ImageRequestItem {
  id: number;
  request_user: {
    id: number;
    username: string;
  };
  profile_details: {
    id: number;
    name: string;
  };
  status: string;
  requested_at: string;
}

interface NotificationCenterProps {
  onClose: () => void;
  onCountChange: (count: number) => void;
}

export default function NotificationCenter({ onClose, onCountChange }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [imageRequests, setImageRequests] = useState<ImageRequestItem[]>([]);
  const [tab, setTab] = useState<'notifications' | 'requests'>('notifications');
  const socketRef = useRef<WebSocket | null>(null);

  const fetchNotifications = async () => {
    try {
      const res = await apiRequest('notifications/');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.results || data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchImageRequests = async () => {
    try {
      const res = await apiRequest('permissions/image-requests/incoming/');
      if (res.ok) {
        const data = await res.json();
        setImageRequests(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchNotifications();
    fetchImageRequests();

    // Connect WebSocket for real-time notifications
    const token = getAuthToken();
    if (token) {
      const wsUrl = `${getWsUrl()}/notifications/?token=${token}`;
      const ws = new WebSocket(wsUrl);
      socketRef.current = ws;

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'notification') {
          // Play a micro sound or trigger alert
          setNotifications((prev) => [
            {
              id: data.id,
              message: data.message,
              read: false,
              created_at: data.created_at,
              sender_name: data.sender,
            },
            ...prev,
          ]);
          // Re-fetch incoming requests just in case it is an access request
          fetchImageRequests();
        }
      };

      ws.onclose = () => {
        console.log('Notification socket closed');
      };
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []);

  // Update header count based on unread items
  useEffect(() => {
    const unreadCount = notifications.filter(n => !n.read).length + imageRequests.filter(r => r.status === 'pending').length;
    onCountChange(unreadCount);
  }, [notifications, imageRequests, onCountChange]);

  const markAsRead = async (id: number) => {
    try {
      const res = await apiRequest(`notifications/${id}/mark_read/`, { method: 'POST' });
      if (res.ok) {
        setNotifications(prev =>
          prev.map(n => (n.id === id ? { ...n, read: true } : n))
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  const markAllRead = async () => {
    try {
      const res = await apiRequest('notifications/mark_all_read/', { method: 'POST' });
      if (res.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRequestAction = async (requestId: number, action: 'approve' | 'reject') => {
    try {
      const res = await apiRequest(`permissions/image-requests/${requestId}/${action}/`, {
        method: 'POST'
      });
      if (res.ok) {
        // Remove from list
        setImageRequests(prev => prev.filter(r => r.id !== requestId));
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div style={{
      position: 'absolute',
      top: '50px',
      right: '0',
      width: '360px',
      maxHeight: '480px',
      background: 'rgba(20, 18, 30, 0.95)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '16px',
      boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 1000,
      overflow: 'hidden'
    }}>
      {/* Header Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <button
          onClick={() => setTab('notifications')}
          style={{
            flex: 1,
            padding: '1rem',
            background: 'none',
            border: 'none',
            color: tab === 'notifications' ? 'var(--primary)' : 'var(--text-muted)',
            fontWeight: '600',
            cursor: 'pointer',
            borderBottom: tab === 'notifications' ? '2px solid var(--primary)' : 'none',
            fontSize: '0.9rem'
          }}
        >
          Notifications
        </button>
        <button
          onClick={() => setTab('requests')}
          style={{
            flex: 1,
            padding: '1rem',
            background: 'none',
            border: 'none',
            color: tab === 'requests' ? 'var(--primary)' : 'var(--text-muted)',
            fontWeight: '600',
            cursor: 'pointer',
            borderBottom: tab === 'requests' ? '2px solid var(--primary)' : 'none',
            fontSize: '0.9rem',
            position: 'relative'
          }}
        >
          Image Requests
          {imageRequests.length > 0 && (
            <span style={{
              marginLeft: '6px',
              padding: '2px 6px',
              borderRadius: '10px',
              backgroundColor: 'var(--secondary)',
              color: '#fff',
              fontSize: '0.7rem'
            }}>{imageRequests.length}</span>
          )}
        </button>
      </div>

      {/* Content Area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem' }}>
        {tab === 'notifications' ? (
          <>
            {notifications.length > 0 && (
              <div style={{ textAlign: 'right', padding: '0.25rem 0.5rem' }}>
                <button
                  onClick={markAllRead}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--primary)',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    fontWeight: 500
                  }}
                >
                  Mark all as read
                </button>
              </div>
            )}
            
            {notifications.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                <Bell size={28} style={{ opacity: 0.5, marginBottom: '0.5rem' }} />
                <p style={{ fontSize: '0.85rem' }}>No new notifications</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => !n.read && markAsRead(n.id)}
                  style={{
                    padding: '0.75rem',
                    borderRadius: '10px',
                    marginBottom: '0.5rem',
                    backgroundColor: n.read ? 'transparent' : 'rgba(255, 255, 255, 0.03)',
                    borderLeft: n.read ? 'none' : '3px solid var(--primary)',
                    cursor: n.read ? 'default' : 'pointer',
                    transition: 'var(--transition-smooth)'
                  }}
                >
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                    <div style={{ color: n.message.includes('match') ? 'var(--secondary)' : 'var(--primary)', marginTop: '2px' }}>
                      {n.message.includes('match') ? <Heart size={16} fill="var(--secondary)" /> : <Shield size={16} />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '0.85rem', lineHeight: '1.3', color: n.read ? 'var(--text-muted)' : 'var(--text-main)' }}>
                        {n.message}
                      </p>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', display: 'block', marginTop: '4px' }}>
                        {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </>
        ) : (
          <>
            {imageRequests.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                <ImageIcon size={28} style={{ opacity: 0.5, marginBottom: '0.5rem' }} />
                <p style={{ fontSize: '0.85rem' }}>No pending requests</p>
              </div>
            ) : (
              imageRequests.map((r) => (
                <div
                  key={r.id}
                  style={{
                    padding: '0.75rem',
                    borderRadius: '10px',
                    marginBottom: '0.5rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255,255,255,0.05)',
                  }}
                >
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                    <strong style={{ color: 'var(--primary)' }}>{r.request_user.username}</strong> requested access to view{' '}
                    <strong>{r.profile_details.name}</strong>'s image.
                  </p>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => handleRequestAction(r.id, 'reject')}
                      className="btn-secondary"
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        gap: '2px',
                        color: 'var(--error)',
                        borderColor: 'rgba(239, 68, 68, 0.2)'
                      }}
                    >
                      <X size={12} /> Decline
                    </button>
                    <button
                      onClick={() => handleRequestAction(r.id, 'approve')}
                      className="btn-primary"
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        gap: '2px'
                      }}
                    >
                      <Check size={12} /> Approve
                    </button>
                  </div>
                </div>
              ))
            )}
          </>
        )}
      </div>
    </div>
  );
}
