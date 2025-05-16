// script.js

// Firebase Firestore
const db = firebase.firestore();

// Helper: Add record to collection
async function addRecord(collection, data) {
  try {
    await db.collection(collection).add(data);
    alert("Data added successfully!");
    return true;
  } catch (error) {
    console.error("Error adding data:", error);
    alert("Failed to add data.");
    return false;
  }
}

// Helper: Load records to table
async function loadRecords(collection, tableId) {
  const tableBody = document.getElementById(tableId);
  tableBody.innerHTML = ""; // Clear table
  try {
    const snapshot = await db.collection(collection).get();
    snapshot.forEach((doc) => {
      const data = doc.data();
      const row = `<tr><td>${data.date}</td><td>${data.item}</td><td>${data.quantity}</td></tr>`;
      tableBody.innerHTML += row;
    });
  } catch (error) {
    console.error("Error loading records:", error);
  }
}

// Add stock in
async function submitStockIn() {
  const date = document.getElementById("stockInDate").value;
  const item = document.getElementById("stockInItem").value;
  const quantity = parseInt(document.getElementById("stockInQuantity").value);
  if (!date || !item || !quantity) return alert("Fill all fields");

  const success = await addRecord("stock_in", { date, item, quantity });
  if (success) {
    document.getElementById("stockInForm").reset();
    loadRecords("stock_in", "stockInTableBody");
  }
}

// Add stock out
async function submitStockOut() {
  const date = document.getElementById("stockOutDate").value;
  const item = document.getElementById("stockOutItem").value;
  const quantity = parseInt(document.getElementById("stockOutQuantity").value);
  if (!date || !item || !quantity) return alert("Fill all fields");

  const success = await addRecord("stock_out", { date, item, quantity });
  if (success) {
    document.getElementById("stockOutForm").reset();
    loadRecords("stock_out", "stockOutTableBody");
  }
}

// Add purchase
async function submitPurchase() {
  const date = document.getElementById("purchaseDate").value;
  const item = document.getElementById("purchaseItem").value;
  const quantity = parseInt(document.getElementById("purchaseQuantity").value);
  if (!date || !item || !quantity) return alert("Fill all fields");

  const success = await addRecord("purchases", { date, item, quantity });
  if (success) {
    // Auto-inject into stock_in
    await addRecord("stock_in", { date, item, quantity });
    document.getElementById("purchaseForm").reset();
    loadRecords("purchases", "purchasesTableBody");
  }
}

// Load stock balances
async function loadStockBalances() {
  document.getElementById("balanceTableBody").innerHTML = "Loading...";
  const stockInMap = {};
  const stockOutMap = {};

  const inSnap = await db.collection("stock_in").get();
  inSnap.forEach((doc) => {
    const { item, quantity } = doc.data();
    stockInMap[item] = (stockInMap[item] || 0) + quantity;
  });

  const outSnap = await db.collection("stock_out").get();
  outSnap.forEach((doc) => {
    const { item, quantity } = doc.data();
    stockOutMap[item] = (stockOutMap[item] || 0) + quantity;
  });

  const allItems = new Set([...Object.keys(stockInMap), ...Object.keys(stockOutMap)]);
  const tableBody = document.getElementById("balanceTableBody");
  tableBody.innerHTML = "";

  allItems.forEach((item) => {
    const inQty = stockInMap[item] || 0;
    const outQty = stockOutMap[item] || 0;
    const balance = inQty - outQty;
    const row = `<tr><td>${item}</td><td>${balance}</td></tr>`;
    tableBody.innerHTML += row;
  });
}

// Load dashboard
async function loadDashboard() {
  document.getElementById("dashboardData").innerText = "Loading dashboard data...";
  let totalIn = 0, totalOut = 0, totalPurchase = 0;

  const inSnap = await db.collection("stock_in").get();
  inSnap.forEach((doc) => totalIn += doc.data().quantity);

  const outSnap = await db.collection("stock_out").get();
  outSnap.forEach((doc) => totalOut += doc.data().quantity);

  const purSnap = await db.collection("purchases").get();
  purSnap.forEach((doc) => totalPurchase += doc.data().quantity);

  document.getElementById("dashboardData").innerHTML = `
    <ul>
      <li>Total Stock In: ${totalIn}</li>
      <li>Total Stock Out: ${totalOut}</li>
      <li>Total Purchases: ${totalPurchase}</li>
      <li>Net Stock: ${totalIn + totalPurchase - totalOut}</li>
    </ul>
  `;
}

// Optional: Export to PDF (basic print for now)
function exportToPDF() {
  window.print(); // you can improve with jsPDF or html2pdf later
}
