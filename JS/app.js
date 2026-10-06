let currentTab = "overview";
let activeResor = "ALL";
let currentEditingEntity = null;
let currentEditingId = null;

// Tab Switching
function switchTab(tabKey) {
  currentTab = tabKey;
  ["overview", "pegawai", "aset", "perawatan", "gangguan", "rkad"].forEach(
    (key) => {
      const view = document.getElementById(`view-${key}`);
      const btn = document.getElementById(`tab-${key}`);
      if (key === tabKey) {
        view.classList.remove("hidden");
        btn.classList.add("active");
      } else {
        view.classList.add("hidden");
        btn.classList.remove("active");
      }
    }
  );
  refreshAllViews();
}

// Resor Filtering Toggle
function filterByResor(resorName) {
  activeResor = resorName;

  document
    .querySelectorAll(".resor-btn")
    .forEach((btn) => btn.classList.remove("active"));
  const activeBtn = document.getElementById(`resor-${resorName}`);
  if (activeBtn) activeBtn.classList.add("active");

  const badge = document.getElementById("activeResorBadge");
  const notifBar = document.getElementById("filterNotificationBar");
  const resorNameEl = document.getElementById("filterResorName");

  if (resorName === "ALL") {
    badge.textContent = "Semua";
    notifBar.classList.add("hidden");
  } else {
    badge.textContent = resorName.replace("STL ", "");
    notifBar.classList.remove("hidden");
    resorNameEl.textContent = resorName;
  }

  refreshAllViews();
}

// Refresh UI State
function refreshAllViews() {
  const data = getStorageData();
  const filterResorFn = (item) =>
    activeResor === "ALL" || item.resor === activeResor;

  const filteredPegawai = data.pegawai.filter(filterResorFn);
  const filteredAset = data.aset.filter(filterResorFn);
  const filteredPerawatan = data.perawatan.filter(filterResorFn);
  const filteredGangguan = data.gangguan.filter(filterResorFn);
  const filteredRKAD = data.rkad.filter(filterResorFn);

  // Update Overview Stats Cards
  document.getElementById("stat-total-pegawai").textContent =
    filteredPegawai.length;
  document.getElementById("stat-smartcard").textContent =
    filteredPegawai.filter((p) => p.smartcard === "Berlaku").length;
  document.getElementById("stat-bebas-tugas").textContent =
    filteredPegawai.filter((p) => p.smartcard === "Bebas Tugas").length;
  document.getElementById("stat-belum-sertifikasi").textContent =
    filteredPegawai.filter((p) => p.sertifikasi === "Belum").length;

  const totalAsetVal = filteredAset.reduce(
    (acc, a) => acc + a.stok * a.harga,
    0
  );
  document.getElementById("stat-aset-value").textContent =
    formatRupiah(totalAsetVal);
  document.getElementById(
    "stat-aset-count"
  ).textContent = `${filteredAset.length} Jenis Item Aset`;

  const totalPagu = filteredRKAD.reduce((acc, r) => acc + Number(r.pagu), 0);
  const totalRealisasi = filteredRKAD.reduce(
    (acc, r) => acc + Number(r.realisasi),
    0
  );
  const rkadPercent =
    totalPagu > 0 ? Math.round((totalRealisasi / totalPagu) * 100) : 0;
  document.getElementById("stat-rkad-percent").textContent = `${rkadPercent}%`;
  document.getElementById("stat-rkad-bar").style.width = `${Math.min(
    rkadPercent,
    100
  )}%`;
  document.getElementById("stat-rkad-nominal").textContent = `${formatRupiah(
    totalRealisasi
  )} / ${formatRupiah(totalPagu)}`;

  document.getElementById("stat-perawatan-done").textContent =
    filteredPerawatan.filter((p) => p.status === "Selesai").length;
  document.getElementById("stat-gangguan-open").textContent =
    filteredGangguan.filter((g) => g.status === "Proses").length;

  // Table Previews & CRUD Tables
  const overviewTable = document.getElementById("overviewGangguanTable");
  overviewTable.innerHTML =
    filteredGangguan
      .slice(0, 5)
      .map(
        (g) => `
        <tr>
            <td class="p-2 font-mono">${g.tgl}</td>
            <td class="p-2">${g.resor}</td>
            <td class="p-2 font-semibold">${g.peralatan}</td>
            <td class="p-2 text-gray-600">${g.gejala}</td>
            <td class="p-2">
                <span class="px-2 py-0.5 rounded text-[10px] font-bold ${
                  g.status === "Selesai"
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-rose-100 text-rose-800"
                }">
                    ${g.status}
                </span>
            </td>
        </tr>
    `
      )
      .join("") ||
    `<tr><td colspan="5" class="p-4 text-center text-gray-400">Tidak ada log gangguan</td></tr>`;

  renderCharts(filteredPegawai, data.perawatan, data.gangguan);
  renderPegawaiTable(filteredPegawai);
  renderAsetTable(filteredAset);
  renderPerawatanTable(filteredPerawatan);
  renderGangguanTable(filteredGangguan);
  renderRKADTable(filteredRKAD);

  lucide.createIcons();
}

// Table Renderers
function renderPegawaiTable(filtered) {
  const data =
    filtered ||
    getStorageData().pegawai.filter(
      (p) => activeResor === "ALL" || p.resor === activeResor
    );
  const search =
    document.getElementById("searchPegawai")?.value.toLowerCase() || "";
  const finalData = data.filter(
    (p) =>
      p.nama.toLowerCase().includes(search) ||
      p.nipp.toLowerCase().includes(search)
  );

  document.getElementById("tablePegawaiBody").innerHTML =
    finalData
      .map(
        (p) => `
        <tr class="hover:bg-gray-50">
            <td class="p-3 font-mono font-bold text-gray-700">${p.nipp}</td>
            <td class="p-3 font-semibold text-kai-blue">${p.nama}</td>
            <td class="p-3 text-gray-600">${p.resor}</td>
            <td class="p-3">${p.jabatan}</td>
            <td class="p-3"><span class="bg-gray-200 px-2 py-0.5 rounded font-mono text-[10px]">${
              p.pendidikan
            }</span></td>
            <td class="p-3">
                <span class="px-2 py-0.5 rounded text-[10px] font-bold ${
                  p.smartcard === "Berlaku"
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-amber-100 text-amber-800"
                }">
                    ${p.smartcard}
                </span>
            </td>
            <td class="p-3">
                <span class="px-2 py-0.5 rounded text-[10px] font-bold ${
                  p.sertifikasi === "Sudah"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-rose-100 text-rose-800"
                }">
                    ${p.sertifikasi} Sertifikasi
                </span>
            </td>
            <td class="p-3 text-center space-x-1">
                <button onclick="openModal('pegawai', '${
                  p.id
                }')" class="p-1 bg-amber-500 hover:bg-amber-600 text-white rounded transition" title="Edit"><i data-lucide="edit" class="w-3.5 h-3.5"></i></button>
                <button onclick="deleteData('pegawai', '${
                  p.id
                }')" class="p-1 bg-rose-600 hover:bg-rose-700 text-white rounded transition" title="Hapus"><i data-lucide="trash-2" class="w-3.5 h-3.5"></i></button>
            </td>
        </tr>
    `
      )
      .join("") ||
    `<tr><td colspan="8" class="p-4 text-center text-gray-400">Tidak ada data pegawai</td></tr>`;
}

function renderAsetTable(filtered) {
  const data =
    filtered ||
    getStorageData().aset.filter(
      (a) => activeResor === "ALL" || a.resor === activeResor
    );
  const search =
    document.getElementById("searchAset")?.value.toLowerCase() || "";
  const finalData = data.filter(
    (a) =>
      a.nama.toLowerCase().includes(search) ||
      a.kode.toLowerCase().includes(search)
  );

  document.getElementById("tableAsetBody").innerHTML =
    finalData
      .map(
        (a) => `
        <tr class="hover:bg-gray-50">
            <td class="p-3 font-mono font-bold text-gray-700">${a.kode}</td>
            <td class="p-3 font-semibold text-kai-blue">${a.nama}</td>
            <td class="p-3 text-gray-600">${a.resor}</td>
            <td class="p-3"><span class="bg-blue-50 text-blue-800 px-2 py-0.5 rounded text-[10px] font-semibold">${
              a.kategori
            }</span></td>
            <td class="p-3 font-bold ${
              a.stok < 5 ? "text-rose-600" : "text-gray-800"
            }">${a.stok} Unit</td>
            <td class="p-3">${formatRupiah(a.harga)}</td>
            <td class="p-3 font-bold text-emerald-700">${formatRupiah(
              a.stok * a.harga
            )}</td>
            <td class="p-3 text-center space-x-1">
                <button onclick="openModal('aset', '${
                  a.id
                }')" class="p-1 bg-amber-500 hover:bg-amber-600 text-white rounded transition"><i data-lucide="edit" class="w-3.5 h-3.5"></i></button>
                <button onclick="deleteData('aset', '${
                  a.id
                }')" class="p-1 bg-rose-600 hover:bg-rose-700 text-white rounded transition"><i data-lucide="trash-2" class="w-3.5 h-3.5"></i></button>
            </td>
        </tr>
    `
      )
      .join("") ||
    `<tr><td colspan="8" class="p-4 text-center text-gray-400">Tidak ada data aset</td></tr>`;
}

function renderPerawatanTable(filtered) {
  const data =
    filtered ||
    getStorageData().perawatan.filter(
      (p) => activeResor === "ALL" || p.resor === activeResor
    );
  const search =
    document.getElementById("searchPerawatan")?.value.toLowerCase() || "";
  const finalData = data.filter(
    (p) =>
      p.peralatan.toLowerCase().includes(search) ||
      p.petugas.toLowerCase().includes(search)
  );

  document.getElementById("tablePerawatanBody").innerHTML =
    finalData
      .map(
        (p) => `
        <tr class="hover:bg-gray-50">
            <td class="p-3 font-mono">${p.tgl}</td>
            <td class="p-3 text-gray-600">${p.resor}</td>
            <td class="p-3 font-semibold text-kai-blue">${p.peralatan}</td>
            <td class="p-3">${p.jenis}</td>
            <td class="p-3 text-gray-700">${p.petugas}</td>
            <td class="p-3">
                <span class="px-2 py-0.5 rounded text-[10px] font-bold ${
                  p.status === "Selesai"
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-sky-100 text-sky-800"
                }">
                    ${p.status}
                </span>
            </td>
            <td class="p-3 text-center space-x-1">
                <button onclick="openModal('perawatan', '${
                  p.id
                }')" class="p-1 bg-amber-500 hover:bg-amber-600 text-white rounded transition"><i data-lucide="edit" class="w-3.5 h-3.5"></i></button>
                <button onclick="deleteData('perawatan', '${
                  p.id
                }')" class="p-1 bg-rose-600 hover:bg-rose-700 text-white rounded transition"><i data-lucide="trash-2" class="w-3.5 h-3.5"></i></button>
            </td>
        </tr>
    `
      )
      .join("") ||
    `<tr><td colspan="7" class="p-4 text-center text-gray-400">Tidak ada data perawatan</td></tr>`;
}

function renderGangguanTable(filtered) {
  const data =
    filtered ||
    getStorageData().gangguan.filter(
      (g) => activeResor === "ALL" || g.resor === activeResor
    );
  const search =
    document.getElementById("searchGangguan")?.value.toLowerCase() || "";
  const finalData = data.filter(
    (g) =>
      g.peralatan.toLowerCase().includes(search) ||
      g.gejala.toLowerCase().includes(search)
  );

  document.getElementById("tableGangguanBody").innerHTML =
    finalData
      .map(
        (g) => `
        <tr class="hover:bg-gray-50">
            <td class="p-3 font-mono">${g.tgl}</td>
            <td class="p-3 text-gray-600">${g.resor}</td>
            <td class="p-3 font-semibold text-kai-blue">${g.peralatan}</td>
            <td class="p-3 text-rose-700 font-medium">${g.gejala}</td>
            <td class="p-3 text-gray-700">${g.tindakan}</td>
            <td class="p-3">
                <span class="px-2 py-0.5 rounded text-[10px] font-bold ${
                  g.status === "Selesai"
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-rose-100 text-rose-800"
                }">
                    ${g.status}
                </span>
            </td>
            <td class="p-3 text-center space-x-1">
                <button onclick="openModal('gangguan', '${
                  g.id
                }')" class="p-1 bg-amber-500 hover:bg-amber-600 text-white rounded transition"><i data-lucide="edit" class="w-3.5 h-3.5"></i></button>
                <button onclick="deleteData('gangguan', '${
                  g.id
                }')" class="p-1 bg-rose-600 hover:bg-rose-700 text-white rounded transition"><i data-lucide="trash-2" class="w-3.5 h-3.5"></i></button>
            </td>
        </tr>
    `
      )
      .join("") ||
    `<tr><td colspan="7" class="p-4 text-center text-gray-400">Tidak ada data gangguan</td></tr>`;
}

function renderRKADTable(filtered) {
  const data =
    filtered ||
    getStorageData().rkad.filter(
      (r) => activeResor === "ALL" || r.resor === activeResor
    );
  const search =
    document.getElementById("searchRKAD")?.value.toLowerCase() || "";
  const finalData = data.filter(
    (r) =>
      r.nama.toLowerCase().includes(search) ||
      r.kode.toLowerCase().includes(search)
  );

  document.getElementById("tableRKADBody").innerHTML =
    finalData
      .map((r) => {
        const percent = Math.round((r.realisasi / r.pagu) * 100) || 0;
        return `
            <tr class="hover:bg-gray-50">
                <td class="p-3 font-mono font-bold text-gray-700">${r.kode}</td>
                <td class="p-3 font-semibold text-kai-blue">${r.nama}</td>
                <td class="p-3 text-gray-600">${r.resor}</td>
                <td class="p-3 font-bold">${formatRupiah(r.pagu)}</td>
                <td class="p-3 font-bold text-emerald-700">${formatRupiah(
                  r.realisasi
                )}</td>
                <td class="p-3">
                    <div class="flex items-center gap-2">
                        <span class="font-bold text-xs">${percent}%</span>
                        <div class="w-16 bg-gray-200 rounded-full h-1.5">
                            <div class="bg-emerald-500 h-1.5 rounded-full" style="width: ${Math.min(
                              percent,
                              100
                            )}%"></div>
                        </div>
                    </div>
                </td>
                <td class="p-3 text-center space-x-1">
                    <button onclick="openModal('rkad', '${
                      r.id
                    }')" class="p-1 bg-amber-500 hover:bg-amber-600 text-white rounded transition"><i data-lucide="edit" class="w-3.5 h-3.5"></i></button>
                    <button onclick="deleteData('rkad', '${
                      r.id
                    }')" class="p-1 bg-rose-600 hover:bg-rose-700 text-white rounded transition"><i data-lucide="trash-2" class="w-3.5 h-3.5"></i></button>
                </td>
            </tr>
        `;
      })
      .join("") ||
    `<tr><td colspan="7" class="p-4 text-center text-gray-400">Tidak ada program RKAD</td></tr>`;
}

// Modal Form & CRUD Logics
function openModal(entity, id = null) {
  currentEditingEntity = entity;
  currentEditingId = id;

  const modal = document.getElementById("crudModal");
  const titleEl = document.getElementById("modalTitle");
  const container = document.getElementById("modalFormContainer");

  const allData = getStorageData();
  const existing = id ? allData[entity].find((item) => item.id === id) : null;

  titleEl.textContent = `${id ? "Edit" : "Tambah"} ${entity.toUpperCase()}`;
  const resorOptions = RESOR_LIST.map(
    (r) =>
      `<option value="${r}" ${
        existing && existing.resor === r ? "selected" : ""
      }>${r}</option>`
  ).join("");

  let formHTML = "";

  if (entity === "pegawai") {
    formHTML = `
            <div><label class="block text-xs font-semibold text-gray-700 mb-1">NIPP / NIP</label><input type="text" id="inp-nipp" value="${
              existing ? existing.nipp : ""
            }" class="w-full text-xs border rounded p-2 focus:ring-2 focus:ring-kai-blue" required></div>
            <div><label class="block text-xs font-semibold text-gray-700 mb-1">Nama Lengkap</label><input type="text" id="inp-nama" value="${
              existing ? existing.nama : ""
            }" class="w-full text-xs border rounded p-2 focus:ring-2 focus:ring-kai-blue" required></div>
            <div><label class="block text-xs font-semibold text-gray-700 mb-1">Resor UPT</label><select id="inp-resor" class="w-full text-xs border rounded p-2 focus:ring-2 focus:ring-kai-blue">${resorOptions}</select></div>
            <div><label class="block text-xs font-semibold text-gray-700 mb-1">Jabatan</label><input type="text" id="inp-jabatan" value="${
              existing ? existing.jabatan : ""
            }" class="w-full text-xs border rounded p-2 focus:ring-2 focus:ring-kai-blue"></div>
            <div class="grid grid-cols-3 gap-2">
                <div><label class="block text-xs font-semibold text-gray-700 mb-1">Pendidikan</label><select id="inp-pendidikan" class="w-full text-xs border rounded p-2"><option ${
                  existing && existing.pendidikan === "SLTA" ? "selected" : ""
                }>SLTA</option><option ${
      existing && existing.pendidikan === "D3" ? "selected" : ""
    }>D3</option><option ${
      existing && existing.pendidikan === "S1" ? "selected" : ""
    }>S1</option><option ${
      existing && existing.pendidikan === "S2" ? "selected" : ""
    }>S2</option></select></div>
                <div><label class="block text-xs font-semibold text-gray-700 mb-1">Smartcard</label><select id="inp-smartcard" class="w-full text-xs border rounded p-2"><option ${
                  existing && existing.smartcard === "Berlaku" ? "selected" : ""
                }>Berlaku</option><option ${
      existing && existing.smartcard === "Bebas Tugas" ? "selected" : ""
    }>Bebas Tugas</option></select></div>
                <div><label class="block text-xs font-semibold text-gray-700 mb-1">Sertifikasi</label><select id="inp-sertifikasi" class="w-full text-xs border rounded p-2"><option ${
                  existing && existing.sertifikasi === "Sudah" ? "selected" : ""
                }>Sudah</option><option ${
      existing && existing.sertifikasi === "Belum" ? "selected" : ""
    }>Belum</option></select></div>
            </div>`;
  } else if (entity === "aset") {
    formHTML = `
            <div><label class="block text-xs font-semibold text-gray-700 mb-1">Kode Material/Aset</label><input type="text" id="inp-kode" value="${
              existing
                ? existing.kode
                : "AST-" + Math.floor(Math.random() * 1000)
            }" class="w-full text-xs border rounded p-2 font-mono" required></div>
            <div><label class="block text-xs font-semibold text-gray-700 mb-1">Nama Barang / Material</label><input type="text" id="inp-nama" value="${
              existing ? existing.nama : ""
            }" class="w-full text-xs border rounded p-2" required></div>
            <div><label class="block text-xs font-semibold text-gray-700 mb-1">Lokasi Resor</label><select id="inp-resor" class="w-full text-xs border rounded p-2">${resorOptions}</select></div>
            <div class="grid grid-cols-3 gap-2">
                <div><label class="block text-xs font-semibold text-gray-700 mb-1">Kategori</label><select id="inp-kategori" class="w-full text-xs border rounded p-2"><option ${
                  existing && existing.kategori === "Sinyal" ? "selected" : ""
                }>Sinyal</option><option ${
      existing && existing.kategori === "Telekomunikasi" ? "selected" : ""
    }>Telekomunikasi</option><option ${
      existing && existing.kategori === "Kelistrikan" ? "selected" : ""
    }>Kelistrikan</option></select></div>
                <div><label class="block text-xs font-semibold text-gray-700 mb-1">Jumlah Stok</label><input type="number" id="inp-stok" value="${
                  existing ? existing.stok : 1
                }" class="w-full text-xs border rounded p-2" required></div>
                <div><label class="block text-xs font-semibold text-gray-700 mb-1">Harga Satuan (Rp)</label><input type="number" id="inp-harga" value="${
                  existing ? existing.harga : 0
                }" class="w-full text-xs border rounded p-2" required></div>
            </div>`;
  } else if (entity === "perawatan") {
    formHTML = `
            <div><label class="block text-xs font-semibold text-gray-700 mb-1">Tanggal Jadwal</label><input type="date" id="inp-tgl" value="${
              existing ? existing.tgl : new Date().toISOString().slice(0, 10)
            }" class="w-full text-xs border rounded p-2" required></div>
            <div><label class="block text-xs font-semibold text-gray-700 mb-1">Resor Pelaksana</label><select id="inp-resor" class="w-full text-xs border rounded p-2">${resorOptions}</select></div>
            <div><label class="block text-xs font-semibold text-gray-700 mb-1">Nama Peralatan / Fasilitas</label><input type="text" id="inp-peralatan" value="${
              existing ? existing.peralatan : ""
            }" class="w-full text-xs border rounded p-2" required></div>
            <div class="grid grid-cols-2 gap-2">
                <div><label class="block text-xs font-semibold text-gray-700 mb-1">Jenis Maintenance</label><input type="text" id="inp-jenis" value="${
                  existing ? existing.jenis : "Bulanan"
                }" class="w-full text-xs border rounded p-2"></div>
                <div><label class="block text-xs font-semibold text-gray-700 mb-1">Status</label><select id="inp-status" class="w-full text-xs border rounded p-2"><option ${
                  existing && existing.status === "Terjadwal" ? "selected" : ""
                }>Terjadwal</option><option ${
      existing && existing.status === "Selesai" ? "selected" : ""
    }>Selesai</option></select></div>
            </div>
            <div><label class="block text-xs font-semibold text-gray-700 mb-1">Petugas Pelaksana</label><input type="text" id="inp-petugas" value="${
              existing ? existing.petugas : ""
            }" class="w-full text-xs border rounded p-2"></div>`;
  } else if (entity === "gangguan") {
    formHTML = `
            <div><label class="block text-xs font-semibold text-gray-700 mb-1">Tanggal Laporan</label><input type="date" id="inp-tgl" value="${
              existing ? existing.tgl : new Date().toISOString().slice(0, 10)
            }" class="w-full text-xs border rounded p-2" required></div>
            <div><label class="block text-xs font-semibold text-gray-700 mb-1">Lokasi Resor</label><select id="inp-resor" class="w-full text-xs border rounded p-2">${resorOptions}</select></div>
            <div><label class="block text-xs font-semibold text-gray-700 mb-1">Peralatan Terganggu</label><input type="text" id="inp-peralatan" value="${
              existing ? existing.peralatan : ""
            }" class="w-full text-xs border rounded p-2" required></div>
            <div><label class="block text-xs font-semibold text-gray-700 mb-1">Gejala / Deskripsi Masalah</label><textarea id="inp-gejala" class="w-full text-xs border rounded p-2" rows="2" required>${
              existing ? existing.gejala : ""
            }</textarea></div>
            <div><label class="block text-xs font-semibold text-gray-700 mb-1">Tindakan Perbaikan</label><input type="text" id="inp-tindakan" value="${
              existing ? existing.tindakan : ""
            }" class="w-full text-xs border rounded p-2"></div>
            <div><label class="block text-xs font-semibold text-gray-700 mb-1">Status Penanganan</label><select id="inp-status" class="w-full text-xs border rounded p-2"><option ${
              existing && existing.status === "Proses" ? "selected" : ""
            }>Proses</option><option ${
      existing && existing.status === "Selesai" ? "selected" : ""
    }>Selesai</option></select></div>`;
  } else if (entity === "rkad") {
    formHTML = `
            <div><label class="block text-xs font-semibold text-gray-700 mb-1">Kode Program</label><input type="text" id="inp-kode" value="${
              existing
                ? existing.kode
                : "RKAD-0" + Math.floor(Math.random() * 100)
            }" class="w-full text-xs border rounded p-2 font-mono" required></div>
            <div><label class="block text-xs font-semibold text-gray-700 mb-1">Nama Program Kerja</label><input type="text" id="inp-nama" value="${
              existing ? existing.nama : ""
            }" class="w-full text-xs border rounded p-2" required></div>
            <div><label class="block text-xs font-semibold text-gray-700 mb-1">Resor / Unit</label><select id="inp-resor" class="w-full text-xs border rounded p-2">${resorOptions}</select></div>
            <div class="grid grid-cols-2 gap-2">
                <div><label class="block text-xs font-semibold text-gray-700 mb-1">Pagu Anggaran (Rp)</label><input type="number" id="inp-pagu" value="${
                  existing ? existing.pagu : 0
                }" class="w-full text-xs border rounded p-2" required></div>
                <div><label class="block text-xs font-semibold text-gray-700 mb-1">Realisasi (Rp)</label><input type="number" id="inp-realisasi" value="${
                  existing ? existing.realisasi : 0
                }" class="w-full text-xs border rounded p-2" required></div>
            </div>`;
  }

  container.innerHTML = formHTML;
  modal.classList.remove("hidden");
  lucide.createIcons();
}

function closeModal() {
  document.getElementById("crudModal").classList.add("hidden");
}

function saveModalData() {
  const data = getStorageData();
  const entity = currentEditingEntity;
  let newItem = { id: currentEditingId || Date.now().toString() };

  if (entity === "pegawai") {
    newItem.nipp = document.getElementById("inp-nipp").value;
    newItem.nama = document.getElementById("inp-nama").value;
    newItem.resor = document.getElementById("inp-resor").value;
    newItem.jabatan = document.getElementById("inp-jabatan").value;
    newItem.pendidikan = document.getElementById("inp-pendidikan").value;
    newItem.smartcard = document.getElementById("inp-smartcard").value;
    newItem.sertifikasi = document.getElementById("inp-sertifikasi").value;
  } else if (entity === "aset") {
    newItem.kode = document.getElementById("inp-kode").value;
    newItem.nama = document.getElementById("inp-nama").value;
    newItem.resor = document.getElementById("inp-resor").value;
    newItem.kategori = document.getElementById("inp-kategori").value;
    newItem.stok = Number(document.getElementById("inp-stok").value);
    newItem.harga = Number(document.getElementById("inp-harga").value);
  } else if (entity === "perawatan") {
    newItem.tgl = document.getElementById("inp-tgl").value;
    newItem.resor = document.getElementById("inp-resor").value;
    newItem.peralatan = document.getElementById("inp-peralatan").value;
    newItem.jenis = document.getElementById("inp-jenis").value;
    newItem.petugas = document.getElementById("inp-petugas").value;
    newItem.status = document.getElementById("inp-status").value;
  } else if (entity === "gangguan") {
    newItem.tgl = document.getElementById("inp-tgl").value;
    newItem.resor = document.getElementById("inp-resor").value;
    newItem.peralatan = document.getElementById("inp-peralatan").value;
    newItem.gejala = document.getElementById("inp-gejala").value;
    newItem.tindakan = document.getElementById("inp-tindakan").value;
    newItem.status = document.getElementById("inp-status").value;
  } else if (entity === "rkad") {
    newItem.kode = document.getElementById("inp-kode").value;
    newItem.nama = document.getElementById("inp-nama").value;
    newItem.resor = document.getElementById("inp-resor").value;
    newItem.pagu = Number(document.getElementById("inp-pagu").value);
    newItem.realisasi = Number(document.getElementById("inp-realisasi").value);
  }

  if (currentEditingId) {
    const idx = data[entity].findIndex((i) => i.id === currentEditingId);
    if (idx !== -1) data[entity][idx] = newItem;
  } else {
    data[entity].push(newItem);
  }

  saveStorageData(data);
  closeModal();
}

function deleteData(entity, id) {
  if (confirm("Apakah Anda yakin ingin menghapus data ini?")) {
    const data = getStorageData();
    data[entity] = data[entity].filter((i) => i.id !== id);
    saveStorageData(data);
  }
}

// Window Onload Init
window.onload = function () {
  startRealtimeClock();
  refreshAllViews();
};
