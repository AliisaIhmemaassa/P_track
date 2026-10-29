

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


/* ── Render Pages ───────────────────────────────────────────────────────── */
function renderMainPage() {
    renderRecentHistory(data);
    const div_head = document.getElementById("add-container");

    div_head.innerHTML = `
    <h3>Add a date</h3>
    <input type="text" id="inputF" class="plain-input" readonly>
    <img src="media/calendar_11.png" class="cal-icon" alt="" aria-hidden="true">
    <button class="add-btn" id="add-btn" onclick="onAddClick()">Add</button>
    `;
}


function attachEvents() {
    const input = document.getElementById('input-event');
    if (input) input.addEventListener('keydown', e => {
    if (e.key === 'Enter'){
        e.preventDefault();
        onAddClick();
    }
    });
    if (input) input.addEventListener('input', e=> {
        inputQ = e.target.value;
        renderDatePrediction();
    });
}


async function onAddClick() {
    const date = mainPicker.value;
    let newDataPoint = {};
    if (!data.at(-1)) {
        newDataPoint = {"id": 1, "date": date, "difference": "N/A"};
    } else {
        const prevDataPoint = data.at(-1)
        newDataPoint = {"id": prevDataPoint.id + 1, "date": date, "difference": calculateDifference(prevDataPoint.date, date)}; 
    }
    data.push(newDataPoint);
    const saved = await saveJSON(data);
}

function calculateDifference(d1, d2) {
    const dt1 = new Date(d1); // Older
    const dt2 = new Date(d2); // Newer
    const diffMs = dt2 - dt1;
    const diffD = diffMs / (1000 * 60 * 60 * 24);
    return diffD
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
            <tr>
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
    `;
}


/*── JSON ───────────────────────────────────────────────────────────────────*/
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


/*── History List ───────────────────────────────────────────────────────────*/






/*── Main ───────────────────────────────────────────────────────────────────*/
(async () => {
    data = await loadJSON();
    renderMainPage();
    mainPicker = createPicker({
        wrapId: 'add-container',
        dropdownId: 'picker-dropdown',
        inputId: 'inputF',
        allowPast: true,
    });
})();
