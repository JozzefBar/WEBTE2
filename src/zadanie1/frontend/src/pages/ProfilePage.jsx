//Edit profile + login history
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateProfile, getLoginHistory } from '../api/api';
import Navbar from '../components/Navbar';

export default function ProfilePage() {
  const { user, setUser } = useAuth();

  const [firstName, setFirstName]         = useState(user?.first_name ?? '');
  const [lastName, setLastName]           = useState(user?.last_name ?? '');
  const [newPassword, setNewPassword]     = useState('');
  const [newPassRepeat, setNewPassRepeat] = useState('');
  const [errors, setErrors]   = useState({});
  const [saving, setSaving]   = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [saveMsgType, setSaveMsgType] = useState('success');

  const [history, setHistory]         = useState([]);
  const [histLoading, setHistLoading] = useState(true);

  useEffect(() => {
    getLoginHistory()
      .then(res => setHistory(res.data ?? []))
      .catch(() => setHistory([]))
      .finally(() => setHistLoading(false));
  }, []);

  const validate = () => {
    const errs = {};
    if (!firstName.trim()) errs.first_name = 'Meno je povinné';
    if (!lastName.trim()) errs.last_name = 'Priezvisko je povinné';
    if (newPassword && newPassword.length < 8) errs.new_password = 'Min. 8 znakov';
    if (newPassword && newPassword !== newPassRepeat) errs.new_password_repeat = 'Heslá sa nezhodujú';
    return errs;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setSaving(true); setSaveMsg('');
    try {
      const payload = { first_name: firstName, last_name: lastName };
      if (newPassword) payload.new_password = newPassword;
      await updateProfile(payload);
      setUser({ ...user, first_name: firstName, last_name: lastName });
      setSaveMsg('Profil bol aktualizovaný.');
      setSaveMsgType('success');
      setNewPassword(''); setNewPassRepeat('');
    } catch (err) {
      if (err.errors) setErrors(err.errors);
      else { setSaveMsg('Chyba pri ukladaní.'); setSaveMsgType('danger'); }
    } finally { setSaving(false); }
  };

  return (
    <>
      <Navbar />
      <div className="container py-4">
        <h1 className="h3 fw-bold mb-4">
          <i className="bi bi-person-gear me-2"></i>Môj profil
        </h1>

        <div className="row g-4">
          {/* Profile editing */}
          <div className="col-lg-6">
            <div className="card shadow-sm h-100">
              <div className="card-header">
                <h5 className="mb-0"><i className="bi bi-pencil me-2"></i>Upraviť údaje</h5>
              </div>
              <div className="card-body">
                <form onSubmit={handleSave} noValidate>
                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label className="form-label fw-semibold">Meno</label>
                      <input type="text"
                        className={`form-control ${errors.first_name ? 'is-invalid' : ''}`}
                        value={firstName}
                        onChange={e => { setFirstName(e.target.value); setErrors({}); }}
                      />
                      {errors.first_name && <div className="invalid-feedback">{errors.first_name}</div>}
                    </div>
                    <div className="col-6">
                      <label className="form-label fw-semibold">Priezvisko</label>
                      <input type="text"
                        className={`form-control ${errors.last_name ? 'is-invalid' : ''}`}
                        value={lastName}
                        onChange={e => { setLastName(e.target.value); setErrors({}); }}
                      />
                      {errors.last_name && <div className="invalid-feedback">{errors.last_name}</div>}
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">E-mail</label>
                    <input type="email" className="form-control" value={user?.email ?? ''} disabled />
                    <div className="form-text">Email nie je možné zmeniť.</div>
                  </div>

                  {/* Password change */}
                  {user?.auth_type === 'local' && (
                    <>
                      <hr />
                      <p className="fw-semibold text-muted small mb-2">
                        <i className="bi bi-key me-1"></i>Zmena hesla (nepovinné)
                      </p>
                      <div className="mb-3">
                        <label className="form-label">Nové heslo</label>
                        <input type="password"
                          className={`form-control ${errors.new_password ? 'is-invalid' : ''}`}
                          value={newPassword} placeholder="Nechaj prázdne ak nechceš meniť"
                          onChange={e => { setNewPassword(e.target.value); setErrors({}); }}
                        />
                        {errors.new_password && <div className="invalid-feedback">{errors.new_password}</div>}
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Nové heslo znova</label>
                        <input type="password"
                          className={`form-control ${errors.new_password_repeat ? 'is-invalid' : ''}`}
                          value={newPassRepeat}
                          onChange={e => { setNewPassRepeat(e.target.value); setErrors({}); }}
                        />
                        {errors.new_password_repeat && <div className="invalid-feedback">{errors.new_password_repeat}</div>}
                      </div>
                    </>
                  )}

                  {saveMsg && (
                    <div className={`alert alert-${saveMsgType} py-2`}>{saveMsg}</div>
                  )}

                  <button type="submit" className="btn btn-danger w-100" disabled={saving}>
                    {saving
                      ? <><span className="spinner-border spinner-border-sm me-2"></span>Ukladám...</>
                      : <><i className="bi bi-check-lg me-1"></i>Uložiť zmeny</>}
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Login history */}
          <div className="col-lg-6">
            <div className="card shadow-sm h-100">
              <div className="card-header">
                <h5 className="mb-0"><i className="bi bi-clock-history me-2"></i>História prihlásení</h5>
              </div>
              <div className="card-body p-0">
                {histLoading ? (
                  <div className="text-center py-4">
                    <div className="spinner-border spinner-border-sm text-secondary"></div>
                  </div>
                ) : history.length === 0 ? (
                  <div className="text-center text-muted py-4">
                    <i className="bi bi-inbox d-block fs-3 mb-1"></i>Žiadna história
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-sm table-hover mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Dátum a čas</th>
                          <th>Spôsob</th>
                        </tr>
                      </thead>
                      <tbody>
                        {history.map((h, i) => (
                          <tr key={i}>
                            <td className="small">{h.created_at}</td>
                            <td>
                              <span className={`badge ${h.login_type === 'google' ? 'bg-primary' : 'bg-secondary'}`}>
                                {h.login_type === 'google' ? '🔵 Google' : '🔒 Lokálne'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}