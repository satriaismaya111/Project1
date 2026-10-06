let eduChartInstance = null;
let resorChartInstance = null;

function renderCharts(pegawaiList, allPerawatan, allGangguan) {
  // Education Donut Chart
  const eduCounts = { SLTA: 0, D3: 0, S1: 0, S2: 0 };
  pegawaiList.forEach((p) => {
    if (eduCounts[p.pendidikan] !== undefined) eduCounts[p.pendidikan]++;
    else eduCounts.SLTA++;
  });

  const ctxEdu = document.getElementById("educationChart").getContext("2d");
  if (eduChartInstance) eduChartInstance.destroy();
  eduChartInstance = new Chart(ctxEdu, {
    type: "doughnut",
    data: {
      labels: ["SLTA", "D3", "S1", "S2"],
      datasets: [
        {
          data: [eduCounts.SLTA, eduCounts.D3, eduCounts.S1, eduCounts.S2],
          backgroundColor: ["#003366", "#FF6600", "#FFB800", "#10B981"],
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: { boxWidth: 12, font: { size: 10 } },
        },
      },
    },
  });

  // Resor Activity Bar Chart
  const resorLabels = RESOR_LIST.map((r) => r.replace("STL ", ""));
  const perawatanCounts = RESOR_LIST.map(
    (resor) => allPerawatan.filter((p) => p.resor === resor).length
  );
  const gangguanCounts = RESOR_LIST.map(
    (resor) => allGangguan.filter((g) => g.resor === resor).length
  );

  const ctxResor = document
    .getElementById("resorActivityChart")
    .getContext("2d");
  if (resorChartInstance) resorChartInstance.destroy();
  resorChartInstance = new Chart(ctxResor, {
    type: "bar",
    data: {
      labels: resorLabels,
      datasets: [
        {
          label: "Perawatan",
          data: perawatanCounts,
          backgroundColor: "#003366",
        },
        { label: "Gangguan", data: gangguanCounts, backgroundColor: "#EF4444" },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { ticks: { font: { size: 9 }, maxRotation: 45 } },
        y: { beginAtZero: true, ticks: { stepSize: 1, font: { size: 9 } } },
      },
      plugins: {
        legend: {
          position: "top",
          labels: { boxWidth: 12, font: { size: 10 } },
        },
      },
    },
  });
}
