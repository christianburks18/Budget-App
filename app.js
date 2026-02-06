
// Local storage keys
const STORAGE_KEY = 'budgetAppData';

// App data
let appData = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {
  income: 0,
  fixedCosts: 0,
  transactions: []
};

// Elements
const savingsStatus = document.getElementById('savings-status');
const categorySummary = document.getElementById('category-summary');
const addPurchaseBtn = document.getElementById('add-purchase-btn');
const uploadCsvBtn = document.getElementById('upload-csv-btn');
const csvUpload = document.getElementById('csv-upload');

// Simple category rules
const defaultCategories = ['Dining', 'Groceries', 'Transport', 'Entertainment', 'Misc'];

// Helpers
function calculateSavings() {
  let spending = appData.transactions.reduce((sum, t) => sum + t.amount, 0);
  let projectedSavings = appData.income - appData.fixedCosts - spending;
  return projectedSavings >= 0 ? projectedSavings : 0;
}

function updateUI() {
  savingsStatus.textContent = `You're on track to save $${calculateSavings()} this month`;
  
  // Category summary
  let summary = {};
  appData.transactions.forEach(t => {
    summary[t.category] = (summary[t.category] || 0) + t.amount;
  });
  categorySummary.innerHTML = '';
  for (let cat in summary) {
    let div = document.createElement('div');
    div.textContent = `${cat}: $${summary[cat]}`;
    categorySummary.appendChild(div);
  }
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
}

// Add Purchase
addPurchaseBtn.addEventListener('click', () => {
  let amount = parseFloat(prompt('Enter amount:'));
  if (isNaN(amount)) return;
  let merchant = prompt('Enter merchant:') || 'Unknown';
  let category = prompt(`Enter category (${defaultCategories.join(', ')}):`) || 'Misc';
  appData.transactions.push({amount, merchant, category});
  saveData();
  updateUI();
});

// CSV Upload
uploadCsvBtn.addEventListener('click', () => csvUpload.click());
csvUpload.addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(event) {
    const lines = event.target.result.split('\n');
    lines.forEach(line => {
      const parts = line.split(',');
      if (parts.length >= 3) {
        const amount = parseFloat(parts[0]);
        const merchant = parts[1];
        const category = parts[2];
        if (!isNaN(amount)) appData.transactions.push({amount, merchant, category});
      }
    });
    saveData();
    updateUI();
  };
  reader.readAsText(file);
});

// Initial UI update
updateUI();
