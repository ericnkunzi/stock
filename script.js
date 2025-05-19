// script.js

// Firebase Firestore references
const db = firebase.firestore();

// Populate Stock Balance Table
async function loadStockBalance() {
  const stockInSnap = await db.collection("stock_in").get();
  const stockOutSnap = await db.collection("stock_out").get();

  const balance = {};

  stockInSnap.forEach(doc => {
    const data = doc.data();
    const desc = data.description;
    const qty = parseInt(data.quantity);

    if (!balance[desc]) balance[desc] = { in: 0, out: 0 };
    balance[desc].in += qty;
  });

  stockOutSnap.forEach(doc => {
    const data = doc.data();
    const desc = data.description;
    const qty = parseInt(data.quantity);

    if (!balance[desc]) balance[desc] = { in: 0, out: 0 };
    balance[desc].out += qty;
  });

  const tableBody = document.querySelector("#stockBalanceTable tbody");
  tableBody.innerHTML = "";

  for (const desc in balance) {
    const row = document.createElement("tr");
    const currentBalance = balance[desc].in - balance[desc].out;

    row.innerHTML = `
      <td>${desc}</td>
      <td>${currentBalance}</td>
    `;
    tableBody.appendChild(row);
  }
}

// Load Monthly Report with Item Descriptions
async function loadMonthlyReport() {
  const stockInSnap = await db.collection("stock_in").get();
  const stockOutSnap = await db.collection("stock_out").get();

  const report = {};

  stockInSnap.forEach(doc => {
    const data = doc.data();
    const date = new Date(data.date);
    const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const desc = data.description;
    const qty = parseInt(data.quantity);

    if (!report[month]) report[month] = {};
    if (!report[month][desc]) report[month][desc] = { in: 0, out: 0 };

    report[month][desc].in += qty;
  });

  stockOutSnap.forEach(doc => {
    const data = doc.data();
    const date = new Date(data.date);
    const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const desc = data.description;
    const qty = parseInt(data.quantity);

    if (!report[month]) report[month] = {};
    if (!report[month][desc]) report[month][desc] = { in: 0, out: 0 };

    report[month][desc].out += qty;
  });

  const tableBody = document.querySelector("#dashboardTable tbody");
  tableBody.innerHTML = "";

  for (const month in report) {
    for (const desc in report[month]) {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${month}</td>
        <td>${desc}</td>
        <td>${report[month][desc].in}</td>
        <td>${report[month][desc].out}</td>
      `;
      tableBody.appendChild(row);
    }
  }
}

// PDF Export for Dashboard
document.getElementById("exportPdfBtn").addEventListener("click", function () {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.text("Monthly Stock Summary Report", 14, 14);
  const table = document.getElementById("dashboardTable");

  let y = 30;

  doc.setFontSize(10);
  doc.text("Month", 14, y);
  doc.text("Item Description", 50, y);
  doc.text("Stock In", 130, y);
  doc.text("Stock Out", 160, y);
  y += 10;

  for (let i = 1; i < table.rows.length; i++) {
    const row = table.rows[i];
    const month = row.cells[0].innerText;
    const desc = row.cells[1].innerText;
    const inQty = row.cells[2].innerText;
    const outQty = row.cells[3].innerText;

    doc.text(month, 14, y);
    doc.text(desc, 50, y);
    doc.text(inQty, 130, y);
    doc.text(outQty, 160, y);
    y += 10;

    if (y > 280) {
      doc.addPage();
      y = 30;
    }
  }

  doc.save("Monthly_Stock_Summary.pdf");
});

// Run the dashboard functions if present
document.addEventListener("DOMContentLoaded", () => {
  if (document.querySelector("#stockBalanceTable")) {
    loadStockBalance();
  }
  if (document.querySelector("#dashboardTable")) {
    loadMonthlyReport();
  }
});
