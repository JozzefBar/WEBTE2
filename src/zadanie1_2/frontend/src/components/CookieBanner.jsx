
//information about cookies during first page visit
//using local storage for remembering if user accept

import { useState, useEffect } from 'react';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // check whether the user has previously agreed.
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      // first visit - show banner
      setVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie_consent', 'accepted');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className="position-fixed bottom-0 start-0 end-0 px-3 py-2"
      style={{ zIndex: 9999 }}
    >
      <div className="container">
        <div className="card shadow border-0 card-panel">
          <div className="card-body py-2 px-3">
            <div className="d-flex align-items-center gap-3">
              <span className="small text-muted flex-grow-1">
                <i className="bi bi-shield-check me-1 text-warning"></i>
                <strong>Cookies:</strong> Používame session cookies nevyhnutné pre fungovanie prihlásenia.
              </span>
              <button className="btn btn-primary btn-action btn-sm flex-shrink-0" onClick={handleAccept}>
                <i className="bi bi-check-lg me-1"></i>Súhlasím
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}