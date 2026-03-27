import React, { useState } from 'react';
import { X, Upload, Link, AlertCircle } from 'lucide-react';
import { parseICS } from '../services/icsService';
import type { ExternalEvent } from '../types';

interface ImportModalProps {
  onClose: () => void;
  onImport: (events: ExternalEvent[]) => void;
}

const ImportModal: React.FC<ImportModalProps> = ({ onClose, onImport }) => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    try {
      const text = await file.text();
      const events = parseICS(text, 'upload');
      onImport(events);
      onClose();
    } catch (err) {
      setError('Failed to parse ICS file. Please check the format.');
    } finally {
      setLoading(false);
    }
  };

  const handleUrlSync = async () => {
    if (!url) return;
    setLoading(true);
    setError(null);
    try {
      // Note: Direct fetch might fail due to CORS. 
      // We advise user to upload a file if sync fails.
      const response = await fetch(url);
      if (!response.ok) throw new Error();
      const text = await response.text();
      const events = parseICS(text, 'google'); // Default to google for URL
      onImport(events);
      onClose();
    } catch (err) {
      setError('Could not sync via URL. This is usually due to security (CORS) settings on the calendar provider. Please download the .ics file and upload it instead.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(4px)'
    }}>
      <div className="modal-content" style={{
        background: 'var(--bg-card)',
        padding: '2rem',
        borderRadius: '16px',
        border: '1px solid var(--border)',
        width: '90%',
        maxWidth: '500px',
        position: 'relative'
      }}>
        <button onClick={onClose} style={{
          position: 'absolute',
          top: '1rem',
          right: '1rem',
          background: 'transparent',
          border: 'none',
          color: 'var(--text-dim)',
          cursor: 'pointer'
        }}><X /></button>

        <h2 style={{ color: 'var(--accent-gold)', marginBottom: '1.5rem', fontWeight: 300 }}>Import Calendar</h2>

        {error && (
          <div style={{ 
            background: 'rgba(255, 0, 0, 0.1)', 
            color: '#ff6b6b', 
            padding: '1rem', 
            borderRadius: '8px', 
            marginBottom: '1rem',
            fontSize: '0.85rem',
            display: 'flex',
            gap: '0.5rem'
          }}>
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <div style={{ marginBottom: '2rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-dim)' }}>
            Option 1: Upload .ics file (Google/Proton)
          </label>
          <div style={{ position: 'relative' }}>
            <input 
              type="file" 
              accept=".ics" 
              onChange={handleFileUpload}
              style={{
                width: '100%',
                padding: '1rem',
                border: '1px dashed var(--border)',
                borderRadius: '8px',
                cursor: 'pointer',
                color: 'transparent'
              }}
            />
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: 'var(--accent-silver)'
            }}>
              <Upload size={18} /> Click to upload
            </div>
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-dim)' }}>
            Option 2: Sync via URL (Beta)
          </label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input 
              type="text" 
              placeholder="https://calendar.google.com/..." 
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              style={{
                flex: 1,
                padding: '0.8rem',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                color: 'var(--text-main)',
                fontSize: '0.9rem'
              }}
            />
            <button 
              onClick={handleUrlSync}
              disabled={loading || !url}
              style={{
                padding: '0.8rem 1.2rem',
                background: 'var(--accent-gold)',
                color: 'var(--bg-deep)',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              {loading ? '...' : <Link size={18} />}
            </button>
          </div>
        </div>

        <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontStyle: 'italic' }}>
          *Your data stays private and is only stored on your local browser.
        </p>
      </div>
    </div>
  );
};

export default ImportModal;
