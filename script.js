// In-memory data storage (replace with backend/db calls in real app)
let stockInRecords = [];
let stockOutRecords = [];
let purchaseRecords = [];

// Utility: format date to YYYY-MM-DD
function formatDate(date) {
  const d = new Date(date);
  return d.toISOString().split('T')[0];
}

// Add Stock In record
function addStockIn(event) {
  event.preventDefault();
  const date = document.getElementById("stockInDate").value;
  const item = document.getElementById("stockInItem").value.trim();
  const qty = parseInt(document.getElementById("stockInQty").value, 10);

  const messageEl = document.getElementById("stockInMessage");
  if (!date || !item || isNaN(qty) || qty <= 0) {
    messageEl.textContent = "Please fill all fields with valid values.";
    return;
  }

  stockInRecords.push({ date: formatDate(date), item, quantity: qty });
  messageEl.textContent = "Stock In added successfully.";
  event.target.reset();
  loadStockInRecords();
  loadStockBalance();
  loadDashboardSummary();
}

// Display Stock In records list
function loadStockInRecords() {
  const listEl = document.getElementById("stockInList");
  if (!listEl) return;

  if (stockInRecords.length === 0) {
    listEl.innerHTML = "<p>No Stock In records.</p>";
    return;
  }

  let html = "<ul>";
  stockInRecords.forEach((rec, i) => {
    html += `<li>${rec.date} - ${rec.item}: ${rec.quantity}</li>`;
  });
  html += "</ul>";
  listEl.innerHTML = html;
}

// Add Stock Out record
function addStockOut(event) {
  event.preventDefault();
  const date = document.getElementById("stockOutDate").value;
  const item = document.getElementById("stockOutItem").value.trim();
  const qty = parseInt(document.getElementById("stockOutQty").value, 10);

  const messageEl = document.getElementById("stockOutMessage");
  if (!date || !item || isNaN(qty) || qty <= 0) {
    messageEl.textContent = "Please fill all fields with valid values.";
    return;
  }

  // Check if stock available before adding stock out
  const balance = calculateItemBalance(item);
  if (qty > balance) {
    messageEl.textContent = `Cannot stock out ${qty}. Only ${balance} available.`;
    return;
  }

  stockOutRecords.push({ date: formatDate(date), item, quantity: qty });
  messageEl.textContent = "Stock Out added successfully.";
  event.target.reset();
  loadStockOutRecords();
  loadStockBalance();
  loadDashboardSummary();
}

// Display Stock Out records list
function loadStockOutRecords() {
  const listEl = document.getElementById("stockOutList");
  if (!listEl) return;

  if (stockOutRecords.length === 0) {
    listEl.innerHTML = "<p>No Stock Out records.</p>";
    return;
  }

  let html = "<ul>";
  stockOutRecords.forEach((rec, i) => {
    html += `<li>${rec.date} - ${rec.item}: ${rec.quantity}</li>`;
  });
  html += "</ul>";
  listEl.innerHTML = html;
}

// Add Purchase record
function addPurchase(event) {
  event.preventDefault();
  const date = document.getElementById("purchaseDate").value;
  const item = document.getElementById("purchaseItem").value.trim();
  const qty = parseInt(document.getElementById("purchaseQty").value, 10);

  const messageEl = document.getElementById("purchaseMessage");
  if (!date || !item || isNaN(qty) || qty <= 0) {
    messageEl.textContent = "Please fill all fields with valid values.";
    return;
  }

  purchaseRecords.push({ date: formatDate(date), item, quantity: qty });
  messageEl.textContent = "Purchase added successfully.";
  event.target.reset();
  loadPurchaseRecords();
  loadStockBalance();
  loadDashboardSummary();
}

// Display Purchase records list
function loadPurchaseRecords() {
  const listEl = document.getElementById("purchaseList");
  if (!listEl) return;

  if (purchaseRecords.length === 0) {
    listEl.innerHTML = "<p>No Purchase records.</p>";
    return;
  }

  let html = "<ul>";
  purchaseRecords.forEach((rec, i) => {
    html += `<li>${rec.date} - ${rec.item}: ${rec.quantity}</li>`;
  });
  html += "</ul>";
  listEl.innerHTML = html;
}

// Calculate balance for a single item
function calculateItemBalance(item) {
  const totalIn = stockInRecords
    .filter(r => r.item === item)
    .reduce((acc, r) => acc + r.quantity, 0);
  const totalPurchased = purchaseRecords
    .filter(r => r.item === item)
    .reduce((acc, r) => acc + r.quantity, 0);
  const totalOut = stockOutRecords
    .filter(r => r.item === item)
    .reduce((acc, r) => acc + r.quantity, 0);
  return totalIn + totalPurchased - totalOut;
}

// Load and display stock balance list with status
function loadStockBalance() {
  const listEl = document.getElementById("stockBalanceList");
  if (!listEl) return;

  // Collect all items from all records
  const allItemsSet = new Set([
    ...stockInRecords.map(r => r.item),
    ...purchaseRecords.map(r => r.item),
    ...stockOutRecords.map(r => r.item),
  ]);
  const allItems = Array.from(allItemsSet);

  if (allItems.length === 0) {
    listEl.innerHTML = "<p>No items found for stock balance.</p>";
    return;
  }

  // Safety stock value (hardcoded or could be user input)
  const SAFETY_STOCK = 10; // you can adjust or make dynamic

  let html = "<table border='1' cellpadding='5' cellspacing='0'>";
  html += "<tr><th>Item</th><th>Opening Stock</th><th>Current Balance</th><th>Safety Stock</th><th>Status</th></tr>";

  allItems.forEach(item => {
    const openingStock = 0; // could be customized or saved
    const currentBalance = calculateItemBalance(item);
    const safetyStock = SAFETY_STOCK;
    const status = currentBalance > safetyStock ? "OK" : "Reorder";

    html += `<tr>
      <td>${item}</td>
      <td>${openingStock}</td>
      <td>${currentBalance}</td>
      <td>${safetyStock}</td>
      <td>${status}</td>
    </tr>`;
  });

  html += "</table>";
  listEl.innerHTML = html;
}

// Load and display dashboard summary
function loadDashboardSummary() {
  const dashEl = document.getElementById("dashboardSummary");
  if (!dashEl) return;

  // Collect all unique items from all records
  const allItemsSet = new Set([
    ...stockInRecords.map(r => r.item),
    ...purchaseRecords.map(r => r.item),
    ...stockOutRecords.map(r => r.item),
  ]);
  const allItems = Array.from(allItemsSet);

  if (allItems.length === 0) {
    dashEl.innerHTML = "<p>No data available for dashboard summary.</p>";
    return;
  }

  let html = "<ul>";
  allItems.forEach(item => {
    const balance = calculateItemBalance(item);
    html += `<li><strong>${item}:</strong> Balance ${balance}</li>`;
  });
  html += "</ul>";

  dashEl.innerHTML = html;
}

// Export dashboard summary to PDF using jsPDF
function exportDashboardToPDF() {
  if (typeof window.jspdf === "undefined" && typeof window.jsPDF === "undefined") {
    alert("jsPDF library is not loaded.");
    return;
  }

  const jsPDFClass = window.jspdf ? window.jspdf.jsPDF : window.jsPDF;
  const doc = new jsPDFClass();

  const dashEl = document.getElementById("dashboardSummary");
  if (!dashEl) {
    alert("No dashboard data to export.");
    return;
  }

  const lines = [];
  const items = dashEl.querySelectorAll("li");
  if (items.length === 0) {
    alert("Dashboard is empty, nothing to export.");
    return;
  }

  items.forEach(li => lines.push(li.textContent));

  doc.setFontSize(16);
  doc.text("Stock Management Dashboard Summary", 10, 20);
  doc.setFontSize(12);

  let y = 30;
  lines.forEach(line => {
    doc.text(line, 10, y);
    y += 10;
  });

  doc.save("dashboard-summary.pdf");
}

// Initialization function to bind events and load data
function init() {
  // Stock In form
  const stockInForm = document.getElementById("stockInForm");
  if (stockInForm) {
    stockInForm.addEventListener("submit", addStockIn);
    loadStockInRecords();
  }

  // Stock Out form
  const stockOutForm = document.getElementById("stockOutForm");
  if (stockOutForm) {
    stockOutForm.addEventListener("submit", addStockOut);
    loadStockOutRecords();
  }

  // Purchase form
  const purchaseForm = document.getElementById("purchaseForm");
  if (purchaseForm) {
    purchaseForm.addEventListener("submit", addPurchase);
    loadPurchaseRecords();
  }

  // Stock Balance display
  if (document.getElementById("stockBalanceList")) {
    loadStockBalance();
  }

  // Dashboard summary and export button
  const dashEl = document.getElementById("dashboardSummary");
  if (dashEl) {
    loadDashboardSummary();
    const exportBtn = document.getElementById("exportDashboardPDF");
    if (exportBtn) exportBtn.addEventListener("click", exportDashboardToPDF);
  }
}

window.addEventListener("DOMContentLoaded", init);
