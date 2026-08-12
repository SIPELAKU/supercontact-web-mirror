import { ImageResponse } from 'next/og';

export const runtime = 'edge';

// A square, icon-only version of the brand mark used in the OG image
// generator (app/api/og). Exists because schema.org's Logo requirement
// needs a square image (>=112x112px) and the only existing brand asset
// (sc-logo-primary.svg) is a wide wordmark that can't be cropped square
// without cutting off text.
export async function GET() {
    return new ImageResponse(
        (
            <div
                style={{
                    height: '100%',
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #597CFF 0%, #7692FF 100%)',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '70%',
                        height: '70%',
                        borderRadius: '22%',
                        background: 'rgba(255,255,255,0.18)',
                        color: 'white',
                        fontSize: '260px',
                        fontWeight: 800,
                        fontFamily: 'sans-serif',
                    }}
                >
                    S
                </div>
            </div>
        ),
        {
            width: 512,
            height: 512,
        }
    );
}
