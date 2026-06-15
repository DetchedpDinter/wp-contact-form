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
  const [entries, setEntries] = useState([]);
  const [viewMode, setViewMode] = useState("monthly");

  const lineCanvasRef = useRef(null);
  const lineChartRef = useRef(null);

  const barCanvasRef = useRef(null);
  const barChartRef = useRef(null);

  const doughnutCanvasRef = useRef(null);
  const doughnutChartRef = useRef(null);

  useEffect(() => {
    apiFetch({
      path: "/wp/v2/cfp_form?per_page=100",
    }).then(setForms);
  }, []);

  useEffect(() => {
    if (!selectedFormId) return;

    apiFetch({
      path: `/cfp/v1/entries/?form_id=${selectedFormId}`,
    }).then((data) => {
      setEntries(data || []);
    });
  }, [selectedFormId]);

  const totalLeads = entries.length;

  const wonLeads = entries.filter((entry) => entry.status === "won").length;

  const lostLeads = entries.filter((entry) => entry.status === "lost").length;

  const newLeads = entries.filter(
    (entry) => (entry.status || "new") === "new",
  ).length;

  const conversionRate =
    totalLeads > 0 ? ((wonLeads / totalLeads) * 100).toFixed(1) : 0;

  const aggregateEntries = () => {
    const grouped = {};

    entries.forEach((entry) => {
      const date = new Date(entry.date);

      const key =
        viewMode === "yearly"
          ? date.getFullYear().toString()
          : `${date.toLocaleString("default", {
              month: "short",
            })} ${date.getFullYear()}`;

      if (!grouped[key]) {
        grouped[key] = {
          total: 0,
          new: 0,
          won: 0,
          lost: 0,
        };
      }

      grouped[key].total++;

      const status = entry.status || "new";

      if (status === "new") grouped[key].new++;
      if (status === "won") grouped[key].won++;
      if (status === "lost") grouped[key].lost++;
    });

    return grouped;
  };

  useEffect(() => {
    if (!lineCanvasRef.current || entries.length === 0) return;

    const grouped = aggregateEntries();

    const labels = Object.keys(grouped);

    const ctx = lineCanvasRef.current.getContext("2d");

    if (lineChartRef.current) {
      lineChartRef.current.destroy();
    }

    lineChartRef.current = new window.Chart(ctx, {
      type: "line",

      data: {
        labels,

        datasets: [
          {
            label: "Total Leads",
            data: labels.map((label) => grouped[label].total),
            borderColor: "#3b82f6",
            backgroundColor: "rgba(59,130,246,0.1)",
            tension: 0.4,
          },

          {
            label: "New Leads",
            data: labels.map((label) => grouped[label].new),
            borderColor: "#facc15",
            backgroundColor: "rgba(250,204,21,0.1)",
            tension: 0.4,
          },

          {
            label: "Won Leads",
            data: labels.map((label) => grouped[label].won),
            borderColor: "#22c55e",
            backgroundColor: "rgba(34,197,94,0.1)",
            tension: 0.4,
          },

          {
            label: "Lost Leads",
            data: labels.map((label) => grouped[label].lost),
            borderColor: "#ef4444",
            backgroundColor: "rgba(239,68,68,0.1)",
            tension: 0.4,
          },
        ],
      },

      options: {
        responsive: true,
        maintainAspectRatio: false,

        interaction: {
          mode: "index",
          intersect: false,
        },

        plugins: {
          legend: {
            position: "top",
          },
        },
      },
    });
  }, [entries, viewMode]);

  useEffect(() => {
    if (!barCanvasRef.current || entries.length === 0) return;

    const grouped = aggregateEntries();

    const labels = Object.keys(grouped);

    const ctx = barCanvasRef.current.getContext("2d");

    if (barChartRef.current) {
      barChartRef.current.destroy();
    }

    barChartRef.current = new window.Chart(ctx, {
      type: "bar",

      data: {
        labels,

        datasets: [
          {
            label: "New Leads",
            data: labels.map((label) => grouped[label].new),
            backgroundColor: "#facc15",
            borderRadius: 6,
          },

          {
            label: "Won Leads",
            data: labels.map((label) => grouped[label].won),
            backgroundColor: "#22c55e",
            borderRadius: 6,
          },

          {
            label: "Lost Leads",
            data: labels.map((label) => grouped[label].lost),
            backgroundColor: "#ef4444",
            borderRadius: 6,
          },
        ],
      },

      options: {
        responsive: true,
        maintainAspectRatio: false,

        interaction: {
          mode: "index",
          intersect: false,
        },

        plugins: {
          legend: {
            position: "top",
          },
        },

        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });
  }, [entries, viewMode]);

  useEffect(() => {
    if (!doughnutCanvasRef.current || entries.length === 0) return;

    const statusCounts = {
      new: 0,
      contacted: 0,
      qualified: 0,
      proposal_sent: 0,
      won: 0,
      lost: 0,
    };

    entries.forEach((entry) => {
      const status = entry.status || "new";

      if (statusCounts[status] !== undefined) {
        statusCounts[status]++;
      }
    });

    const ctx = doughnutCanvasRef.current.getContext("2d");

    if (doughnutChartRef.current) {
      doughnutChartRef.current.destroy();
    }

    doughnutChartRef.current = new window.Chart(ctx, {
      type: "doughnut",

      data: {
        labels: Object.keys(statusCounts),

        datasets: [
          {
            data: Object.values(statusCounts),

            backgroundColor: [
              "#facc15",
              "#38bdf8",
              "#818cf8",
              "#fb7185",
              "#22c55e",
              "#ef4444",
            ],
          },
        ],
      },

      options: {
        responsive: true,
        maintainAspectRatio: false,
      },
    });
  }, [entries]);

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          CRM Analytics Dashboard
        </h1>

        <p className="text-gray-500 mt-2">
          Monitor leads, conversions and pipeline activity
        </p>
      </div>

      <div className="mb-8 max-w-md">
        <label className="block text-sm font-medium mb-2">Select Form</label>

        <select
          className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white"
          value={selectedFormId}
          onChange={(e) => setSelectedFormId(e.target.value)}
        >
          <option value="">-- Choose Form --</option>

          {forms.map((form) => (
            <option key={form.id} value={form.id}>
              {form.title.rendered}
            </option>
          ))}
        </select>
      </div>

      {selectedFormId && (
        <>
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setViewMode("monthly")}
              className={`px-4 py-2 rounded-lg text-sm ${
                viewMode === "monthly"
                  ? "bg-blue-600 text-white"
                  : "bg-white border"
              }`}
            >
              Monthly
            </button>

            <button
              onClick={() => setViewMode("yearly")}
              className={`px-4 py-2 rounded-lg text-sm ${
                viewMode === "yearly"
                  ? "bg-blue-600 text-white"
                  : "bg-white border"
              }`}
            >
              Yearly
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <MetricCard title="Total Leads" value={totalLeads} />
            <MetricCard title="New Leads" value={newLeads} />
            <MetricCard title="Won Leads" value={wonLeads} />
            <MetricCard title="Lost Leads" value={lostLeads} />
            <MetricCard title="Conversion Rate" value={`${conversionRate}%`} />
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
            <h2 className="text-lg font-semibold mb-4">
              Lead Performance Trends
            </h2>

            <div className="h-[420px]">
              <canvas ref={lineCanvasRef}></canvas>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-lg font-semibold mb-4">Leads Breakdown</h2>

              <div className="h-[350px]">
                <canvas ref={barCanvasRef}></canvas>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-lg font-semibold mb-4">
                Pipeline Distribution
              </h2>

              <div className="h-[350px]">
                <canvas ref={doughnutCanvasRef}></canvas>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function MetricCard({ title, value }) {
  return (
    <div className="bg-white rounded-xl border shadow-sm p-5">
      <p className="text-sm text-gray-500">{title}</p>

      <h3 className="text-3xl font-bold mt-3 text-gray-800">{value}</h3>
    </div>
  );
}
