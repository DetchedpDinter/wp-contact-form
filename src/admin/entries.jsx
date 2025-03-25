const { createRoot, useState, useEffect } = window.wp.element;
const apiFetch = window.wp.apiFetch;
import "../index.css";

export default function EntriesPage() {
  const [forms, setForms] = useState([]);
  const [selectedFormId, setSelectedFormId] = useState("");
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    apiFetch({ path: "/wp/v2/cfp_form?per_page=100" }).then(setForms);
  }, []);

  useEffect(() => {
    if (!selectedFormId) return;

    setLoading(true);
    apiFetch({ path: `/cfp/v1/entries/?form_id=${selectedFormId}` })
      .then(setEntries)
      .finally(() => setLoading(false));
  }, [selectedFormId]);

  return (
    <div className="cfp-admin-entries px-6 py-4">
      <h1 className="text-2xl font-semibold mb-6">Form Entries</h1>

      <div className="mb-6">
        <label htmlFor="formSelect" className="font-medium mr-2">
          Select Form:
        </label>
        <select
          id="formSelect"
          className="border border-gray-300 rounded px-3 py-2 min-w-[220px] text-sm"
          onChange={(e) => setSelectedFormId(e.target.value)}
          value={selectedFormId}
        >
          <option value="">-- Select --</option>
          {forms.map((form) => (
            <option key={form.id} value={form.id}>
              {form.title.rendered}
            </option>
          ))}
        </select>
      </div>

      {loading && <p className="text-gray-600">Loading entries...</p>}

      {!loading && entries.length > 0 && (
        <div className="overflow-auto">
          <table className="min-w-full text-sm text-left border border-gray-200 rounded-lg shadow-sm">
            <thead className="bg-gray-100 text-gray-700 font-medium">
              <tr>
                <th className="px-4 py-2 border-b">Date</th>
                {Object.keys(entries[0].data || {}).map((key) => (
                  <th key={key} className="px-4 py-2 border-b capitalize">
                    {key.replace(/_/g, " ")}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white">
              {entries.map((entry) => (
                <tr key={entry.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2 border-b">
                    {new Date(entry.date).toLocaleString()}
                  </td>
                  {Object.entries(entry.data || {}).map(([key, val]) => (
                    <td key={key} className="px-4 py-2 border-b">
                      {typeof val === "object"
                        ? JSON.stringify(val)
                        : String(val)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && selectedFormId && entries.length === 0 && (
        <p className="text-gray-500">No entries found for this form.</p>
      )}
    </div>
  );
}

document.addEventListener("DOMContentLoaded", () => {
  const rootEl = document.getElementById("cfp-entries-root");
  if (rootEl) {
    createRoot(rootEl).render(<EntriesPage />);
  }
});
