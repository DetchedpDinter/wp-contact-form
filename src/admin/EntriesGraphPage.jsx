const { createRoot, useState, useEffect, useRef } = window.wp.element;
const apiFetch = window.wp.apiFetch;

document.addEventListener("DOMContentLoaded", () => {
  const rootEl = document.getElementById("cfp-entries-graph-root");
  if (rootEl) {
    createRoot(rootEl).render(<EntriesGraphPage />);
  }
});

function EntriesGraphPage() {
  const [forms, setForms] = useState([]);
  const [selectedFormId, setSelectedFormId] = useState("");
  const [yearlyData, setYearlyData] = useState({});
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    apiFetch({ path: "/wp/v2/cfp_form?per_page=100" }).then(setForms);
  }, []);

  useEffect(() => {
    if (!selectedFormId) return;

    apiFetch({ path: `/cfp/v1/entries/?form_id=${selectedFormId}` }).then(
      (entries) => {
        const counts = {};
        entries.forEach((entry) => {
          const year = new Date(entry.date).getFullYear();
          counts[year] = (counts[year] || 0) + 1;
        });
        setYearlyData(counts);
      }
    );
  }, [selectedFormId]);

  useEffect(() => {
    if (!canvasRef.current || Object.keys(yearlyData).length === 0) return;

    const ctx = canvasRef.current.getContext("2d");

    if (chartRef.current) {
      chartRef.current.destroy();
    }

    chartRef.current = new window.Chart(ctx, {
      type: "bar",
      data: {
        labels: Object.keys(yearlyData),
        datasets: [
          {
            label: "Entries",
            data: Object.values(yearlyData),
            backgroundColor: "rgba(59, 130, 246, 0.7)",
            borderRadius: 4,
            barThickness: 28,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1,
              precision: 0,
            },
          },
        },
      },
    });
  }, [yearlyData]);

  return (
    <div className="px-8 py-6">
      <h1 className="text-2xl font-semibold mb-6">Entries Graph</h1>

      <div className="mb-6 max-w-lg">
        <label htmlFor="formSelect" className="block text-sm font-medium mb-1">
          Select Form:
        </label>
        <select
          id="formSelect"
          className="border border-gray-300 px-3 py-2 rounded w-full text-sm"
          onChange={(e) => setSelectedFormId(e.target.value)}
          value={selectedFormId}
        >
          <option value="">-- Choose a Form --</option>
          {forms.map((form) => (
            <option key={form.id} value={form.id}>
              {form.title.rendered}
            </option>
          ))}
        </select>
      </div>

      {selectedFormId && (
        <div
          className="bg-white border border-gray-200 p-4 rounded shadow-sm"
          style={{ maxWidth: "700px", height: "320px" }}
        >
          <canvas ref={canvasRef}></canvas>
        </div>
      )}
    </div>
  );
}
