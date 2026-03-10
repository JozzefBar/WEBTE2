import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getAthletes } from "../api/api";
import Navbar from "../components/Navbar";
import DataTable from "datatables.net-react";
import DT from "datatables.net-bs5";
import "datatables.net-bs5/css/dataTables.bootstrap5.min.css";

DataTable.use(DT);

const MEDAL_ICON = { 1: "🥇", 2: "🥈", 3: "🥉" };

// Column indices (must match columns array order below)
const YEAR_COL_IDX       = 2;
const DISCIPLINE_COL_IDX = 5;

const columns = [
  { data: "last_name",  title: "Priezvisko", orderable: true, orderSequence: ["asc", "desc", ""] },
  { data: "first_name", title: "Meno", orderable: false},
  { data: "year",       title: "Rok", orderable: true, orderSequence: ["asc", "desc", ""] },
  {
    data: "games_type",
    title: "Typ OH",
    orderable: false,
    render: (data) =>
      `<span class="badge ${data === "LOH" ? "bg-success" : "bg-primary"}">${data}</span>`,
  },
  { data: "games_country", title: "Krajina", orderable: false },
  { data: "discipline",    title: "Disciplína", orderable: true, orderSequence: ["asc", "desc", ""] },
  {
    data: null,
    title: "Medaila",
    orderable: false,
    render: (_data, _type, row) =>
      `${MEDAL_ICON[row.placing] ?? ""} ${row.medal_name}`,
  },
];

const dtLanguage = {
  search:     "Hľadať:",
  lengthMenu: "Zobraziť _MENU_ záznamov",
  info:       "Záznamy _START_ – _END_ z _TOTAL_",
  infoEmpty:  "Žiadne záznamy",
  emptyTable: "Žiadne záznamy",
  zeroRecords:"Žiadne záznamy",
  paginate: { first: "«", last: "»", next: "›", previous: "‹" },
};

export default function AthletesPage() {
  const navigate  = useNavigate();
  const tableRef  = useRef(null);

  const [athletes,    setAthletes]    = useState([]);
  const [years,       setYears]       = useState([]);
  const [disciplines, setDisciplines] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState("");

  const [selectedYear,       setSelectedYear]       = useState("");
  const [selectedDiscipline, setSelectedDiscipline] = useState("");

  useEffect(() => {
    getAthletes({ per_page: "all" })
      .then(data => {
        setAthletes(data.data ?? []);
        setYears(data.filters?.year ?? []);
        setDisciplines(data.filters?.disciplines ?? []);
      })
      .catch(() => setError("Nepodarilo sa načítať dáta. Skontroluj spojenie so serverom."))
      .finally(() => setLoading(false));
  }, []);

  // Year filter + column visibility
  useEffect(() => {
    if (!tableRef.current) return;
    const dt = tableRef.current.dt();
    dt.column(YEAR_COL_IDX).search(selectedYear).draw();
    dt.column(YEAR_COL_IDX).visible(!selectedYear);
  }, [selectedYear]);

  // Discipline filter + column visibility
  useEffect(() => {
    if (!tableRef.current) return;
    const dt = tableRef.current.dt();
    dt.column(DISCIPLINE_COL_IDX).search(selectedDiscipline, true, false).draw();
    dt.column(DISCIPLINE_COL_IDX).visible(!selectedDiscipline);
  }, [selectedDiscipline]);

  const tableOptions = {
    pageLength: 10,
    lengthMenu: [[10, 25, 50, 100, 10000], [10, 25, 50, 100, "Všetky"]],
    language: dtLanguage,
    createdRow: (row, data) => {
      row.style.cursor = "pointer";
      row.addEventListener("click", () => navigate(`/athlete/${data.id}`));
    },
  };

  return (
    <>
      <Navbar />
      <div className="container py-4">
        <h1 className="h3 fw-bold mb-4">Slovenskí olympionici</h1>

        {error && (
          <div className="alert alert-danger">
            <i className="bi bi-exclamation-triangle me-2"></i>{error}
          </div>
        )}

        {/* Dropdown filters */}
        {!loading && (
          <div className="row g-2 mb-3">
            <div className="col-auto">
              <select
                className="form-select form-select-sm form-input"
                value={selectedYear}
                onChange={e => setSelectedYear(e.target.value)}
              >
                <option value="">Všetky roky</option>
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div className="col-auto">
              <select
                className="form-select form-select-sm form-input"
                value={selectedDiscipline}
                onChange={e => setSelectedDiscipline(e.target.value)}
              >
                <option value="">Všetky disciplíny</option>
                {disciplines.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
            <p className="mt-2 text-muted">Načítavam...</p>
          </div>
        ) : (
          <div className="card shadow-sm card-panel">
            <div className="card-body" style={{ overflowX: "auto" }}>
              <DataTable
                ref={tableRef}
                data={athletes}
                columns={columns}
                options={tableOptions}
                className="table table-hover"
              >
                <thead className="table-header-custom">
                  <tr>
                    <th>Priezvisko</th>
                    <th>Meno</th>
                    <th>Rok</th>
                    <th>Typ OH</th>
                    <th>Krajina</th>
                    <th>Disciplína</th>
                    <th>Medaila</th>
                  </tr>
                </thead>
              </DataTable>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
