// Toast component – shows success or error message that auto-disappears
import { useEffect } from 'react';

export default function Toast({ message, type = 'success', onClose }) {
  // Auto-close the toast after 3 seconds for success
  useEffect(() => {
    if (!message) return;
    if (type === 'error' || type === 'warning') return;

    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    // Cleanup: if component unmounts or message changes, cancel the timer
    return () => clearTimeout(timer);
  }, [message, type, onClose]);

  // Don't render anything if there's no message
  if (!message) return null;

  return (
    // Fixed position in top-right corner, above everything else (z-index)
    <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999 }}>
      <div className={`alert alert-${type === 'error' ? 'danger' : type === 'warning' ? 'warning' : 'success'} alert-dismissible shadow`}>
        <div className="d-flex align-items-start">
          <i className={`bi ${type === 'error' || type === 'warning' ? 'bi-exclamation-circle' : 'bi-check-circle'} me-2 mt-1`}></i>
          <span style={{ whiteSpace: 'pre-line' }}>{message}</span>
        </div>
        <button type="button" className="btn-close" onClick={onClose}></button>
      </div>
    </div>
  );
}
