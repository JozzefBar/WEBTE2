import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function WelcomeToast() {
  const [toast, setToast] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const raw = sessionStorage.getItem('welcome_toast');
    if (!raw) return;
    sessionStorage.removeItem('welcome_toast');
    setToast(JSON.parse(raw));

    const timer = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  if (!toast) return null;

  return (
    <div
      className="position-fixed top-0 end-0 p-3"
      style={{ zIndex: 9998, marginTop: '70px' }}
    >
      <div className="toast show shadow" role="alert">
        <div className="toast-header bg-danger text-white">
          <i className="bi bi-trophy-fill me-2"></i>
          <strong className="me-auto">
            {toast.type === 'register' ? 'Vitajte!' : 'Vitajte späť!'}
          </strong>
          <button
            type="button"
            className="btn-close btn-close-white"
            onClick={() => setToast(null)}
          />
        </div>
        <div className="toast-body">
          {toast.type === 'register'
            ? <>Váš účet bol úspešne vytvorený. Vítame vás, <strong>{toast.name}</strong>!</>
            : <>Úspešne ste sa prihlásili. Dobrý deň, <strong>{toast.name}</strong>!</>
          }
        </div>
      </div>
    </div>
  );
}
