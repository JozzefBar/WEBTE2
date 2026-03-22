import { useState, useEffect } from 'react';

// initialData = null for creating, or an object with existing data for editing
export default function AthleteForm({ initialData, onSubmit, onCancel }) {
  // Form state – personal info and dynamic medals array
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    birth_date: '',
    birth_place: '',
    birth_country: '',
    death_date: '',
    death_place: '',
    death_country: '',
    medals: [{
      medal_record_id: null,
      year: '',
      games_type: '',
      games_city: '',
      games_country: '',
      discipline: '',
      placing: '',
    }]
  });

  const [errors, setErrors] = useState({});

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
        medals: initialData.medals && initialData.medals.length > 0
          ? initialData.medals.map(m => ({
              medal_record_id: m.medal_record_id || null,
              year: m.year || '',
              games_type: m.games_type || '',
              games_city: m.games_city || '',
              games_country: m.games_country || '',
              discipline: m.discipline || '',
              placing: m.placing || '',
            }))
          : [{ medal_record_id: null, year: '', games_type: '', games_city: '', games_country: '', discipline: '', placing: '' }],
      });
    }
  }, [initialData]);

  const handleChange = (field) => (e) => {
    setForm(f => ({ ...f, [field]: e.target.value }));
    setErrors(errs => ({ ...errs, [field]: '' }));
  };

  const handleMedalChange = (index, field) => (e) => {
    const updatedMedals = [...form.medals];
    updatedMedals[index][field] = e.target.value;
    setForm(f => ({ ...f, medals: updatedMedals }));
    
    // Clear specific medal error when typing
    setErrors(errs => {
      const newErrs = { ...errs };
      if (newErrs[`medal_${index}_${field}`]) {
        delete newErrs[`medal_${index}_${field}`];
      }
      return newErrs;
    });
  };

  const addMedal = () => {
    setForm(f => ({
      ...f,
      medals: [...f.medals, { medal_record_id: null, year: '', games_type: '', games_city: '', games_country: '', discipline: '', placing: '' }]
    }));
  };

  const removeMedal = (index) => {
    const updatedMedals = form.medals.filter((_, i) => i !== index);
    setForm(f => ({ ...f, medals: updatedMedals }));
  };

  const validate = () => {
    const errs = {};
    if (!form.first_name.trim()) errs.first_name = 'Vyžaduje sa meno';
    if (!form.last_name.trim()) errs.last_name = 'Vyžaduje sa priezvisko';

    const medalFields = ['year', 'games_type', 'games_city', 'games_country', 'discipline', 'placing'];
    
    form.medals.forEach((medal, index) => {
      const anyMedalFieldFilled = medalFields.some(field => String(medal[field]).trim() !== '');
      if (anyMedalFieldFilled) {
        medalFields.forEach(field => {
          if (!String(medal[field]).trim()) {
            errs[`medal_${index}_${field}`] = 'Vyžaduje sa pre tento záznam';
          }
        });
      }
    });

    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    onSubmit(form);
  };

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

      <hr />
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6 className="text-uppercase text-muted small fw-bold mb-0">Ocenenia / Medaily</h6>
        <button type="button" className="btn btn-sm btn-outline-primary" onClick={addMedal}>
          <i className="bi bi-plus-circle me-1"></i> Pridať ďalšiu medailu
        </button>
      </div>

      {form.medals.map((medal, index) => (
        <div key={index} className="card p-3 mb-3 bg-light shadow-sm">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <strong>Záznam medaily #{index + 1}</strong>
            {form.medals.length > 1 && (
              <button type="button" className="btn btn-sm btn-danger px-2 py-1" onClick={() => removeMedal(index)}>
                <i className="bi bi-trash3"></i> Odstrániť
              </button>
            )}
          </div>
          <div className="row">
            <div className="col-md-3">
              <div className="mb-3">
                <label className="form-label fw-semibold">Rok OH</label>
                <input type="number" className={`form-control form-input ${errors[`medal_${index}_year`] ? 'is-invalid' : ''}`} value={medal.year} onChange={handleMedalChange(index, 'year')} placeholder="2024" />
                {errors[`medal_${index}_year`] && <div className="invalid-feedback">{errors[`medal_${index}_year`]}</div>}
              </div>
            </div>
            <div className="col-md-3">
              <div className="mb-3">
                <label className="form-label fw-semibold">Typ OH</label>
                <select className={`form-select form-input ${errors[`medal_${index}_games_type`] ? 'is-invalid' : ''}`} value={medal.games_type} onChange={handleMedalChange(index, 'games_type')}>
                  <option value="">-- Vyber --</option>
                  <option value="LOH">LOH</option>
                  <option value="ZOH">ZOH</option>
                </select>
                {errors[`medal_${index}_games_type`] && <div className="invalid-feedback">{errors[`medal_${index}_games_type`]}</div>}
              </div>
            </div>
            <div className="col-md-3">
              <div className="mb-3">
                <label className="form-label fw-semibold">Mesto OH</label>
                <input type="text" className={`form-control form-input ${errors[`medal_${index}_games_city`] ? 'is-invalid' : ''}`} value={medal.games_city} onChange={handleMedalChange(index, 'games_city')} />
                {errors[`medal_${index}_games_city`] && <div className="invalid-feedback">{errors[`medal_${index}_games_city`]}</div>}
              </div>
            </div>
            <div className="col-md-3">
              <div className="mb-3">
                <label className="form-label fw-semibold">Krajina OH</label>
                <input type="text" className={`form-control form-input ${errors[`medal_${index}_games_country`] ? 'is-invalid' : ''}`} value={medal.games_country} onChange={handleMedalChange(index, 'games_country')} />
                {errors[`medal_${index}_games_country`] && <div className="invalid-feedback">{errors[`medal_${index}_games_country`]}</div>}
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label fw-semibold">Disciplína</label>
                <input type="text" className={`form-control form-input ${errors[`medal_${index}_discipline`] ? 'is-invalid' : ''}`} value={medal.discipline} onChange={handleMedalChange(index, 'discipline')} />
                {errors[`medal_${index}_discipline`] && <div className="invalid-feedback">{errors[`medal_${index}_discipline`]}</div>}
              </div>
            </div>
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label fw-semibold">Umiestnenie</label>
                <input type="number" min="1" className={`form-control form-input ${errors[`medal_${index}_placing`] ? 'is-invalid' : ''}`} value={medal.placing} onChange={handleMedalChange(index, 'placing')} placeholder="Napr. 1, 4, 8..." />
                {errors[`medal_${index}_placing`] && <div className="invalid-feedback">{errors[`medal_${index}_placing`]}</div>}
              </div>
            </div>
          </div>
        </div>
      ))}

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
