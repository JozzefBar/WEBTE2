// frontend/src/pages/AthleteDetailPage.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAthlete } from '../api/api';
import Navbar from '../components/Navbar';

const MEDAL_CLASS = { 1: 'medal-gold', 2: 'medal-silver', 3: 'medal-bronze' };
const MEDAL_ICON  = { 1: '🥇', 2: '🥈', 3: '🥉' };

export default function AthleteDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [athlete, setAthlete] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    if (!id) return;
    getAthlete(Number(id))
      .then(setAthlete)
      .catch(() => setError('Olympionik nebol nájdený.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <>
      <Navbar />
      <div className="container py-5 text-center">
        <div className="spinner-border text-danger"></div>
      </div>
    </>
  );

  if (error || !athlete) return (
    <>
      <Navbar />
      <div className="container py-4">
        <div className="alert alert-danger">{error}</div>
      </div>
    </>
  );

  return (
    <>
      <Navbar />
      <div className="container py-4">
        <button className="btn btn-outline-secondary btn-sm mb-3" onClick={() => navigate(-1)}>
          <i className="bi bi-arrow-left me-1"></i>Späť na zoznam
        </button>

        <div className="card shadow-sm mb-4">
          <div className="card-header bg-dark text-white py-3">
            <h1 className="h4 mb-0 fw-bold">
              <i className="bi bi-person-badge me-2"></i>
              {athlete.first_name} {athlete.last_name}
            </h1>
          </div>
          <div className="card-body">
            <h6 className="text-uppercase text-muted small fw-bold mb-3">Osobné údaje</h6>
            <div className="row g-3">
              {athlete.birth_date && (
                <div className="col-sm-6 col-md-3">
                  <div className="border rounded p-2">
                    <small className="text-muted d-block">Dátum narodenia</small>
                    <span className="fw-semibold">{athlete.birth_date}</span>
                  </div>
                </div>
              )}
              {athlete.birth_place && (
                <div className="col-sm-6 col-md-3">
                  <div className="border rounded p-2">
                    <small className="text-muted d-block">Miesto narodenia</small>
                    <span className="fw-semibold">
                      {athlete.birth_place}{athlete.birth_country ? `, ${athlete.birth_country}` : ''}
                    </span>
                  </div>
                </div>
              )}
              {athlete.death_date && (
                <div className="col-sm-6 col-md-3">
                  <div className="border rounded p-2">
                    <small className="text-muted d-block">Dátum úmrtia</small>
                    <span className="fw-semibold">{athlete.death_date}</span>
                  </div>
                </div>
              )}
              {athlete.death_place && (
                <div className="col-sm-6 col-md-3">
                  <div className="border rounded p-2">
                    <small className="text-muted d-block">Miesto úmrtia</small>
                    <span className="fw-semibold">
                      {athlete.death_place}{athlete.death_country ? `, ${athlete.death_country}` : ''}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="card shadow-sm">
          <div className="card-header">
            <h5 className="mb-0">
              <i className="bi bi-award me-2 text-warning"></i>
              Medaily ({athlete.medals?.length ?? 0})
            </h5>
          </div>
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>Rok</th><th>OH</th><th>Mesto</th><th>Krajina</th>
                  <th>Kategória</th><th>Disciplína</th><th>Medaila</th>
                </tr>
              </thead>
              <tbody>
                {!athlete.medals?.length ? (
                  <tr><td colSpan={7} className="text-center text-muted py-4">Žiadne medaily</td></tr>
                ) : (
                  athlete.medals.map((m, i) => (
                    <tr key={i}>
                      <td>{m.year}</td>
                      <td>
                        <span className={`badge ${m.games_type === 'LOH' ? 'bg-primary' : 'bg-success'}`}>
                          {m.games_type}
                        </span>
                      </td>
                      <td>{m.games_city}</td>
                      <td>{m.games_country}</td>
                      <td>{m.category}</td>
                      <td>{m.discipline}</td>
                      <td className={MEDAL_CLASS[m.placing]}>
                        {MEDAL_ICON[m.placing]} {m.medal_name}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}