// Utility Format Currency (Rupiah)
function formatRupiah(num) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(num);
}

// Utility Realtime Clock
function startRealtimeClock() {
  const clockEl = document.getElementById("realtimeClock");
  function update() {
    const now = new Date();
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    };
    if (clockEl) clockEl.textContent = now.toLocaleDateString("en-US", options);
  }
  update();
  setInterval(update, 1000);
}
