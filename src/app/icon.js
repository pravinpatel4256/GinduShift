import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const size = {
    width: 512,
    height: 512,
}
export const contentType = 'image/png'

export default function Icon() {
    return new ImageResponse(
        (
            <div
                style={{
                    fontSize: 128,
                    background: '#6366f1',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    borderRadius: 96,
                    fontWeight: 800,
                }}
            >
                Gindu
            </div>
        ),
        {
            ...size,
        }
    )
}
