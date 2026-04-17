import { getAthletesREST, importCSV, clearData, deleteAthlete, batchCreateAthletes, createAthlete, updateAthlete, getAthleteREST } from '../api/api';
import AthleteForm from '../components/AthleteForm';
import Toast from '../components/Toast';

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

import DataTable from "datatables.net-react";
import DT from "datatables.net-bs5";
import "datatables.net-bs5/css/dataTables.bootstrap5.min.css";

DataTable.use(DT);

const dtLanguage = {
  search:     "Hľadať:",
  lengthMenu: "Zobraziť _MENU_ záznamov",
  info:       "Záznamy _START_ – _END_ z _TOTAL_",
  infoEmpty:  "Žiadne záznamy",
  emptyTable: "Žiadne záznamy",
  zeroRecords:"Žiadne záznamy",
  paginate: { first: "«", last: "»", next: "›", previous: "‹" },
};

const MEDAL_ICON = { 1: "🥇", 2: "🥈", 3: "🥉" };

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Import state
  const fileInputRef              = useRef(null);
  const formRef                   = useRef(null);
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
  const [deleteAthleteId, setDeleteAthleteId] = useState(null);

  // --- Athletes CRUD state ---
  const tableRef                      = useRef(null);
  const [athletes, setAthletes]       = useState([]);
  const [loadingAthletes, setLoadingAthletes] = useState(true);
  const [showForm, setShowForm]       = useState(false);    // show create form?
  const [editAthlete, setEditAthlete] = useState(null);     // athlete being edited
  const [toast, setToast]             = useState({ message: '', type: 'success' });

  // Filters state
  const [years,       setYears]       = useState([]);
  const [disciplines, setDisciplines] = useState([]);
  const [selectedYear,       setSelectedYear]       = useState("");
  const [selectedDiscipline, setSelectedDiscipline] = useState("");
  const [selectedType,       setSelectedType]       = useState("");
  const [selectedPlacing,    setSelectedPlacing]    = useState("");

  // Load athletes on page load
  useEffect(() => {
    loadAthletes();
  }, []);

  const loadAthletes = async () => {
    setLoadingAthletes(true);
    try {
      const res = await getAthletesREST();
      setAthletes(res.data || []);
      setYears(res.filters?.years || []);
      setDisciplines(res.filters?.disciplines || []);
    } catch (err) {
      setToast({ message: 'Failed to load athletes', type: 'error' });
    } finally {
      setLoadingAthletes(false);
    }
  };

  // Scroll to form when opening Edit/Create
  useEffect(() => {
    if (showForm || editAthlete) {
      setTimeout(() => {
        if (formRef.current) {
          // Calculate the exact position of the form and subtract 80px (for navbar offset)
          const yOffset = formRef.current.getBoundingClientRect().top + window.scrollY - 80;
          window.scrollTo({ top: yOffset, behavior: 'smooth' });
        }
      }, 100);
    }
  }, [showForm, editAthlete]);

  // DataTables filters + column visibility
  useEffect(() => {
    if (!tableRef.current) return;
    const dt = tableRef.current.dt();
    dt.column(4).search(selectedYear ? `^${selectedYear}$` : '', true, false).draw();
    dt.column(4).visible(!selectedYear);
  }, [selectedYear]);

  useEffect(() => {
    if (!tableRef.current) return;
    const dt = tableRef.current.dt();
    dt.column(3).search(selectedDiscipline, false, true).draw();
    dt.column(3).visible(!selectedDiscipline);
  }, [selectedDiscipline]);

  useEffect(() => {
    if (!tableRef.current) return;
    const dt = tableRef.current.dt();
    dt.column(5).search(selectedType ? `^${selectedType}$` : '', true, false).draw();
    dt.column(5).visible(!selectedType);
  }, [selectedType]);

  useEffect(() => {
    if (!tableRef.current) return;
    const dt = tableRef.current.dt();
    dt.column(6).search(selectedPlacing ? `^${selectedPlacing}$` : '', true, false).draw();
  }, [selectedPlacing]);

  // Handle creating a new athlete
  const handleCreate = async (formData) => {
    try {
      await createAthlete(formData);
      setToast({ message: 'Olympionik bol úspešne pridaný!', type: 'success' });
      setShowForm(false);
      loadAthletes(); // refresh the table
    } catch (err) {
      setToast({ message: err.error || 'Chyba pri pridávaní', type: 'error' });
    }
  };

  // Handle updating an existing athlete
  const handleUpdate = async (formData) => {
    try {
      await updateAthlete(editAthlete.id, formData);
      setToast({ message: 'Olympionik bol úspešne upravený!', type: 'success' });
      setEditAthlete(null);
      loadAthletes();
    } catch (err) {
      setToast({ message: err.error || 'Chyba pri úprave', type: 'error' });
    }
  };

  // Handle deleting an athlete via Custom Modal
  const handleDeleteConfirmed = async () => {
    if (!deleteAthleteId) return;
    try {
      await deleteAthlete(deleteAthleteId.id);
      setToast({ message: 'Olympionik bol úspešne vymazaný!', type: 'success' });
      setDeleteAthleteId(null);
      loadAthletes();
    } catch (err) {
      setToast({ message: err.error || 'Chyba pri mazaní', type: 'error' });
      setDeleteAthleteId(null);
    }
  };

  const dtColumns = [
    { data: "first_name", title: "Meno" },
    { data: "last_name", title: "Priezvisko" },
    { data: "birth_date", title: "Dát. narodenia", render: (data) => data || '–' },
    { data: "discipline", title: "Disciplína", render: (data) => data || '–' },
    { data: "year", title: "Rok OH", render: (data) => data || '–' },
    { data: "games_type", title: "Typ OH", render: (data) => data || '–' },
    { data: "placing", visible: false },
    { 
      data: null, 
      title: "Medaila", 
      render: (_data, _type, row) => `${MEDAL_ICON[row.placing] ?? ""} ${row.medal_name || "–"}`.trim()
    },
    {
      data: null,
      title: "Akcie",
      orderable: false,
      render: () => `
        <button class="btn btn-sm btn-outline-primary me-1 edit-btn"><i class="bi bi-pencil"></i></button>
        <button class="btn btn-sm btn-outline-danger delete-btn"><i class="bi bi-trash"></i></button>
      `
    }
  ];

  const tableOptions = {
    pageLength: 10,
    lengthMenu: [[10, 25, 50, 100, 10000], [10, 25, 50, 100, "Všetky"]],
    language: dtLanguage,
    createdRow: (row, data) => {
      const editBtn = row.querySelector('.edit-btn');
      if (editBtn) {
        editBtn.addEventListener("click", async () => {
          try {
            const res = await getAthleteREST(data.id);
            setEditAthlete(res);
            setShowForm(false);
          } catch (err) {
            setToast({ message: "Chyba pri načítaní detailu", type: "error" });
          }
        });
      }
      const deleteBtn = row.querySelector('.delete-btn');
      if (deleteBtn) {
        deleteBtn.addEventListener("click", () => {
          setDeleteAthleteId(data);
        });
      }
    },
  };

  // Handle JSON file import
  const handleJsonImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      const res = await batchCreateAthletes(data);
      let msg = `Import dokončený: ${res.inserted} pridaných, ${res.skipped} preskočených.`;
      if (res.errors && res.errors.length > 0) {
        msg += `\n⚠️ Chyby:\n` + res.errors.join('\n');
      }
      setToast({ message: msg, type: res.skipped > 0 ? 'warning' : 'success' });
      loadAthletes();
    } catch (err) {
      setToast({ message: err.error || 'Chyba pri JSON importe', type: 'error' });
    }
  };

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
      loadAthletes();
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
      loadAthletes();
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

        {/* Toast notification */}
        <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />
        
        <div className="card shadow-sm mb-4 card-panel">
          <div className="card-header card-header-main d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
            <h5 className="mb-0">
              <i className="bi bi-people me-2"></i>Správa olympionikov
            </h5>
            <div className="d-flex flex-column flex-sm-row gap-2">
              <label className="btn btn-outline-light btn-sm mb-0 text-center">
                <i className="bi bi-file-earmark-code me-1"></i>Import z JSON
                <input type="file" accept=".json" className="d-none" onChange={handleJsonImport} />
              </label>
              <button className="btn btn-primary btn-sm" onClick={() => { setShowForm(true); setEditAthlete(null); }}>
                <i className="bi bi-plus-lg me-1"></i>Pridať olympionika
              </button>
            </div>
          </div>
          <div className="card-body">
            <div ref={formRef}></div>
            {/* Create Form */}
            {showForm && (
              <div className="mb-4 p-3 border rounded">
                <h6 className="fw-bold mb-3">Nový olympionik</h6>
                <AthleteForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
              </div>
            )}
            
            {/* Edit Form */}
            {editAthlete && (
              <div className="mb-4 p-3 border rounded">
                <h6 className="fw-bold mb-3">Upraviť: {editAthlete.first_name} {editAthlete.last_name}</h6>
                <AthleteForm initialData={editAthlete} onSubmit={handleUpdate} onCancel={() => setEditAthlete(null)} />
              </div>
            )}
            
            {/* Table of athletes */}
            {!loadingAthletes && (
              <div className="row g-2 mb-3">
                <div className="col-auto">
                  <select className="form-select form-select-sm form-input" value={selectedYear} onChange={e => setSelectedYear(e.target.value)}>
                    <option value="">Všetky roky</option>
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <div className="col-auto">
                  <select className="form-select form-select-sm form-input" value={selectedDiscipline} onChange={e => setSelectedDiscipline(e.target.value)}>
                    <option value="">Všetky disciplíny</option>
                    {disciplines.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="col-auto">
                  <select className="form-select form-select-sm form-input" value={selectedType} onChange={e => setSelectedType(e.target.value)}>
                    <option value="">Všetky typy OH</option>
                    <option value="LOH">LOH</option>
                    <option value="ZOH">ZOH</option>
                  </select>
                </div>
                <div className="col-auto">
                  <input type="number" className="form-control form-control-sm form-input" placeholder="Umiestnenie (1, 4...)" value={selectedPlacing} onChange={e => setSelectedPlacing(e.target.value)} />
                </div>
              </div>
            )}
            {loadingAthletes ? (
              <div className="text-center py-3">
                <div className="spinner-border text-primary"></div>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <DataTable
                  ref={tableRef}
                  data={athletes}
                  columns={dtColumns}
                  options={tableOptions}
                  className="table table-hover"
                >
                  <thead className="table-header-custom">
                    <tr>
                      <th>Meno</th>
                      <th>Priezvisko</th>
                      <th>Dát. narodenia</th>
                      <th>Disciplína</th>
                      <th>Rok OH</th>
                      <th>Typ OH</th>
                      <th>Umiestnenie</th>
                      <th>Medaila</th>
                      <th>Akcie</th>
                    </tr>
                  </thead>
                </DataTable>
              </div>
            )}
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {deleteAthleteId && (
          <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content card-panel">
                <div className="modal-header border-bottom-0 pb-0">
                  <h5 className="modal-title text-danger fw-bold">
                    <i className="bi bi-exclamation-triangle me-2"></i>Vymazať olympionika?
                  </h5>
                  <button type="button" className="btn-close btn-close-white" onClick={() => setDeleteAthleteId(null)}></button>
                </div>
                <div className="modal-body py-4">
                  Naozaj chceš trvalo vymazať olympionika <strong>{deleteAthleteId.first_name} {deleteAthleteId.last_name}</strong> a všetky jeho medaily?
                </div>
                <div className="modal-footer border-top-0 pt-0">
                  <button type="button" className="btn btn-secondary" onClick={() => setDeleteAthleteId(null)}>Zrušiť</button>
                  <button type="button" className="btn btn-danger" onClick={handleDeleteConfirmed}>
                    <i className="bi bi-trash me-1"></i>Vymazať
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </>
  );
}