let purchases = JSON.parse(localStorage.getItem('purchases') || '[]');

const categorySelect = document.getElementById('category');
const subInput = document.getElementById('subcategory');
const searchInput = document.getElementById('searchInput');

categorySelect.addEventListener('change', () => {
  subInput.style.display = (categorySelect.value === 'Bills' || categorySelect.value === 'Leisure') ? 'block' : 'none';
});

function addPurchase() {
  const amount = document.getElementById('amount').value;
  const merchant = document.getElementById('merchant').value;
  const category = categorySelect.value;
  const sub = subInput.value;
  const date = document.getElementById('today').checked ? new Date().toISOString().slice(0,10) : document.getElementById('date').value;

  if (!amount || !merchant || !category) return alert('Missing fields');

  purchases.push({ amount: Number(amount), merchant, category, sub, date });
  localStorage.setItem('purchases', JSON.stringify(purchases));
  render();
}

function render(filter="") {
  const list = document.getElementById('list');
  list.innerHTML = "";
  purchases
    .filter(p => p.merchant.toLowerCase().includes(filter) || (p.sub||"").toLowerCase().includes(filter))
    .forEach(p => {
      const div = document.createElement('div');
      div.className = 'item';
      div.textContent = `${p.date} • ${p.category} • ${p.merchant} $${p.amount}`;
      list.appendChild(div);
    });
}

searchInput.addEventListener('input', e => render(e.target.value.toLowerCase()));

render();
