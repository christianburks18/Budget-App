
// App State
let purchases = JSON.parse(localStorage.getItem('v5_purchases') || '[]');
let settings = JSON.parse(localStorage.getItem('v5_settings') || '{"biweeklyPay": 4000, "payday": "Friday"}');
let currentStep = 0;
let tempPurchase = {};
const steps = ["amount", "merchant", "category", "date"];

// Logic: Calc Monthly Income
function getIncome() {
    // Standard approach: 2 paychecks per month. 
    // Bonus: If it's a 3-payday month, you can toggle this logic.
    return settings.biweeklyPay * 2; 
}

// UI Elements
const list = document.getElementById('purchaseList');
const addSheet = document.getElementById('addSheet');
const overlay = document.getElementById('modalOverlay');

// Tab Switching
document.getElementById('navMonth').onclick = () => {
    toggleView('month');
};
document.getElementById('navTrends').onclick = () => {
    toggleView('trends');
    renderTrends();
};

function toggleView(view) {
    document.getElementById('monthView').classList.toggle('hidden', view !== 'month');
    document.getElementById('trendsView').classList.toggle('hidden', view !== 'trends');
    document.getElementById('navMonth').classList.toggle('active', view === 'month');
    document.getElementById('navTrends').classList.toggle('active', view === 'trends');
}

// Multi-Step Add Purchase
document.getElementById('fab').onclick = () => {
    currentStep = 0;
    tempPurchase = { date: new Date().toISOString().split('T')[0] };
    showStep();
    addSheet.classList.remove('hidden');
    overlay.classList.remove('hidden');
};

function showStep() {
    const container = document.getElementById('stepContainer');
    const title = document.getElementById('stepTitle');
    const step = steps[currentStep];
    title.innerText = step.charAt(0).toUpperCase() + step.slice(1);

    if (step === 'amount') container.innerHTML = `<input type="number" id="stepInput" placeholder="0.00" autofocus>`;
    if (step === 'merchant') container.innerHTML = `<input type="text" id="stepInput" placeholder="e.g. Starbucks">`;
    if (step === 'category') container.innerHTML = `
        <select id="stepInput">
            <option>Food</option><option>Shopping</option><option>Bills</option><option>Groceries</option>
        </select>`;
    if (step === 'date') container.innerHTML = `<input type="date" id="stepInput" value="${tempPurchase.date}">`;

    document.getElementById('prevBtn').classList.toggle('hidden', currentStep === 0);
    document.getElementById('nextBtn').innerText = currentStep === steps.length - 1 ? 'Save' : 'Next';
}

document.getElementById('nextBtn').onclick = () => {
    const val = document.getElementById('stepInput').value;
    if (!val) return alert("Please enter a value");
    tempPurchase[steps[currentStep]] = val;

    if (currentStep < steps.length - 1) {
        currentStep++;
        showStep();
    } else {
        purchases.push({...tempPurchase, id: Date.now()});
        localStorage.setItem('v5_purchases', JSON.stringify(purchases));
        closeModals();
        render();
    }
};

function closeModals() {
    addSheet.classList.add('hidden');
    overlay.classList.add('hidden');
    document.getElementById('settingsPanel').classList.add('hidden');
}

document.getElementById('closeSheet').onclick = closeModals;

// Rendering
function render() {
    const spent = purchases.reduce((s, p) => s + Number(p.amount), 0);
    const income = getIncome();
    const saved = income - spent;

    document.getElementById('totalSpent').innerText = `$${spent.toLocaleString()}`;
    document.getElementById('totalIncome').innerText = `$${income.toLocaleString()}`;
    document.getElementById('totalSaved').innerText = `$${saved.toLocaleString()}`;
    document.getElementById('savingsBanner').innerText = `You're on track to save $${saved.toLocaleString()} this month`;

    list.innerHTML = purchases.map(p => `
        <div class="transaction-item">
            <div>
                <strong>${p.merchant}</strong><br>
                <small style="color:gray">${p.category}</small>
            </div>
            <span style="font-weight:600">$${Number(p.amount).toFixed(2)}</span>
        </div>
    `).reverse().join('');
}

function renderTrends() {
    // 1. Weekly Chart (Simplistic group by date)
    const weeklyData = [350, 420, 280, 510]; // Mock for visual, can be calculated from 'purchases'
    document.getElementById('weeklyChart').innerHTML = weeklyData.map((val, i) => `
        <div class="bar" style="height: ${(val/600)*100}%">
            <span class="bar-val">$${val}</span>
        </div>
    `).join('');

    // 2. Category Progress Bars
    const cats = purchases.reduce((acc, p) => {
        acc[p.category] = (acc[p.category] || 0) + Number(p.amount);
        return acc;
    }, {});

    document.getElementById('categoryChart').innerHTML = Object.entries(cats).map(([name, amt]) => `
        <div class="cat-row">
            <div style="display:flex; justify-content:space-between; font-size:0.8rem">
                <span>${name}</span><span>$${amt}</span>
            </div>
            <div class="progress-bg"><div class="progress-fill" style="width:${(amt/getIncome())*100}%"></div></div>
        </div>
    `).join('');
}

// Initial Load
render();
