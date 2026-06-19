/** @type {import('tailwindcss').Config} */
const config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}", // <-- Dòng này bắt buộc phải có
    ],
    theme: {
        extend: {},
    },
    plugins: [],
};
export default config;