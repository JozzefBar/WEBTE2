import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getAthletes } from "../api/api";
import Navbar from "../components/Navbar";

function nextSort(current) {
  if (current === null) return "ASC";
  if (current === "ASC") return "DESC";
  return null;
}

function SortIcon({ dir }) {
  if (dir === "ASC")
    return <i className={`bi bi-arrow-up sort-icon active ms-1`}></i>;
  if (dir === "DESC")
    return <i className={`bi bi-arrow-down sort-icon active ms-1`}></i>;
  return <i className="bi bi-arrow-down-up sort-icon ms-1"></i>;
}

const MEDAL_CLASS = { 1: "medal-gold", 2: "medal-silver", 3: "medal-bronze" };
const MEDAL_ICON = { 1: "🥇", 2: "🥈", 3: "🥉" };

export default function AthletesPage() {
  const navigate = useNavigate();

  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [page, setPage] = useState(1);
  const [sortCol, setSortCol] = useState(null);
  const [sortDir, setSortDir] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getAthletes({
        page,
        per_page: 10,
        year: yearFilter || undefined,
        sort_by: sortCol || undefined,
        sort_dir: sortDir || undefined,
      });
      setResponse(data);
    } catch {
      setError("Failed to load data. Check the connection to the server.");
    } finally {
      setLoading(false);
    }
  }, [page, yearFilter, sortCol, sortDir]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleFilterChange = (value) => {
    setPage(1)
    setYearFilter(value)
  }

  const handleSort = (col) => {
    if (sortCol === col) {
      const next = nextSort(sortDir);
      if (next === null) { setSortCol(null); setSortDir(null); }
      else setSortDir(next);
    } else {
      setSortCol(col);
      setSortDir('ASC');
    }
    setPage(1);
  };

  const athletes   = response?.data ?? [];
  const pagination = response?.pagination;
  const years      = response?.filters?.years ?? [];

  return (
    <>
      <Navbar />
      <div className="container py-4">
        <h1 className="h3 fw-bold mb-4">
          Slovenskí olympionici
        </h1>

        {/* Filtre */}
        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <div className="row g-3 align-items-end">
              <div className="col-md-4">
                <label className="form-label fw-semibold">
                  <i className="bi bi-calendar3 me-1"></i>Rok OH
                </label>
                <select
                  className="form-select"
                  value={yearFilter}
                  onChange={e => handleFilterChange(e.target.value)}
                >
                  <option value="">Všetky roky</option>
                  {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <div className="col-md-4">
                {yearFilter && (
                  <button
                    className="btn btn-outline-secondary w-100"
                    onClick={() => { setYearFilter(''); setPage(1); }}
                  >
                    <i className="bi bi-x-circle me-1"></i>Zrušiť filter
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="alert alert-danger">
            <i className="bi bi-exclamation-triangle me-2"></i>{error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-danger" role="status"></div>
            <p className="mt-2 text-muted">Načítavam...</p>
          </div>
        ) : (
          <div className="card shadow-sm">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-dark">
                  <tr>
                    <th className="sortable" onClick={() => handleSort('last_name')}>
                      Priezvisko
                      <SortIcon dir={sortCol === 'last_name' ? sortDir : null} />
                    </th>
                    <th>Meno</th>

                    {!yearFilter && (
                      <th className="sortable" onClick={() => handleSort('year')}>
                        Rok
                        <SortIcon dir={sortCol === 'year' ? sortDir : null} />
                      </th>
                    )}

                    <th>Typ OH</th>
                    <th>Krajina</th>
                    <th>Disciplína</th>
                    <th>Medaila</th>
                  </tr>
                </thead>
                <tbody>
                  {athletes.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center text-muted py-5">
                        <i className="bi bi-inbox fs-3 d-block mb-2"></i>
                        Žiadne záznamy
                      </td>
                    </tr>
                  ) : (
                    athletes.map((a, i) => (
                      <tr
                        key={`${a.id}-${i}`}
                        className="clickable-row"
                        onClick={() => navigate(`/athlete/${a.id}`)}
                      >
                        <td className="fw-semibold">{a.last_name}</td>
                        <td>{a.first_name}</td>
                        {!yearFilter && <td>{a.year}</td>}
                        <td>
                          <span className={`badge ${a.games_type === 'LOH' ? 'bg-success' : 'bg-primary'}`}>
                            {a.games_type}
                          </span>
                        </td>
                        <td>{a.games_country}</td>
                        <td>{a.discipline}</td>
                        <td className={MEDAL_CLASS[a.placing]}>
                          {MEDAL_ICON[a.placing]} {a.medal_name}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Strankovanie */}
            {pagination && pagination.total_pages > 1 && (
              <div className="card-footer d-flex justify-content-between align-items-center">
                <small className="text-muted">
                  Strana {pagination.current_page} z {pagination.total_pages}
                  {' '}· {pagination.total_records} záznamov
                </small>
                <nav>
                  <ul className="pagination pagination-sm mb-0">
                    <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                      <button className="page-link" onClick={() => setPage(p => p - 1)}>
                        <i className="bi bi-chevron-left"></i>
                      </button>
                    </li>
                    {[...Array(pagination.total_pages)].map((_, idx) => (
                      <li key={idx} className={`page-item ${page === idx + 1 ? 'active' : ''}`}>
                        <button className="page-link" onClick={() => setPage(idx + 1)}>
                          {idx + 1}
                        </button>
                      </li>
                    ))}
                    <li className={`page-item ${page >= pagination.total_pages ? 'disabled' : ''}`}>
                      <button className="page-link" onClick={() => setPage(p => p + 1)}>
                        <i className="bi bi-chevron-right"></i>
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
