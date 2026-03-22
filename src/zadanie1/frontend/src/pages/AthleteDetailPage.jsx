import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
//Now used with REST API for 2. assignment
//import { getAthlete } from '../api/api';
import { getAthleteREST } from '../api/api';
import Navbar from '../components/Navbar';
import DataTable from "datatables.net-react";
import DT from "datatables.net-bs5";
import "datatables.net-bs5/css/dataTables.bootstrap5.min.css";

DataTable.use(DT);

const MEDAL_ICON = { 1: '🥇', 2: '🥈', 3: '🥉' };

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return `${d}.${m}.${y}`;
};

const medalColumns = [
  { data: "year",          title: "Rok",        orderable: true,  orderSequence: ["desc", "asc", ""] },
  {
    data: "games_type",
    title: "OH",
    orderable: false,
    render: (data) =>
      `<span class="badge ${data === "LOH" ? "bg-success" : "bg-primary"}">${data}</span>`,
  },
  { data: "games_city",    title: "Mesto",      orderable: false },
  { data: "games_country", title: "Krajina",    orderable: false },
  { data: "discipline",    title: "Disciplína", orderable: true, orderSequence: ["asc", "desc", ""] },
  {
    data: null,
    title: "Medaila",
    orderable: false,
    render: (_data, _type, row) =>
      `${MEDAL_ICON[row.placing] ?? ""} ${row.medal_name}`,
  },
];

const dtOptions = {
  paging: false,
  searching: false,
  info: false,
  language: {
    emptyTable:  "Žiadne medaily",
    zeroRecords: "Žiadne medaily",
  },
};

export default function AthleteDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [athlete, setAthlete] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    if (!id) return;
    //Now used with REST API for 2. assignment
    //getAthlete(Number(id))
    getAthleteREST(Number(id))
      .then(setAthlete)
      .catch(() => setError('Olympionik nebol nájdený.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <>
      <Navbar />
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary"></div>
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

        <div className="card shadow-sm mb-4 card-panel">
          <div className="card-header card-header-main py-3">
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
                    <span className="fw-semibold">{formatDate(athlete.birth_date)}</span>
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
                    <span className="fw-semibold">{formatDate(athlete.death_date)}</span>
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

        <div className="card shadow-sm card-panel">
          <div className="card-header">
            <h5 className="mb-0">
              <i className="bi bi-award me-2 text-warning"></i>
              Medaily ({athlete.medals?.length ?? 0})
            </h5>
          </div>
          <div className="card-body" style={{ overflowX: "auto" }}>
            <DataTable
              data={athlete.medals ?? []}
              columns={medalColumns}
              options={dtOptions}
              className="table table-hover"
            >
              <thead className="table-header-custom">
                <tr>
                  <th>Rok</th>
                  <th data-dt-order="disable">OH</th>
                  <th data-dt-order="disable">Mesto</th>
                  <th data-dt-order="disable">Krajina</th>
                  <th>Disciplína</th>
                  <th data-dt-order="disable">Medaila</th>
                </tr>
              </thead>
            </DataTable>
          </div>
        </div>
      </div>
    </>
  );
}
