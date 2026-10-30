
function applyTheme() {
    const isDark = localStorage.getItem('theme') === 'dark';
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.textContent = isDark ? 'Light' : 'Dark';
    });
}

function toggleTheme() {
    const isDark = localStorage.getItem('theme') === 'dark';
    const newTheme = isDark ? 'light' : 'dark';
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.textContent = newTheme === 'dark' ? 'Light' : 'Dark';
    });
}

applyTheme();
