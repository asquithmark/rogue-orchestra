tailwind.config = {
    darkMode: 'class', // Enable dark mode using a class on the <html> element
    theme: {
        extend: {
            fontFamily: {
                sans: ['Quicksand', 'sans-serif'], // Set Quicksand as default sans-serif
            },
            colors: {
                teal: {
                    // Based on mockup's use of teal-700 for play button
                    // Values from standard Tailwind palette for teal
                    '50': '#f0fdfa',
                    '100': '#ccfbf1',
                    '200': '#99f6e4',
                    '300': '#5eead4',
                    '400': '#2dd4bf',
                    '500': '#14b8a6',
                    '600': '#0d9488',
                    '700': '#0f766e', // Used in mockup for play button bg
                    '800': '#115e59',
                    '900': '#134e4a',
                    '950': '#042f2e',
                }
            }
        }
    },
    plugins: []
}
