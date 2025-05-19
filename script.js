import { db } from './firebase.js';
import { collection, getDocs } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js';

const dashboardBody = document.getElementById('dashboard-body');
const exportBtn = document.getElementById('export-pdf');

async function loadDashboard() {
  const stockInSnap = await getDocs(collection(db, 'stock_in'));
  const stockOutSnap = await getDocs(collection(db, 'stock_out'));

  const summary = {};

  // Process Stock In
  stockInSnap.forEach(doc => {
    const data = doc.data();
    const month = data.date.toDate().toISOString().slice(0, 7);
    const desc = data.item;
    const key = `${month}_${desc}`;
    if (!summary[key]) summary[key] = { item: desc, month, stockIn: 0, stockOut: 0 };
    summary[key].stockIn += Number(data.quantity);
  });

  // Process Stock Out
  stockOutSnap.forEach(doc => {
    const data = doc.data();
    const month = data.date.toDate().toISOString().slice(0, 7);
    const desc = data.item;
    const key = `${month}_${desc}`;
    if (!summary[key]) summary[key] = { item: desc, month, stockIn: 0, stockOut: 0 };
    summary[key].stockOut += Number(data.quantity);
  });

  dashboardBody.innerHTML = '';
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

if (dashboardBody) loadDashboard();
if (exportBtn) exportBtn.addEventListener('click', exportToPDF);
