import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function WelcomeToast() {
  const [toast, setToast] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Google OAuth redirect — check URL params
    const params = new URLSearchParams(location.search);
    if (params.get('welcome') === 'google') {
      const name = params.get('name') ?? '';
      setToast({ type: 'login', name });
      // Remove query params from URL without reload
      navigate('/dashboard', { replace: true });
      const timer = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(timer);
    }

    // Normal login/register — check sessionStorage
    const raw = sessionStorage.getItem('welcome_toast');
    if (!raw) return;
    sessionStorage.removeItem('welcome_toast');
    setToast(JSON.parse(raw));

    const timer = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(timer);
  }, [location.pathname, location.search]);

  if (!toast) return null;

  return (
    <div
      className="position-fixed top-0 start-0 end-0 p-3 d-flex justify-content-center justify-content-md-end"
      style={{ zIndex: 9998, marginTop: '70px', pointerEvents: 'none' }}
    >
      <div className="toast show shadow" role="alert" style={{ pointerEvents: 'auto', width: '100%', maxWidth: '350px' }}>
        <div className="toast-header bg-primary text-white">
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
