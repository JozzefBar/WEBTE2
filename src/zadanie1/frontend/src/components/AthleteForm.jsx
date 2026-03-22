import { useState, useEffect } from 'react';

// initialData = null for creating, or an object with existing data for editing
export default function AthleteForm({ initialData, onSubmit, onCancel }) {
  // Form state – all the fields a user can fill in
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    birth_date: '',
    birth_place: '',
    birth_country: '',
    death_date: '',
    death_place: '',
    death_country: '',
    // Medal data (for creating new athlete with medal)
    year: '',
    games_type: '',
    games_city: '',
    games_country: '',
    discipline: '',
    placing: '',
  });

  const [errors, setErrors] = useState({});

  // If editing (initialData is provided), prefill the form fields
  // This runs when the component mounts or when initialData changes
  useEffect(() => {
    if (initialData) {
      setForm({
        first_name: initialData.first_name || '',
        last_name: initialData.last_name || '',
        birth_date: initialData.birth_date || '',
        birth_place: initialData.birth_place || '',
        birth_country: initialData.birth_country || '',
        death_date: initialData.death_date || '',
        death_place: initialData.death_place || '',
        death_country: initialData.death_country || '',
        year: '',
        games_type: '',
        games_city: '',
        games_country: '',
        discipline: '',
        placing: '',
      });
    }
  }, [initialData]);

  // Generic handler: updates one field in the form state
  const handleChange = (field) => (e) => {
    setForm(f => ({ ...f, [field]: e.target.value }));
    setErrors(errs => ({ ...errs, [field]: '' }));
  };

  // Frontend validation
  const validate = () => {
    const errs = {};
    if (!form.first_name.trim()) errs.first_name = 'Vyžaduje sa meno';
    if (!form.last_name.trim()) errs.last_name = 'Vyžaduje sa priezvisko';
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    // Pass the form data up to the parent component
    onSubmit(form);
  };

  // Helper to render a form input with label and error
  const renderField = (label, field, type = 'text', placeholder = '') => (
    <div className="mb-3">
      <label className="form-label fw-semibold">{label}</label>
      <input
        type={type}
        className={`form-control form-input ${errors[field] ? 'is-invalid' : ''}`}
        value={form[field]}
        onChange={handleChange(field)}
        placeholder={placeholder}
      />
      {errors[field] && <div className="invalid-feedback">{errors[field]}</div>}
    </div>
  );

  return (
    <form onSubmit={handleSubmit}>
      <h6 className="text-uppercase text-muted small fw-bold mb-3">Osobné údaje</h6>
      <div className="row">
        <div className="col-md-6">{renderField('Meno *', 'first_name', 'text', 'Ján')}</div>
        <div className="col-md-6">{renderField('Priezvisko *', 'last_name', 'text', 'Novák')}</div>
      </div>
      <div className="row">
        <div className="col-md-4">{renderField('Dát. narodenia', 'birth_date', 'date')}</div>
        <div className="col-md-4">{renderField('Miesto narodenia', 'birth_place')}</div>
        <div className="col-md-4">{renderField('Krajina narodenia', 'birth_country')}</div>
      </div>
      <div className="row">
        <div className="col-md-4">{renderField('Dát. úmrtia', 'death_date', 'date')}</div>
        <div className="col-md-4">{renderField('Miesto úmrtia', 'death_place')}</div>
        <div className="col-md-4">{renderField('Krajina úmrtia', 'death_country')}</div>
      </div>

      {/* Only show medal fields when CREATING (not editing personal data) */}
      {!initialData && (
        <>
          <hr />
          <h6 className="text-uppercase text-muted small fw-bold mb-3">Údaje o medaile</h6>
          <div className="row">
            <div className="col-md-3">{renderField('Rok OH', 'year', 'number', '2024')}</div>
            <div className="col-md-3">
              <div className="mb-3">
                <label className="form-label fw-semibold">Typ OH</label>
                <select className="form-select form-input" value={form.games_type} onChange={handleChange('games_type')}>
                  <option value="">-- Vyber --</option>
                  <option value="LOH">LOH</option>
                  <option value="ZOH">ZOH</option>
                </select>
              </div>
            </div>
            <div className="col-md-3">{renderField('Mesto OH', 'games_city')}</div>
            <div className="col-md-3">{renderField('Krajina OH', 'games_country')}</div>
          </div>
          <div className="row">
            <div className="col-md-6">{renderField('Disciplína', 'discipline')}</div>
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label fw-semibold">Umiestnenie</label>
                <select className="form-select form-input" value={form.placing} onChange={handleChange('placing')}>
                  <option value="">-- Vyber --</option>
                  <option value="1">🥇 1. miesto (Zlatá)</option>
                  <option value="2">🥈 2. miesto (Strieborná)</option>
                  <option value="3">🥉 3. miesto (Bronzová)</option>
                </select>
              </div>
            </div>
          </div>
        </>
      )}

      <div className="d-flex gap-2 mt-3">
        <button type="submit" className="btn btn-primary btn-action">
          <i className="bi bi-check-lg me-1"></i>
          {initialData ? 'Uložiť zmeny' : 'Pridať olympionika'}
        </button>
        {onCancel && (
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Zrušiť
          </button>
        )}
      </div>
    </form>
  );
}
