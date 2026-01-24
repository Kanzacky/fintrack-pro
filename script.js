// --- State Management ---
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

// --- DOM Elements ---
const balanceEl = document.getElementById('balance');
const incomeEl = document.getElementById('inc-amt');
const expenseEl = document.getElementById('exp-amt');
const listEl = document.getElementById('list');
const formEl = document.getElementById('transaction-form');
const descInput = document.getElementById('desc');
const amountInput = document.getElementById('amount');
const typeInput = document.getElementById('type');

// --- Formatters ---
const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(number);
};

// --- Initialization ---
function init() {
    // Set Tanggal Hari Ini
    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('current-date').innerText = new Date().toLocaleDateString('id-ID', dateOptions);

    updateUI();
    lucide.createIcons(); // Render initial icons
}

// --- Core Functions ---
function updateUI() {
    // 1. Hitung Statistik
    const amounts = transactions.map(t => t.type === 'income' ? Number(t.amount) : Number(t.amount) * -1);
    const total = amounts.reduce((acc, item) => acc + item, 0);
    
    const income = transactions
        .filter(t => t.type === 'income')
        .reduce((acc, t) => acc + Number(t.amount), 0);

    const expense = transactions
        .filter(t => t.type === 'expense')
        .reduce((acc, t) => acc + Number(t.amount), 0);

    // 2. Update Text Statistik
    balanceEl.innerText = formatRupiah(total);
    incomeEl.innerText = formatRupiah(income);
    expenseEl.innerText = formatRupiah(expense);

    // 3. Render List History
    listEl.innerHTML = '';
    transactions.forEach((t, index) => {
        const li = document.createElement('li');
        li.classList.add(t.type === 'income' ? 'inc' : 'exp');
        
        li.innerHTML = `
            <div class="t-info">
                <strong>${t.desc}</strong>
                <br><small class="text-muted">${t.date || 'Hari ini'}</small>
            </div>
            <div class="t-amt">
                <span class="${t.type === 'income' ? 'text-green' : 'text-red'}">
                    ${t.type === 'income' ? '+' : '-'} ${formatRupiah(t.amount)}
                </span>
                <button class="delete-btn" onclick="removeTransaction(${index})">
                    <i data-lucide="trash-2" style="width:16px;"></i>
                </button>
            </div>
        `;
        listEl.appendChild(li);
    });

    // 4. Update Chart
    renderChart(income, expense);

    // 5. Save to LocalStorage
    localStorage.setItem('transactions', JSON.stringify(transactions));
    
    // Re-init icons for dynamic elements
    lucide.createIcons();
}

function addTransaction(e) {
    e.preventDefault();

    if(descInput.value.trim() === '' || amountInput.value.trim() === '') {
        alert('Mohon lengkapi data');
        return;
    }

    const transaction = {
        id: generateID(),
        desc: descInput.value,
        amount: +amountInput.value,
        type: typeInput.value,
        date: new Date().toLocaleDateString('id-ID')
    };

    transactions.push(transaction);
    updateUI();
    
    descInput.value = '';
    amountInput.value = '';
}

function removeTransaction(index) {
    transactions.splice(index, 1);
    updateUI();
}

function clearData() {
    if(confirm("Yakin ingin menghapus semua data?")) {
        transactions = [];
        updateUI();
    }
}

function generateID() {
    return Math.floor(Math.random() * 1000000);
}

// --- Chart.js Configuration ---
let financeChart = null;

function renderChart(income, expense) {
    const ctx = document.getElementById('financeChart').getContext('2d');
    
    // Hancurkan chart lama jika ada agar tidak tumpang tindih
    if (financeChart) {
        financeChart.destroy();
    }

    // Jika data kosong, tampilkan chart kosong atau default
    const dataValues = (income === 0 && expense === 0) ? [1, 0] : [income, expense];
    const bgColors = (income === 0 && expense === 0) 
        ? ['#e2e8f0', '#e2e8f0'] 
        : ['#10b981', '#ef4444'];

    financeChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Pemasukan', 'Pengeluaran'],
            datasets: [{
                data: dataValues,
                backgroundColor: bgColors,
                borderWidth: 2,
                borderColor: '#ffffff',
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        font: { family: 'Inter', size: 12 },
                        usePointStyle: true
                    }
                }
            }
        }
    });
}

// --- Event Listeners ---
formEl.addEventListener('submit', addTransaction);

// Start App
init();