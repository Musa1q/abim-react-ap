/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: {
            h1: {
              fontSize: '3.5rem',
              fontWeight: 'bold',
              marginBottom: '1.5rem',
              marginTop: '2.5rem',
              lineHeight: '1.1',
              color: '#1f2937',
            },
            h2: {
              fontSize: '2.5rem',
              fontWeight: 'bold',
              marginBottom: '1rem',
              marginTop: '2rem',
              lineHeight: '1.2',
              color: '#374151',
            },
            h3: {
              fontSize: '2rem',
              fontWeight: 'bold',
              marginBottom: '0.75rem',
              marginTop: '1.5rem',
              lineHeight: '1.3',
              color: '#4b5563',
            },
            h4: {
              fontSize: '1.25rem',
              fontWeight: 'bold',
              marginBottom: '0.5rem',
              marginTop: '1rem',
            },
            h5: {
              fontSize: '1.125rem',
              fontWeight: 'bold',
              marginBottom: '0.5rem',
              marginTop: '1rem',
            },
            h6: {
              fontSize: '1rem',
              fontWeight: 'bold',
              marginBottom: '0.5rem',
              marginTop: '1rem',
            },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
