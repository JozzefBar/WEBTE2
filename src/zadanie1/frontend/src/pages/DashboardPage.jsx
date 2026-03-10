// frontend/src/pages/DashboardPage.jsx
import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { importCSV, clearData } from '../api/api';
import Navbar from '../components/Navbar';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Import state
  const fileInputRef              = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [importing, setImporting]       = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [importError, setImportError]   = useState('');

  // Removing state
  const [clearing, setClearing]         = useState(false);
  const [clearResult, setClearResult]   = useState('');
  const [clearResultType, setClearResultType] = useState('success');
  // Confirmation before removing
  const [showConfirm, setShowConfirm]   = useState(false);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files?.[0] ?? null);
    setImportResult(null);
    setImportError('');
  };

  const handleImport = async () => {
    if (!selectedFile) { setImportError('Vyber CSV súbor'); return; }
    if (!selectedFile.name.endsWith('.csv')) { setImportError('Povolené sú len .csv súbory'); return; }
    setImporting(true); setImportError('');
    try {
      const result = await importCSV(selectedFile);
      setImportResult(result);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setSelectedFile(null);
    } catch (err) {
      setImportError(err?.error ?? 'Chyba pri importe. Skontroluj formát súboru.');
    } finally {
      setImporting(false);
    }
  };

  //Removing data
  const handleClearConfirmed = async () => {
    setShowConfirm(false);
    setClearing(true);
    setClearResult('');
    try {
      const res = await clearData();
      setClearResult(res.message);
      setClearResultType('success');
      setImportResult(null);
    } catch (err) {
      setClearResult(err.error ?? 'Chyba pri mazaní dát');
      setClearResultType('danger');
    } finally {
      setClearing(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="container py-4">
        <h1 className="h3 fw-bold mb-4">
          <i className="bi bi-speedometer2 me-2"></i>Administrácia
        </h1>

        {/* Info about user */}
        <div className="card shadow-sm mb-4 card-panel">
          <div className="card-header card-header-main">
            <h5 className="mb-0">
              <i className="bi bi-person-circle me-2"></i>Prihlásený používateľ
            </h5>
          </div>
          <div className="card-body">
            <div className="row g-3 align-items-center">
              <div className="col-md-8">
                <h4 className="mb-1">{user?.first_name} {user?.last_name}</h4>
                <p className="text-muted mb-2">
                  <i className="bi bi-envelope me-1"></i>{user?.email}
                </p>
                <span className={`badge ${user?.auth_type === 'google' ? 'bg-primary' : 'bg-secondary'}`}>
                  {user?.auth_type === 'google' ? '🔵 Google účet' : '🔒 Lokálne konto'}
                </span>
              </div>
              <div className="col-md-4 text-md-end">
                <button className="btn btn-outline-primary btn-sm" onClick={() => navigate('/profile')}>
                  <i className="bi bi-gear me-1"></i>Spravovať profil
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Import CSV */}
        <div className="card shadow-sm mb-4 card-panel">
          <div className="card-header">
            <h5 className="mb-0">
              <i className="bi bi-upload me-2"></i>Import dát zo súboru CSV
            </h5>
          </div>
          <div className="card-body">
            <p className="text-muted small mb-3">
              Nahraj CSV súbor s olympionikmi. Oddeľovač stĺpcov musí byť: <code>;</code>
            </p>
            <div className="mb-3">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="form-control form-input"
                onChange={handleFileChange}
              />
            </div>
            {importError && (
              <div className="alert alert-danger py-2">
                <i className="bi bi-exclamation-circle me-1"></i>{importError}
              </div>
            )}
            <button
              className="btn btn-primary btn-action"
              onClick={handleImport}
              disabled={importing || !selectedFile}
            >
              {importing
                ? <><span className="spinner-border spinner-border-sm me-2"></span>Importujem...</>
                : <><i className="bi bi-cloud-upload me-1"></i>Spustiť import</>}
            </button>

            {importResult && (
              <div className={`alert mt-3 ${importResult.success ? 'alert-success' : 'alert-danger'}`}>
                <strong>{importResult.message}</strong>
                <div className="mt-1 small">
                  Vložených: <strong>{importResult.inserted}</strong>
                  {' · '}Preskočených: <strong>{importResult.skipped}</strong>
                </div>
                {importResult.errors?.length > 0 && (
                  <details className="mt-2">
                    <summary className="small" style={{ cursor: 'pointer' }}>
                      Zobraziť chyby ({importResult.errors.length})
                    </summary>
                    <ul className="small mt-1 mb-0">
                      {importResult.errors.map((e, i) => <li key={i}>{e}</li>)}
                    </ul>
                  </details>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Data removing */}
        <div className="card shadow-sm border-danger card-panel">
          <div className="card-header bg-danger text-white">
            <h5 className="mb-0">
              <i className="bi bi-trash3 me-2"></i>Vymazať všetky dáta
            </h5>
          </div>
          <div className="card-body">
            <p className="text-muted small mb-3">
              Vymaže všetkých olympionikov, medaily, disciplíny a krajiny z databázy.
              Po vymazaní je možné nahrať nový import.
              <strong className="text-danger"> Táto akcia je nevratná.</strong>
            </p>

            {/* Remove confirmation */}
            {!showConfirm ? (
              <button
                className="btn btn-outline-danger"
                onClick={() => { setShowConfirm(true); setClearResult(''); }}
                disabled={clearing}
              >
                <i className="bi bi-trash3 me-1"></i>Vymazať všetky dáta
              </button>
            ) : (
              <div className="alert alert-danger">
                <p className="fw-bold mb-2">
                  <i className="bi bi-exclamation-triangle me-1"></i>
                  Si si istý? Táto akcia vymaže VŠETKY olympijské dáta!
                </p>
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={handleClearConfirmed}
                    disabled={clearing}
                  >
                    {clearing
                      ? <><span className="spinner-border spinner-border-sm me-1"></span>Mažem...</>
                      : <><i className="bi bi-check-lg me-1"></i>Áno, vymazať</>}
                  </button>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => setShowConfirm(false)}
                    disabled={clearing}
                  >
                    <i className="bi bi-x-lg me-1"></i>Zrušiť
                  </button>
                </div>
              </div>
            )}

            {clearResult && (
              <div className={`alert alert-${clearResultType} mt-3 py-2`}>
                <i className={`bi ${clearResultType === 'success' ? 'bi-check-circle' : 'bi-exclamation-circle'} me-1`}></i>
                {clearResult}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}