
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

  const handleDecline = () => {
    localStorage.setItem('cookie_consent', 'declined');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className="position-fixed bottom-0 start-0 end-0 p-3"
      style={{ zIndex: 9999 }}
    >
      <div className="container">
        <div className="card shadow-lg border-0">
          <div className="card-body">
            <div className="row align-items-center g-3">
              <div className="col-lg-8">
                <h6 className="fw-bold mb-1">
                  <i className="bi bi-shield-check me-2 text-warning"></i>
                  Táto stránka používa cookies
                </h6>
                <p className="small text-muted mb-0">
                  Používame session cookies na zabezpečenie prihlásenia a fungovania aplikácie.
                  Tieto cookies sú nevyhnutné pre správne fungovanie stránky a obsahujú
                  iba technické údaje (identifikátor relácie). Žiadne osobné údaje
                  nie sú zdieľané s tretími stranami.
                </p>
              </div>
              <div className="col-lg-4 d-flex gap-2 justify-content-lg-end">
                <button
                  className="btn btn-outline-secondary btn-sm"
                  onClick={handleDecline}
                >
                  Odmietnuť
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={handleAccept}
                >
                  <i className="bi bi-check-lg me-1"></i>
                  Súhlasím
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}