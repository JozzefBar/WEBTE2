// frontend/src/pages/LoginPage.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login, verify2fa } from '../api/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

export default function LoginPage() {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const [step, setStep]         = useState(1);
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [errors, setErrors]     = useState({});
  const [loading, setLoading]   = useState(false);
  const [globalError, setGlobalError] = useState('');

  const validateStep1 = () => {
    const errs = {};
    if (!email) errs.email = 'Email je povinný';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Neplatný formát emailu';
    if (!password) errs.password = 'Heslo je povinné';
    return errs;
  };

  const handleStep1 = async (e) => {
    e.preventDefault();
    const errs = validateStep1();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setLoading(true); setGlobalError('');
    try {
      await login(email, password);
      setStep(2);
    } catch (err) {
      if (err.errors) setErrors(err.errors);
      else setGlobalError(err.error ?? 'Chyba prihlásenia');
    } finally { setLoading(false); }
  };

  const handleStep2 = async (e) => {
    e.preventDefault();
    if (!totpCode || totpCode.length !== 6) { setErrors({ code: 'Zadajte 6-miestny kód' }); return; }
    setLoading(true); setGlobalError('');
    try {
      const res = await verify2fa(totpCode);
      setUser(res.user);
      navigate('/dashboard');
    } catch (err) {
      setGlobalError(err.error ?? 'Nesprávny kód');
    } finally { setLoading(false); }
  };

  return (
    <>
      <Navbar />
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-5">
            <div className="card shadow-sm">
              <div className="card-body p-4">
                <h1 className="h4 fw-bold mb-4 text-center">
                  <i className="bi bi-box-arrow-in-right me-2"></i>Prihlásenie
                </h1>

                {step === 1 && (
                  <form onSubmit={handleStep1} noValidate>
                    {globalError && (
                      <div className="alert alert-danger py-2">
                        <i className="bi bi-exclamation-circle me-1"></i>{globalError}
                      </div>
                    )}

                    <div className="mb-3">
                      <label className="form-label fw-semibold">E-mail</label>
                      <input
                        type="email" className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                        value={email} placeholder="jan@priklad.sk"
                        onChange={e => { setEmail(e.target.value); setErrors({}); }}
                        autoComplete="email"
                      />
                      {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                    </div>

                    <div className="mb-4">
                      <label className="form-label fw-semibold">Heslo</label>
                      <input
                        type="password" className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                        value={password}
                        onChange={e => { setPassword(e.target.value); setErrors({}); }}
                        autoComplete="current-password"
                      />
                      {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                    </div>

                    <button type="submit" className="btn btn-danger w-100 mb-3" disabled={loading}>
                      {loading
                        ? <><span className="spinner-border spinner-border-sm me-2"></span>Prihlasujem...</>
                        : 'Prihlásiť sa'}
                    </button>

                    <div className="text-center text-muted small mb-3">alebo</div>

                    <a
                      href="http://localhost:8080/backend/api/auth/oauth2callback.php"
                      className="btn btn-outline-secondary w-100 mb-3"
                    >
                      <i className="bi bi-google me-2"></i>
                        Prihlásiť sa cez Google
                    </a>

                    <p className="text-center small mb-0">
                      Nemáš účet? <Link to="/register" className="text-danger fw-semibold">Zaregistruj sa</Link>
                    </p>
                  </form>
                )}

                {step === 2 && (
                  <form onSubmit={handleStep2} noValidate>
                    <div className="alert alert-info py-2 mb-3">
                      <i className="bi bi-shield-lock me-2"></i>
                      Zadaj kód z <strong>Google Authenticator</strong> pre <strong>Olympic Games APP</strong>
                    </div>

                    {globalError && (
                      <div className="alert alert-danger py-2">
                        <i className="bi bi-exclamation-circle me-1"></i>{globalError}
                      </div>
                    )}

                    <div className="mb-4">
                      <label className="form-label fw-semibold">6-miestny kód</label>
                      <input
                        type="text" inputMode="numeric" maxLength={6}
                        className={`form-control totp-input ${errors.code ? 'is-invalid' : ''}`}
                        value={totpCode} placeholder="000000" autoFocus
                        onChange={e => { setTotpCode(e.target.value.replace(/\D/g, '')); setErrors({}); }}
                      />
                      {errors.code && <div className="invalid-feedback">{errors.code}</div>}
                    </div>

                    <button type="submit" className="btn btn-danger w-100 mb-2" disabled={loading}>
                      {loading
                        ? <><span className="spinner-border spinner-border-sm me-2"></span>Overujem...</>
                        : <><i className="bi bi-check-lg me-1"></i>Potvrdiť</>}
                    </button>
                    <button type="button" className="btn btn-outline-secondary w-100"
                      onClick={() => { setStep(1); setTotpCode(''); setErrors({}); setGlobalError(''); }}>
                      <i className="bi bi-arrow-left me-1"></i>Späť
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}