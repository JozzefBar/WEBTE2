import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAthletes } from "../api/api";
import Navbar from "../components/Navbar";
import DataTable from "datatables.net-react";
import DT from "datatables.net-bs5";
import "datatables.net-bs5/css/dataTables.bootstrap5.min.css";

DataTable.use(DT);

const MEDAL_ICON = { 1: "🥇", 2: "🥈", 3: "🥉" };

const columns = [
  { data: "last_name",     title: "Priezvisko", width: "130px" },
  { data: "first_name",    title: "Meno",       width: "110px" },
  { data: "year",          title: "Rok",        width: "70px" },
  {
    data: "games_type",
    title: "Typ OH",
    width: "90px",
    render: (data) =>
      `<span class="badge ${data === "LOH" ? "bg-success" : "bg-primary"}">${data}</span>`,
  },
  { data: "games_country", title: "Krajina",    width: "160px" },
  { data: "discipline",    title: "Disciplína", width: "220px" },
  {
    data: null,
    title: "Medaila",
    width: "130px",
    render: (_data, _type, row) =>
      `${MEDAL_ICON[row.placing] ?? ""} ${row.medal_name}`,
  },
];

const options = {
  pageLength: 10,
  scrollX: true,
  autoWidth: false,
  language: {
    search:     "Hľadať:",
    lengthMenu: "Zobraziť _MENU_ záznamov",
    info:       "Záznamy _START_ - _END_ z _TOTAL_",
    infoEmpty:  "Žiadne záznamy",
    emptyTable: "Žiadne záznamy",
    zeroRecords:"Žiadne záznamy",
    paginate: { first: "«", last: "»", next: "›", previous: "‹" },
  },
};

export default function AthletesPage() {
  const navigate = useNavigate();
  const [athletes, setAthletes] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");

  useEffect(() => {
    getAthletes({ per_page: "all" })
      .then(data => setAthletes(data.data ?? []))
      .catch(() => setError("Nepodarilo sa načítať dáta. Skontroluj spojenie so serverom."))
      .finally(() => setLoading(false));
  }, []);

  const tableOptions = {
    ...options,
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

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-danger" role="status"></div>
            <p className="mt-2 text-muted">Načítavam...</p>
          </div>
        ) : (
          <div className="card shadow-sm">
            <div className="card-body">
              <DataTable
                data={athletes}
                columns={columns}
                options={tableOptions}
                className="table table-hover"
              >
                <thead className="table-dark">
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
