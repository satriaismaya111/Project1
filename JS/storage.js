// Storage Manager via LocalStorage
function getStorageData() {
  const stored = localStorage.getItem("KAI_SINTELIS_DATA_V1");
  if (!stored) {
    localStorage.setItem("KAI_SINTELIS_DATA_V1", JSON.stringify(INITIAL_DATA));
    return INITIAL_DATA;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    return INITIAL_DATA;
  }
}

function saveStorageData(data) {
  localStorage.setItem("KAI_SINTELIS_DATA_V1", JSON.stringify(data));
  refreshAllViews();
}

function resetToDefaultData() {
  if (
    confirm("Apakah Anda yakin ingin mengembalikan data ke sampel default?")
  ) {
    localStorage.setItem("KAI_SINTELIS_DATA_V1", JSON.stringify(INITIAL_DATA));
    refreshAllViews();
    alert("Data berhasil di-reset ke default.");
  }
}

// Export / Import Handler
function exportDataJSON() {
  const data = getStorageData();
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Backup_Sintelis_Daop2_${new Date()
    .toISOString()
    .slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function importDataJSON(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const parsed = JSON.parse(e.target.result);
      if (
        parsed.pegawai &&
        parsed.aset &&
        parsed.perawatan &&
        parsed.gangguan &&
        parsed.rkad
      ) {
        saveStorageData(parsed);
        alert("Data berhasil di-import!");
      } else {
        alert("Format file JSON tidak sesuai struktur Sintelis.");
      }
    } catch (err) {
      alert("Gagal membaca file JSON.");
    }
  };
  reader.readAsText(file);
}
