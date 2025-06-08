document.addEventListener('DOMContentLoaded', () => {
    const themeSwitcherBtn = document.getElementById('themeSwitcherBtn');
    const body = document.body;

    const applyTheme = (theme) => {
        if (theme === 'light') {
            body.classList.add('light-mode');
        } else {
            body.classList.remove('light-mode');
        }
    };

    if (themeSwitcherBtn) {
        themeSwitcherBtn.addEventListener('click', () => {
            const isLightMode = body.classList.contains('light-mode');
            const newTheme = isLightMode ? 'dark' : 'light';
            localStorage.setItem('theme', newTheme);
            applyTheme(newTheme);
        });
    }

    const savedTheme = localStorage.getItem('theme') || 'dark';
    applyTheme(savedTheme);
});
