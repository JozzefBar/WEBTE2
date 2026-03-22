import Navbar from '../components/Navbar';

export default function ApiDocsPage() {
  const endpoints = [
    { method: 'GET',    path: '/api/athletes',         desc: 'Get list of athletes with medals. Filters: ?type=LOH&year=2024&placing=1&discipline=...' },
    { method: 'GET',    path: '/api/athletes/{id}',    desc: 'Get details of a single athlete by ID, including all medals.' },
    { method: 'POST',   path: '/api/athletes',         desc: 'Create a new athlete. Body: JSON with first_name, last_name, and optional medal data.' },
    { method: 'POST',   path: '/api/athletes/batch',   desc: 'Batch create athletes from JSON array. Body: [{ athlete1 }, { athlete2 }, ...]' },
    { method: 'PUT',    path: '/api/athletes/{id}',    desc: 'Update personal data of an existing athlete. Body: JSON with fields to update.' },
    { method: 'DELETE', path: '/api/athletes/{id}',    desc: 'Delete an athlete and all related medal records.' },
  ];

  // Color coding for HTTP methods
  const methodColor = { GET: 'success', POST: 'primary', PUT: 'warning', DELETE: 'danger' };

  return (
    <>
      <Navbar />
      <div className="container py-4">
        <h1 className="h3 fw-bold mb-4">
          <i className="bi bi-book me-2"></i>API Dokumentácia
        </h1>
        <p className="text-muted mb-4">
          Táto stránka popisuje dostupné REST API endpointy pre správu slovenských olympionikov.
          Všetky endpointy vracajú odpoveď vo formáte JSON.
        </p>

        <div className="card shadow-sm card-panel">
          <div className="card-body" style={{ overflowX: 'auto' }}>
            <table className="table table-hover mb-0">
              <thead className="table-header-custom">
                <tr>
                  <th>Metóda</th>
                  <th>Endpoint</th>
                  <th>Popis</th>
                </tr>
              </thead>
              <tbody>
                {endpoints.map((ep, i) => (
                  <tr key={i}>
                    <td><span className={`badge bg-${methodColor[ep.method]}`}>{ep.method}</span></td>
                    <td><code>{ep.path}</code></td>
                    <td>{ep.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card shadow-sm mt-4 card-panel">
          <div className="card-header"><h5 className="mb-0">HTTP Status kódy</h5></div>
          <div className="card-body">
            <table className="table table-sm mb-0">
              <thead><tr><th>Kód</th><th>Význam</th></tr></thead>
              <tbody>
                <tr><td><code>200</code></td><td>OK – úspešná požiadavka</td></tr>
                <tr><td><code>201</code></td><td>Created – záznam bol vytvorený</td></tr>
                <tr><td><code>400</code></td><td>Bad Request – chýbajú alebo sú neplatné vstupné dáta</td></tr>
                <tr><td><code>401</code></td><td>Unauthorized – používateľ nie je prihlásený</td></tr>
                <tr><td><code>404</code></td><td>Not Found – záznam nebol nájdený</td></tr>
                <tr><td><code>500</code></td><td>Server Error – interná chyba servera</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
