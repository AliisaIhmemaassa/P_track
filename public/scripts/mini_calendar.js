// ─── Single-date Picker ───────────────────────────────────────────────────────

function toStr(y, m, d) {
    return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}
function toDateStr(date) {
    return toStr(date.getFullYear(), date.getMonth(), date.getDate());
}
function toDisplay(ds) {
    const [y, m, d] = ds.split('-');
    return `${d}-${m}-${y}`;   // "29-10-2026"
}

function createPicker(config) {
    // config: { wrapId, dropdownId, inputId, allowPast }

    const state = {
        pickerYear: new Date().getFullYear(),
        pickerMonth: new Date().getMonth(),
        value: null,
    };

    const wrap = document.getElementById(config.wrapId);
    const input = document.getElementById(config.inputId);

    const dropdown = document.createElement('div');
    dropdown.className = 'picker-dropdown';
    dropdown.id = config.dropdownId;
    dropdown.innerHTML = `
        <div class="picker-head">
            <button class="picker-nav picker-prev">&#8592;</button>
            <span class="picker-month-label"></span>
            <button class="picker-nav picker-next">&#8594;</button>
        </div>
        <div class="picker-grid">
            <div class="picker-day-label">Ma</div>
            <div class="picker-day-label">Ti</div>
            <div class="picker-day-label">Ke</div>
            <div class="picker-day-label">To</div>
            <div class="picker-day-label">Pe</div>
            <div class="picker-day-label">La</div>
            <div class="picker-day-label">Su</div>
        </div>
        <div class="picker-hint">Valitse päivä</div>
        <div class="picker-btn-container">
            <button class="picker-btn picker-clear-btn">Poista valinta</button>
            <button class="picker-btn picker-confirm-btn">Valmis</button>
        </div>
    `;
    wrap.appendChild(dropdown);

    const monthLabel = dropdown.querySelector('.picker-month-label');
    const grid = dropdown.querySelector('.picker-grid');

    dropdown.querySelector('.picker-prev').addEventListener('click', e => {
        e.stopPropagation();
        if (--state.pickerMonth < 0) { state.pickerMonth = 11; state.pickerYear--; }
        render();
    });
    dropdown.querySelector('.picker-next').addEventListener('click', e => {
        e.stopPropagation();
        if (++state.pickerMonth > 11) { state.pickerMonth = 0; state.pickerYear++; }
        render();
    });
    dropdown.querySelector('.picker-clear-btn').addEventListener('click', e => {
        e.stopPropagation(); clear();
    });
    dropdown.querySelector('.picker-confirm-btn').addEventListener('click', e => {
        e.stopPropagation(); close();
    });

    input.addEventListener('click', open);

    // Note: piles up if createPicker is called repeatedly
    document.addEventListener('click', e => {
        if (!wrap.contains(e.target)) close();
    });

    function open() {
        console.log('open called');
        input.classList.add('picker-input-active');
        const base = state.value ? state.value.split('-').map(Number) : null;
        const now = new Date();
        state.pickerYear = base ? base[0] : now.getFullYear();
        state.pickerMonth = base ? base[1] - 1 : now.getMonth();
        dropdown.classList.add('open');
        render();
    }

    function close() {
        dropdown.classList.remove('open');
        input.classList.remove('picker-input-active');
    }

    function clear() {
        state.value = null;
        input.value = '';
        render();
    }

    function render() {
        monthLabel.textContent = MONTHS[state.pickerMonth] + ' ' + state.pickerYear;

        const labels = grid.querySelectorAll('.picker-day-label');
        grid.innerHTML = '';
        labels.forEach(l => grid.appendChild(l.cloneNode(true)));

        const todayStr = toDateStr(new Date());
        let offset = new Date(state.pickerYear, state.pickerMonth, 1).getDay() - 1;
        if (offset < 0) offset = 6;
        const days = new Date(state.pickerYear, state.pickerMonth + 1, 0).getDate();

        for (let i = 0; i < offset; i++) {
            const el = document.createElement('div');
            el.className = 'picker-day empty';
            grid.appendChild(el);
        }

        for (let d = 1; d <= days; d++) {
            const ds = toStr(state.pickerYear, state.pickerMonth, d);
            const el = document.createElement('button');
            let cls = 'picker-day';
            if (ds === todayStr) cls += ' today';
            if (!config.allowPast && ds < todayStr) cls += ' past';
            if (ds === state.value) cls += ' selected';
            el.className = cls;
            el.textContent = d;
            el.addEventListener('click', e => { e.stopPropagation(); dayClick(ds); });
            grid.appendChild(el);
        }
    }

    function dayClick(ds) {
        if (!config.allowPast && ds < toDateStr(new Date())) return;
        state.value = ds;
        input.value = toDisplay(ds);
        render();
    }

    return {
        get value() { return state.value; },
        set value(v) {
            state.value = v;
            input.value = v ? toDisplay(v) : '';
        },
        open, close, clear,
    };
}