import { db } from './firebase.js';
import { collection, getDocs } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js';

const dashboardBody = document.getElementById('dashboard-body');
const exportBtn = document.getElementById('export-pdf');

async function loadDashboard() {
  try {
    const stockInSnap = await getDocs(collection(db, 'stock_in'));
    const stockOutSnap = await getDocs(collection(db, 'stock_out'));

    const summary = {};

    // Accumulate stock in
    stockInSnap.forEach(doc => {
      const data = doc.data();
      const month = data.date.toDate().toISOString().slice(0, 7);
      const desc = data.item;
      const key = `${month}_${desc}`;
      if (!summary[key]) summary[key] = { item: desc, month, stockIn: 0, stockOut: 0 };
      summary[key].stockIn += Number(data.quantity);
    });

    // Accumulate stock out
    stockOutSnap.forEach(doc => {
      const data = doc.data();
      const month = data.date.toDate().toISOString().slice(0, 7);
      const desc = data.item;
      const key = `${month}_${desc}`;
      if (!summary[key]) summary[key] = { item: desc, month, stockIn: 0, stockOut: 0 };
      summary[key].stockOut += Number(data.quantity);
    });

    // Clear existing table rows
    dashboardBody.innerHTML = '';

    // Populate table rows
    Object.values(summary).forEach(entry => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${entry.month}</td>
        <td>${entry.item}</td>
        <td>${entry.stockIn}</td>
        <td>${entry.stockOut}</td>
      `;
      dashboardBody.appendChild(row);
    });
  } catch (error) {
    console.error("Error loading dashboard data:", error);
    dashboardBody.innerHTML = `<tr><td colspan="4" style="color:red;">Error loading data. See console for details.</td></tr>`;
  }
}

function exportToPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const rows = [];
  const tableRows = dashboardBody.querySelectorAll('tr');
  tableRows.forEach(tr => {
    const cols = tr.querySelectorAll('td');
    const row = [];
    cols.forEach(td => row.push(td.innerText));
    rows.push(row);
  });

  doc.setFontSize(14);
  doc.text('Monthly Stock Summary', 10, 10);
  doc.autoTable({
    head: [['Month', 'Item Description', 'Total Stock In', 'Total Stock Out']],
    body: rows,
    startY: 20,
  });
  doc.save('dashboard_report.pdf');
}

// Run on page load
if (dashboardBody) loadDashboard();
if (exportBtn) exportBtn.addEventListener('click', exportToPDF);
