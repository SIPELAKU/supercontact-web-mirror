import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

const MAX_TITLE_LENGTH = 90;
const MAX_CATEGORY_LENGTH = 40;

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);

    const title = (searchParams.get('title') || 'SmartSales').slice(0, MAX_TITLE_LENGTH);
    const category = (searchParams.get('category') || '').slice(0, MAX_CATEGORY_LENGTH);

    return new ImageResponse(
        (
            <div
                style={{
                    height: '100%',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: '72px',
                    background: 'linear-gradient(135deg, #597CFF 0%, #7692FF 100%)',
                    fontFamily: 'sans-serif',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '56px',
                            height: '56px',
                            borderRadius: '16px',
                            background: 'rgba(255,255,255,0.18)',
                            color: 'white',
                            fontSize: '30px',
                            fontWeight: 800,
                        }}
                    >
                        S
                    </div>
                    <div style={{ display: 'flex', color: 'white', fontSize: '30px', fontWeight: 800 }}>
                        SmartSales
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {category ? (
                        <div
                            style={{
                                display: 'flex',
                                alignSelf: 'flex-start',
                                color: 'white',
                                background: 'rgba(255,255,255,0.18)',
                                borderRadius: '999px',
                                padding: '8px 22px',
                                fontSize: '24px',
                                fontWeight: 700,
                                letterSpacing: '1px',
                            }}
                        >
                            {category.toUpperCase()}
                        </div>
                    ) : null}
                    <div
                        style={{
                            display: 'flex',
                            color: 'white',
                            fontSize: title.length > 55 ? '52px' : '64px',
                            fontWeight: 800,
                            lineHeight: 1.15,
                            maxWidth: '980px',
                        }}
                    >
                        {title}
                    </div>
                </div>

                <div style={{ display: 'flex', color: 'rgba(255,255,255,0.85)', fontSize: '26px', fontWeight: 600 }}>
                    smartsales.id
                </div>
            </div>
        ),
        {
            width: 1200,
            height: 630,
        }
    );
}
