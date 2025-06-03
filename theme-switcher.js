document.addEventListener('DOMContentLoaded', () => {
    const themeSwitcherBtn = document.getElementById('themeSwitcherBtn');
    const body = document.body;
    const html = document.documentElement; // Needed for Tailwind's dark mode
    const icon = themeSwitcherBtn.querySelector('i');

    const applyTheme = (theme) => {
        if (theme === 'light') {
            html.classList.remove('dark');
            body.classList.add('light-mode');
            if (icon) { // Ensure icon exists
                icon.classList.remove('fa-sun');
                icon.classList.add('fa-moon');
            }
        } else {
            html.classList.add('dark');
            body.classList.remove('light-mode');
            if (icon) { // Ensure icon exists
                icon.classList.remove('fa-moon');
                icon.classList.add('fa-sun');
            }
        }
    };

    if (themeSwitcherBtn) { // Ensure button exists
        themeSwitcherBtn.addEventListener('click', () => {
            const isLightMode = body.classList.contains('light-mode');
            if (isLightMode) {
                localStorage.setItem('theme', 'dark');
                applyTheme('dark');
            } else {
                localStorage.setItem('theme', 'light');
                applyTheme('light');
            }
        });
    }

    // Load saved theme from localStorage
    const savedTheme = localStorage.getItem('theme') || 'dark'; // Default to dark
    applyTheme(savedTheme);
});
