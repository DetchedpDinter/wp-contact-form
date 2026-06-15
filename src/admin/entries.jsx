const { createRoot, useState, useEffect } = window.wp.element;
const apiFetch = window.wp.apiFetch;
import "../index.css";

export default function EntriesPage() {
  const [forms, setForms] = useState([]);
  const [selectedFormId, setSelectedFormId] = useState("");
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [noteInputs, setNoteInputs] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

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

  const addNote = async (entryId) => {
    const note = noteInputs[entryId];

    if (!note) return;

    try {
      await apiFetch({
        path: `/cfp/v1/entries/${entryId}/notes`,
        method: "POST",
        data: {
          note,
        },
      });

      const refreshed = await apiFetch({
        path: `/cfp/v1/entries/?form_id=${selectedFormId}`,
      });

      setEntries(refreshed);

      setNoteInputs((prev) => ({
        ...prev,
        [entryId]: "",
      }));
    } catch (err) {
      console.error(err);
    }
  };

  const updateStatus = async (entryId, status) => {
    try {
      await apiFetch({
        path: `/cfp/v1/entries/${entryId}/status`,
        method: "POST",
        data: {
          status,
        },
      });

      const refreshed = await apiFetch({
        path: `/cfp/v1/entries/?form_id=${selectedFormId}`,
      });

      setEntries(refreshed);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredEntries = entries.filter((entry) => {
    const searchableText = Object.values(entry.data || {})
      .map((field) => field?.value || "")
      .join(" ")
      .toLowerCase();

    const matchesSearch = searchableText.includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ? true : (entry.status || "new") === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const exportCSV = () => {
    if (filteredEntries.length === 0) return;

    const headers = [
      "Date",
      ...Object.values(filteredEntries[0].data || {}).map(
        (field) => field.label || "Field",
      ),
      "Status",
    ];

    const rows = filteredEntries.map((entry) => {
      const fieldValues = Object.values(entry.data || {}).map(
        (field) => `"${field?.value || ""}"`,
      );

      return [
        `"${new Date(entry.date).toLocaleString()}"`,
        ...fieldValues,
        `"${entry.status || "new"}"`,
      ].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;

    link.setAttribute("download", `leads-${selectedFormId}-${Date.now()}.csv`);

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);
  };

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

      <div className="flex gap-4 items-center mb-6 flex-wrap">
        <input
          type="text"
          placeholder="Search leads..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 text-sm min-w-[250px]"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 text-sm"
        >
          <option value="all">All Statuses</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="qualified">Qualified</option>
          <option value="proposal_sent">Proposal Sent</option>
          <option value="won">Won</option>
          <option value="lost">Lost</option>
        </select>

        <p className="text-sm text-gray-600">
          {filteredEntries.length} Lead(s) Found
        </p>
        
        <button
          onClick={exportCSV}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm font-medium"
        >
          Export CSV
        </button>
      </div>

      {loading && <p className="text-gray-600">Loading entries...</p>}

      {!loading && filteredEntries.length > 0 && (
        <div className="overflow-auto">
          <table className="min-w-full text-sm text-left border border-gray-200 rounded-lg shadow-sm">
            <thead className="bg-gray-100 text-gray-700 font-medium">
              <tr>
                <th className="px-4 py-2 border-b">Date</th>
                {Object.values(entries[0].data || {}).map((field, index) => (
                  <th
                    key={index}
                    className="px-4 py-2 border-b capitalize whitespace-nowrap"
                  >
                    {field.label || "Field"}
                  </th>
                ))}
                <th className="px-4 py-2 border-b">Status</th>
                <th className="px-4 py-2 border-b">Timeline</th>
                <th className="px-4 py-2 border-b">Notes</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {filteredEntries.map((entry) => (
                <tr key={entry.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2 border-b">
                    {new Date(entry.date).toLocaleString()}
                  </td>
                  {Object.entries(entry.data || {}).map(([key, field]) => (
                    <td
                      key={key}
                      className="px-4 py-2 border-b whitespace-nowrap"
                    >
                      {field?.value || "-"}
                    </td>
                  ))}
                  <td className="px-4 py-2 border-b min-w-[220px]">
                    <select
                      value={entry.status || "new"}
                      onChange={(e) => updateStatus(entry.id, e.target.value)}
                      className={`px-3 py-2 rounded-md text-sm font-medium border w-full ${
                        entry.status === "won"
                          ? "bg-green-100 text-green-800 border-green-300"
                          : entry.status === "lost"
                          ? "bg-red-100 text-red-800 border-red-300"
                          : entry.status === "qualified"
                          ? "bg-blue-100 text-blue-800 border-blue-300"
                          : entry.status === "proposal_sent"
                          ? "bg-purple-100 text-purple-800 border-purple-300"
                          : entry.status === "contacted"
                          ? "bg-orange-100 text-orange-800 border-orange-300"
                          : "bg-yellow-100 text-yellow-800 border-yellow-300"
                      }`}
                    >
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="qualified">Qualified</option>
                      <option value="proposal_sent">Proposal Sent</option>
                      <option value="won">Won</option>
                      <option value="lost">Lost</option>
                    </select>
                  </td>
                  <td className="px-4 py-2 border-b">
                    {Array.isArray(entry.timeline) &&
                      entry.timeline.map((event, index) => (
                        <div
                          key={index}
                          className="border-l-2 border-blue-500 pl-4 py-2 mb-2"
                        >
                          <p className="font-medium">{event.message}</p>

                          <p className="text-xs text-gray-500">{event.time}</p>
                        </div>
                      ))}
                  </td>
                  <td className="px-4 py-2 border-b min-w-[300px]">
                    <div className="space-y-2">
                      {Array.isArray(entry.notes) &&
                        entry.notes.map((note, index) => (
                          <div
                            key={index}
                            className="bg-gray-100 rounded p-2 text-sm"
                          >
                            <p>{note.message}</p>

                            <p className="text-xs text-gray-500 mt-1">
                              {note.time}
                            </p>
                          </div>
                        ))}

                      <textarea
                        className="w-full border rounded p-2 text-sm"
                        rows={2}
                        placeholder="Add internal note..."
                        value={noteInputs[entry.id] || ""}
                        onChange={(e) =>
                          setNoteInputs((prev) => ({
                            ...prev,
                            [entry.id]: e.target.value,
                          }))
                        }
                      />

                      <button
                        onClick={() => addNote(entry.id)}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
                      >
                        Add Note
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && selectedFormId && filteredEntries.length === 0 && (
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
