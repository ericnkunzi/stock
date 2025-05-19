# Stock Management Web App

## Overview
This is a simple web application for managing stock in, stock out, purchases, stock balance, and dashboard reporting with PDF export.  
It uses Firebase Firestore as backend for real-time data storage and retrieval. The app is fully client-side and hosted on GitHub Pages.

---

## Features

- Add, update and view Stock In records  
- Add, update and view Stock Out records  
- Add, update and view Purchases (automatically updates Stock In balance)  
- View Stock Balance (calculated as Stock In + Purchases - Stock Out)  
- Dashboard with data analysis and PDF export  
- Responsive and clean UI with navigation between pages  
- Data stored persistently in Firebase Firestore  

---

## Prerequisites

1. Firebase Project (You already have it).  
2. Firestore rules set to allow read/write (your current rules are OK for testing):  
```firebase
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
