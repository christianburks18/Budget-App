
const STORAGE_KEY = 'budgetAppData';
let appData = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {
  paycheckAmount: 0,
  payday: '',
  lastPaycheck: '',
  fixedCosts: 0,
  transactions: []
};

const savingsStatus = document.getElementById('savings-status');
const addPurchaseBtn = document.getElementById('add-purchase-btn');
const tabCategoryBtn = document.getElementById('tab-category-btn');
const tabWeekBtn = document.getElementById('tab-week-btn');
const categoryTab = document.getElementById('category-tab');
const weekTab = document.getElementById('week-tab');
const inputIncome = document.getElementById('input-income');
const saveIncomeBtn = document.getElementById('save-income-btn');
const paycheckAmountInput = document.getElementById('paycheck-amount');
const paydayInput = document.getElementById('payday');
const lastPaycheckInput = document.getElementById('last-paycheck');
const fixedCostsInput = document.getElementById('fixed-costs');

// Helpers
function saveData() { localStorage.setItem(STORAGE_KEY, JSON.stringify(appData)); }

function calculateIncomeThisMonth() {
  if(!appData.paycheckAmount || !appData.lastPaycheck || !appData.payday) return 0;
  let now = new Date();
  let firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  let lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  let lastPay = new Date(appData.lastPaycheck);
  let weeks = 0;
  while(lastPay <= lastDay){
    if(lastPay >= firstDay) weeks++;
    lastPay.setDate(lastPay.getDate() + 14);
  }
  return weeks * appData.paycheckAmount;
}

function calculateSavings() {
  let spending = appData.transactions.reduce((sum,t)=>sum+t.amount,0);
  let projectedSavings = calculateIncomeThisMonth() - appData.fixedCosts - spending;
  return projectedSavings >= 0 ? projectedSavings : 0;
}

function updateSavingsUI() {
  savingsStatus.textContent = `You're on track to save $${calculateSavings()} this month`;
}

function renderCategoryTab() {
  categoryTab.innerHTML = '';
  let summary = {};
  appData.transactions.forEach(t => {
    summary[t.category] = summary[t.category] || [];
    summary[t.category].push(t);
  });
  for(let cat in summary){
    let catDiv = document.createElement('div');
    let title = document.createElement('h3');
    title.textContent = cat;
    catDiv.appendChild(title);
    summary[cat].forEach(p=>{
      let pDiv = document.createElement('div');
      pDiv.textContent = `$${p.amount} - ${p.merchant} (${p.date})`;
      catDiv.appendChild(pDiv);
    });
    categoryTab.appendChild(catDiv);
  }
}

function renderWeekTab() {
  weekTab.innerHTML = '';
  let weeks = {};
  appData.transactions.forEach(t => {
    let d = new Date(t.date);
    let weekStart = new Date(d);
    weekStart.setDate(d.getDate() - d.getDay()); // Sunday start
    let key = weekStart.toISOString().slice(0,10);
    weeks[key] = weeks[key] || [];
    weeks[key].push(t);
  });
  for(let wk in weeks){
    let wkDiv = document.createElement('div');
    let title = document.createElement('h3');
    title.textContent = `Week of ${wk}`;
    wkDiv.appendChild(title);
    weeks[wk].forEach(p=>{
      let pDiv = document.createElement('div');
      pDiv.textContent = `$${p.amount} - ${p.merchant} (${p.category})`;
      wkDiv.appendChild(pDiv);
    });
    weekTab.appendChild(wkDiv);
  }
}

// Tab buttons
tabCategoryBtn.addEventListener('click',()=>{
  categoryTab.style.display='block';
  weekTab.style.display='none';
});
tabWeekBtn.addEventListener('click',()=>{
  weekTab.style.display='block';
  categoryTab.style.display='none';
});

// Add Purchase
addPurchaseBtn.addEventListener('click',()=>{
  let amount = parseFloat(prompt('Enter amount:'));
  if(isNaN(amount)) return;
  let merchant = prompt('Enter merchant:') || 'Unknown';
  let category = prompt('Enter category:') || 'Misc';
  let date = prompt('Enter date (YYYY-MM-DD)') || new Date().toISOString().slice(0,10);
  appData.transactions.push({amount, merchant, category, date});
  saveData();
  updateSavingsUI();
  renderCategoryTab();
  renderWeekTab();
});

// Income setup
saveIncomeBtn.addEventListener('click',()=>{
  let amt = parseFloat(paycheckAmountInput.value);
  if(isNaN(amt)) return alert('Enter valid paycheck amount');
  appData.paycheckAmount = amt;
  appData.payday = paydayInput.value;
  appData.lastPaycheck = lastPaycheckInput.value;
  appData.fixedCosts = parseFloat(fixedCostsInput.value)||0;
  saveData();
  inputIncome.style.display='none';
  updateSavingsUI();
  renderCategoryTab();
  renderWeekTab();
});

// Initial UI
if(!appData.paycheckAmount) inputIncome.style.display='block';
else {
  inputIncome.style.display='none';
  updateSavingsUI();
  renderCategoryTab();
  renderWeekTab();
}
