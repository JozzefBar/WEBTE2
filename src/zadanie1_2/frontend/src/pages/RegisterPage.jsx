import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../api/api';
import Navbar from '../components/Navbar';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ first_name:'', last_name:'', email:'', password:'', password_repeat:'' });
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);
  const [qrCode, setQrCode]   = useState('');
  const [tfaSecret, setTfaSecret] = useState('');
  const [registered, setRegistered] = useState(false);

  const set = (field) => (e) => { setForm(f => ({ ...f, [field]: e.target.value })); setErrors({}); };

  const validate = () => {
    const errs = {};
    if (!form.first_name.trim()) errs.first_name = 'Meno je povinné';
    else if (form.first_name.length > 64) errs.first_name = 'Max. 64 znakov';
    if (!form.last_name.trim()) errs.last_name = 'Priezvisko je povinné';
    else if (form.last_name.length > 64) errs.last_name = 'Max. 64 znakov';
    if (!form.email) errs.email = 'Email je povinný';
    else if (form.email.length > 128) errs.email = 'Max. 128 znakov';
    else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(form.email)) errs.email = 'Neplatný formát emailu';
    if (!form.password) errs.password = 'Heslo je povinné';
    else if (form.password.length < 8) errs.password = 'Min. 8 znakov';
    if (!form.password_repeat) errs.password_repeat = 'Zopakuj heslo';
    else if (form.password !== form.password_repeat) errs.password_repeat = 'Heslá sa nezhodujú';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setLoading(true);
    try {
      const res = await register({ first_name: form.first_name, last_name: form.last_name, email: form.email, password: form.password });
      setQrCode(res.qr_code);
      setTfaSecret(res.tfa_secret);
      setRegistered(true);
      sessionStorage.setItem('welcome_toast', JSON.stringify({ type: 'register', name: form.first_name }));
    } catch (err) {
      if (err.errors) setErrors(err.errors);
      else setErrors({ global: err.error ?? 'Chyba registrácie' });
    } finally { setLoading(false); }
  };

  if (registered) return (
    <>
      <Navbar />
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card shadow-sm text-center card-panel">
              <div className="card-body p-4">
                <div className="fs-1 mb-2">✅</div>
                <h2 className="h4 fw-bold">Registrácia úspešná!</h2>
                <p className="text-muted mb-3">
                  Naskenuj QR kód v aplikácii <strong>Google Authenticator</strong> alebo <strong>Authy</strong>.
                </p>
                <div className="d-flex justify-content-center mb-3">
                  <img src={qrCode} alt="QR kód pre 2FA" className="qr-image" />
                </div>
                <div className="bg-light rounded p-3 mb-3">
                  <small className="text-muted d-block mb-1">Alebo zadaj kód manuálne:</small>
                  <code className="fs-6 fw-bold" style={{letterSpacing:'0.15rem'}}>{tfaSecret}</code>
                </div>
                <div className="alert alert-warning py-2 text-start small">
                  <i className="bi bi-exclamation-triangle me-1"></i>
                  <strong>Dôležité:</strong> Tento kód sa zobrazí len raz. Naskenuj ho teraz alebo si ho ulož.
                </div>
                <button className="btn btn-primary btn-action w-100" onClick={() => navigate('/login')}>
                  Naskenoval som — pokračovať na prihlásenie
                  <i className="bi bi-arrow-right ms-1"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      <Navbar />
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card shadow-sm card-panel">
              <div className="card-body p-4">
                <h1 className="h4 fw-bold mb-4 text-center">
                  <i className="bi bi-person-plus me-2"></i>Registrácia
                </h1>
                <form onSubmit={handleSubmit} noValidate>
                  {errors.global && <div className="alert alert-danger py-2">{errors.global}</div>}

                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label className="form-label fw-semibold">Meno</label>
                      <input type="text" className={`form-control form-input ${errors.first_name ? 'is-invalid' : ''}`}
                        value={form.first_name} onChange={set('first_name')} placeholder="Ján" />
                      {errors.first_name && <div className="invalid-feedback">{errors.first_name}</div>}
                    </div>
                    <div className="col-6">
                      <label className="form-label fw-semibold">Priezvisko</label>
                      <input type="text" className={`form-control form-input ${errors.last_name ? 'is-invalid' : ''}`}
                        value={form.last_name} onChange={set('last_name')} placeholder="Novák" />
                      {errors.last_name && <div className="invalid-feedback">{errors.last_name}</div>}
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">E-mail</label>
                    <input type="email" className={`form-control form-input ${errors.email ? 'is-invalid' : ''}`}
                      value={form.email} onChange={set('email')} placeholder="jan@priklad.sk" />
                    {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Heslo</label>
                    <input type="password" className={`form-control form-input ${errors.password ? 'is-invalid' : ''}`}
                      value={form.password} onChange={set('password')} placeholder="Min. 8 znakov" />
                    {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-semibold">Heslo znova</label>
                    <input type="password" className={`form-control form-input ${errors.password_repeat ? 'is-invalid' : ''}`}
                      value={form.password_repeat} onChange={set('password_repeat')} />
                    {errors.password_repeat && <div className="invalid-feedback">{errors.password_repeat}</div>}
                  </div>

                  <button type="submit" className="btn btn-primary btn-action w-100 mb-3" disabled={loading}>
                    {loading
                      ? <><span className="spinner-border spinner-border-sm me-2"></span>Registrujem...</>
                      : <><i className="bi bi-person-check me-1"></i>Vytvoriť konto</>}
                  </button>
                  <p className="text-center small mb-0">
                    Už máš účet? <Link to="/login" className="text-primary fw-semibold">Prihlás sa</Link>
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}