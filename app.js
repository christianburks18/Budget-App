
let purchases = JSON.parse(localStorage.getItem('purchases') || '[]');
let income = Number(localStorage.getItem('income') || 0);

const modal = document.getElementById('modal');
const catSelect = document.getElementById('category');
const subInput = document.getElementById('subcategory');
const searchBar = document.getElementById('searchBar');
const searchInput = document.getElementById('searchInput');

document.getElementById('addBtn').onclick = () => modal.classList.remove('hidden');
document.getElementById('searchBtn').onclick = () => searchBar.classList.toggle('hidden');
document.getElementById('settingsBtn').onclick = () => {
  const val = prompt("Enter monthly income:", income);
  if (val !== null) {
    income = Number(val);
    localStorage.setItem('income', income);
    render();
  }
};

catSelect.onchange = () => {
  subInput.classList.toggle('hidden', !(catSelect.value === 'Bills' || catSelect.value === 'Leisure'));
};

function closeModal() {
  modal.classList.add('hidden');
}

function addPurchase() {
  const amt = Number(amount.value);
  const merch = merchant.value;
  const cat = catSelect.value;
  const sub = subInput.value;
  const date = today.checked ? new Date().toISOString().slice(0,10) : dateInput.value;

  if (!amt || !merch || !cat) return alert("Missing fields");

  purchases.push({ amt, merch, cat, sub, date });
  localStorage.setItem('purchases', JSON.stringify(purchases));
  closeModal();
  render();
}

function render(filter="") {
  const list = document.getElementById('list');
  list.innerHTML = "";
  let spent = 0;

  purchases.filter(p =>
    p.merch.toLowerCase().includes(filter) ||
    (p.sub || "").toLowerCase().includes(filter)
  ).forEach(p => {
    spent += p.amt;
    const div = document.createElement('div');
    div.className = 'row';
    div.textContent = `${p.cat} • ${p.merch} • $${p.amt}`;
    list.appendChild(div);
  });

  document.getElementById('spent').textContent = "-$" + spent;
  document.getElementById('income').textContent = "$" + income;
  document.getElementById('saved').textContent = "$" + (income - spent);
}

searchInput.oninput = e => render(e.target.value.toLowerCase());
render();
