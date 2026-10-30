

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
let data = []
let assumption = "";
let inputQ = "";
let mainPicker;


/* ── Helpers ────────────────────────────────────────────────────────────── */
function getDay(date) {
    return parseInt(date.split("-")[2]);
}
function getMonthStr(date) {
    let month = parseInt(date.split("-")[1]);
    return MONTHS[month - 1];
}
function getYear(date) {
    return parseInt(date.split("-")[0]);
}


/* ── JSON ───────────────────────────────────────────────────────────────── */
async function loadJSON() {
    try {
        const response = await fetch("/api/data");
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error("Error loading data:", error);
        return [];
    }
}

async function saveJSON(newData) {
    try {
        const response = await fetch("/api/data", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newData)
        });
        // fetch only throws on network errors, so check the status yourself
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        data = newData;
        return true;
    } catch (error) {
        console.error("Error saving data:", error);
        return false;
    }
}


/* ── Render Table ───────────────────────────────────────────────────────── */
function renderRecentHistory(events) {
    renderDataTable("recent-history", events.slice(-6));
}

function renderHistoryPage(events) {
    renderDataTable("history-list", [...events].reverse());
}

function renderDataTable(container, events) {
    const div = document.getElementById(container);

    const rows = events.map(item => {
        const month = getMonthStr(item.date);
        const day = getDay(item.date);
        const diff = item.difference ?? "N/A";
        return `
            <tr data-id="${item.id}">
                <td>${month}</td>
                <td>${day}</td>
                <td>${diff}</td>
            </tr>`;
    }).join("");

    div.innerHTML = `
    <table class="data-table">
        <thead>
            <tr>
                <th>Month</th>
                <th>Day</th>
                <th>Difference</th>
            </tr>
        </thead>
        <tbody>${rows}</tbody>
    </table>
    <div style="margin-bottom: 60px;"></div>
    `;
    
}


/* ── Delete modal ───────────────────────────────────────────────────────── */
let pendingDeleteId = null;

function confirmDelete(id) {
    const item = data.find(d => d.id === id);
    if (!item) return;
    pendingDeleteId = id;
    document.getElementById('modal-message').textContent =
        `Delete ${toDisplay(item.date)}?`;          // toDisplay is in mini_calendar.js
    document.getElementById('confirm-modal').style.display = 'flex';
}

function closeModal() {
    pendingDeleteId = null;
    document.getElementById('confirm-modal').style.display = 'none';
}

async function confirmAction() {
    if (pendingDeleteId === null) return;

    const remaining = data.filter(d => d.id !== pendingDeleteId);

    // "difference" depends on the previous entry, so recompute it
    const updated = remaining.map((item, i) => ({
        ...item,
        difference: i === 0 ? "N/A" : calculateDifference(remaining[i - 1].date, item.date),
    }));

    const saved = await saveJSON(updated);   // sets data = updated on success
    closeModal();

    if (saved) {
        renderRecentHistory(data);
        if (document.getElementById('history-page').style.display !== 'none') {
            renderHistoryPage(data);
        }
    }
}

// one listener, works for both tables and survives re-renders
document.addEventListener('click', e => {
    const row = e.target.closest('.data-table tbody tr');
    if (row) confirmDelete(Number(row.dataset.id));
});


/* ── Page switching ─────────────────────────────────────────────────────── */
function showPage(name) {
    const isHistory = name === 'history';
    document.getElementById('main-page').style.display = isHistory ? 'none' : '';
    document.getElementById('history-page').style.display = isHistory ? '' : 'none';
    document.getElementById('nav-btn').textContent = isHistory ? 'Back' : 'History';
    if (isHistory) renderHistoryPage(data);   // re-render so new entries show up
}

function toggleHistory() {
    const onHistory = document.getElementById('history-page').style.display !== 'none';
    showPage(onHistory ? 'main' : 'history');
}


/* ── Render Pages ───────────────────────────────────────────────────────── */
function renderMainPage() {
    renderRecentHistory(data);
    const div_head = document.getElementById("add-container");

    div_head.innerHTML = `
    <h3>Add a date</h3>
    <div class="input-wrap" id="input-wrap">
        <input type="text" id="inputF" class="plain-input" readonly>
        <img src="media/calendar_11.png" class="cal-icon" alt="" aria-hidden="true">
    </div>
    <button class="add-btn" id="add-btn" onclick="onAddClick()">Add</button>
    `;
}


function attachEvents() {

}


/* ── Main Page ──────────────────────────────────────────────────────────── */
async function onAddClick() {
    const date = mainPicker.value;
    if (!date) return;
    let newDataPoint = {};
    if (!data.at(-1)) {
        newDataPoint = {"id": 1, "date": date, "difference": "N/A"};
    } else {
        const prevDataPoint = data.at(-1)
        newDataPoint = {"id": prevDataPoint.id + 1, "date": date, "difference": calculateDifference(prevDataPoint.date, date)}; 
    }
    data.push(newDataPoint);
    const saved = await saveJSON(data);
    if (saved) {renderRecentHistory(data); mainPicker.clear();}

}

function calculateDifference(d1, d2) {
    const dt1 = new Date(d1); // Older
    const dt2 = new Date(d2); // Newer
    const diffMs = dt2 - dt1;
    const diffD = diffMs / (1000 * 60 * 60 * 24);
    return diffD
}


/* ── History Page ───────────────────────────────────────────────────────── */



/* ── Main ───────────────────────────────────────────────────────────────── */
document.documentElement.setAttribute('data-theme', 'light');
(async () => {
    data = await loadJSON();
    renderMainPage();
    mainPicker = createPicker({
        wrapId: 'input-wrap',
        dropdownId: 'picker-dropdown',
        inputId: 'inputF',
        allowPast: true,
    });
})();
