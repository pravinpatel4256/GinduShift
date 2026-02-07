export default function manifest() {
    return {
        name: 'GinduShift Pharmacy Portal',
        short_name: 'GinduShift',
        description: 'Connect pharmacy owners with licensed pharmacists for shifts.',
        start_url: '/',
        display: 'standalone',
        background_color: '#0f172a',
        theme_color: '#6366f1',
        orientation: 'portrait',
        icons: [
            {
                src: '/icon',
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: '/icon',
                sizes: '512x512',
                type: 'image/png',
            },
        ],
    }
}
