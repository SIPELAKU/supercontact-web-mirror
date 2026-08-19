import React from 'react';

/**
 * Hand-crafted decorative illustrations for the homepage hero slider.
 *
 * Shared art direction:
 * - Stylized mini UI-mockup vignettes (white cards, large radii) on the slider's
 *   #5479EE background — abstract shapes, no literal text.
 * - Palette: brand #5479EE + tints (#EEF2FD, #B9C9F7), emerald #10B981 for
 *   success/WhatsApp, amber #F59E0B sparingly, neutrals gray-100..400.
 * - One soft "shadow" per composition faked with a radial-gradient ellipse
 *   (no SVG filters). All gradient IDs are prefixed per component so every
 *   slide can render at once without DOM ID collisions.
 * - Purely decorative: aria-hidden, the slide copy carries the meaning.
 */

export interface IllustrationProps {
    className?: string;
}

const BRAND = '#5479EE';
const TINT_LIGHT = '#EEF2FD';
const TINT_MID = '#B9C9F7';
const EMERALD = '#10B981';
const AMBER = '#F59E0B';
const GRAY_100 = '#F3F4F6';
const GRAY_200 = '#E5E7EB';
const GRAY_300 = '#D1D5DB';
const GRAY_400 = '#9CA3AF';

/** Soft blurred-looking ground shadow, faked with a radial gradient (no filters). */
const GroundShadow = ({ id, cx = 240, cy = 332 }: { id: string; cx?: number; cy?: number }) => (
    <>
        <defs>
            <radialGradient id={id} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#2F4BB8" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#2F4BB8" stopOpacity="0" />
            </radialGradient>
        </defs>
        <ellipse cx={cx} cy={cy} rx={185} ry={22} fill={`url(#${id})`} />
    </>
);

const svgProps = (className?: string) => ({
    viewBox: '0 0 480 360',
    className,
    'aria-hidden': true as const,
    role: 'presentation' as const,
    focusable: 'false' as const,
});

/* 1. Sales Pipeline — 3 kanban columns, flow chevrons, rising mini-chart */
export const PipelineIllustration = ({ className }: IllustrationProps) => (
    <svg {...svgProps(className)}>
        <GroundShadow id="pl-shadow" />
        {/* App window */}
        <rect x="50" y="36" width="380" height="252" rx="20" fill="#FFFFFF" />
        <circle cx="78" cy="62" r="5" fill={TINT_MID} />
        <circle cx="96" cy="62" r="5" fill={GRAY_300} />
        <circle cx="114" cy="62" r="5" fill={GRAY_200} />
        <line x1="50" y1="80" x2="430" y2="80" stroke={GRAY_100} strokeWidth="2" />
        {/* Kanban columns */}
        {([
            { x: 72, cards: [122, 172, 222], dot: BRAND },
            { x: 188, cards: [122, 172], dot: AMBER },
            { x: 304, cards: [122], dot: EMERALD },
        ] as const).map((col) => (
            <g key={col.x}>
                <rect x={col.x} y="92" width="104" height="180" rx="12" fill={TINT_LIGHT} />
                <rect x={col.x + 12} y="104" width="52" height="8" rx="4" fill={TINT_MID} />
                {col.cards.map((cy) => (
                    <g key={cy}>
                        <rect x={col.x + 12} y={cy} width="80" height="42" rx="8" fill="#FFFFFF" />
                        <circle cx={col.x + 24} cy={cy + 12} r="4" fill={col.dot} />
                        <rect x={col.x + 36} y={cy + 8} width="40" height="6" rx="3" fill={GRAY_300} />
                        <rect x={col.x + 24} y={cy + 24} width="52" height="6" rx="3" fill={GRAY_200} />
                    </g>
                ))}
            </g>
        ))}
        {/* Closed-won check on the last column's card */}
        <circle cx="380" cy="152" r="9" fill={EMERALD} />
        <path d="M375.5 152l3 3 6-6.5" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        {/* Flow chevrons between columns */}
        <path d="M178 172l8 8-8 8" stroke={BRAND} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d="M294 172l8 8-8 8" stroke={BRAND} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        {/* Rising win-rate mini chart */}
        <rect x="300" y="226" width="150" height="102" rx="16" fill="#FFFFFF" />
        <rect x="316" y="240" width="48" height="7" rx="3.5" fill={GRAY_200} />
        <line x1="316" y1="312" x2="434" y2="312" stroke={GRAY_100} strokeWidth="3" />
        <polyline
            points="318,304 344,286 366,294 392,266 424,248"
            stroke={EMERALD}
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
        />
        <circle cx="424" cy="248" r="5" fill={EMERALD} />
    </svg>
);

/* 2. SmartCapture — lead form card + magnet pulling avatar dots */
export const SmartCaptureIllustration = ({ className }: IllustrationProps) => (
    <svg {...svgProps(className)}>
        <GroundShadow id="sc-shadow" />
        {/* Form card */}
        <rect x="56" y="50" width="204" height="244" rx="20" fill="#FFFFFF" />
        <rect x="80" y="76" width="96" height="10" rx="5" fill={TINT_MID} />
        <rect x="80" y="94" width="140" height="7" rx="3.5" fill={TINT_LIGHT} />
        {[116, 152, 188].map((y) => (
            <g key={y}>
                <rect x="80" y={y} width="156" height="26" rx="8" fill={GRAY_100} />
                <rect x="90" y={y + 10} width="70" height="6" rx="3" fill={GRAY_300} />
            </g>
        ))}
        {/* Validated field check */}
        <circle cx="222" cy="165" r="8" fill={EMERALD} />
        <path d="M218.5 165l2.5 2.5 5-5.5" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        {/* Submit button */}
        <rect x="80" y="228" width="156" height="34" rx="17" fill={BRAND} />
        <rect x="134" y="241" width="48" height="8" rx="4" fill="#FFFFFF" />
        {/* Magnet (horseshoe opening toward the form) */}
        <path d="M310 96H358A54 54 0 0 1 358 204H310V172H358A22 22 0 0 0 358 128H310Z" fill="#FFFFFF" />
        <rect x="296" y="96" width="18" height="32" rx="4" fill={TINT_MID} />
        <rect x="296" y="172" width="18" height="32" rx="4" fill={TINT_MID} />
        {/* Attraction paths */}
        <path d="M262 122C272 116 284 112 295 112" stroke={TINT_LIGHT} strokeWidth="3" strokeLinecap="round" strokeDasharray="1 8" fill="none" />
        <path d="M262 178C272 184 284 188 295 188" stroke={TINT_LIGHT} strokeWidth="3" strokeLinecap="round" strokeDasharray="1 8" fill="none" />
        {/* Lead avatars being pulled in */}
        {[
            { cx: 278, cy: 112 },
            { cx: 282, cy: 150 },
            { cx: 278, cy: 190 },
        ].map((a) => (
            <g key={`${a.cx}-${a.cy}`}>
                <circle cx={a.cx} cy={a.cy} r="11" fill={TINT_LIGHT} />
                <circle cx={a.cx} cy={a.cy - 3.5} r="3.5" fill={BRAND} />
                <ellipse cx={a.cx} cy={a.cy + 4.5} rx="5.5" ry="4" fill={BRAND} />
            </g>
        ))}
        {/* Reward accent */}
        <circle cx="330" cy="70" r="5" fill={AMBER} />
    </svg>
);

/* 3. Client 360 — central avatar, orbit ring, channel badges */
export const Client360Illustration = ({ className }: IllustrationProps) => (
    <svg {...svgProps(className)}>
        <GroundShadow id="c3-shadow" />
        <defs>
            <clipPath id="c3-avatar-clip">
                <circle cx="240" cy="172" r="62" />
            </clipPath>
        </defs>
        {/* Orbit ring */}
        <circle cx="240" cy="172" r="104" stroke={TINT_MID} strokeWidth="2.5" strokeDasharray="2 10" strokeLinecap="round" fill="none" />
        {[
            [314, 98],
            [314, 246],
            [166, 98],
            [166, 246],
        ].map(([cx, cy]) => (
            <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="4" fill={TINT_LIGHT} />
        ))}
        {/* Central customer avatar */}
        <circle cx="240" cy="172" r="62" fill="#FFFFFF" />
        <g clipPath="url(#c3-avatar-clip)">
            <circle cx="240" cy="156" r="19" fill={TINT_MID} />
            <ellipse cx="240" cy="212" rx="30" ry="21" fill={TINT_MID} />
        </g>
        {/* Chat badge (top) */}
        <circle cx="240" cy="68" r="27" fill="#FFFFFF" />
        <rect x="226" y="58" width="28" height="18" rx="7" fill={EMERALD} />
        <path d="M234 75l-4 7 9-5z" fill={EMERALD} />
        <circle cx="235" cy="67" r="2.2" fill="#FFFFFF" />
        <circle cx="245" cy="67" r="2.2" fill="#FFFFFF" />
        {/* Envelope badge (right) */}
        <circle cx="344" cy="172" r="27" fill="#FFFFFF" />
        <rect x="330" y="162" width="28" height="20" rx="4" fill={BRAND} />
        <polyline points="333,166 344,174 355,166" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        {/* Ticket badge (bottom) */}
        <circle cx="240" cy="276" r="27" fill="#FFFFFF" />
        <rect x="226" y="268" width="28" height="17" rx="4" fill={AMBER} />
        <line x1="247" y1="270" x2="247" y2="283" stroke="#FFFFFF" strokeWidth="1.5" strokeDasharray="2 3" />
        <circle cx="235" cy="276.5" r="2.5" fill="#FFFFFF" />
        {/* Note badge (left) */}
        <circle cx="136" cy="172" r="27" fill="#FFFFFF" />
        <rect x="126" y="158" width="21" height="28" rx="4" fill={TINT_LIGHT} stroke={TINT_MID} strokeWidth="1.5" />
        <rect x="130" y="166" width="12" height="3" rx="1.5" fill={GRAY_400} />
        <rect x="130" y="173" width="12" height="3" rx="1.5" fill={GRAY_400} />
        <rect x="130" y="180" width="8" height="3" rx="1.5" fill={GRAY_400} />
    </svg>
);

/* 4. WhatsApp Campaign & Conversation — green bubble cascade + broadcast megaphone */
export const WhatsAppCampaignIllustration = ({ className }: IllustrationProps) => (
    <svg {...svgProps(className)}>
        <GroundShadow id="wa-shadow" />
        {/* Conversation card */}
        <rect x="48" y="44" width="212" height="252" rx="20" fill="#FFFFFF" />
        <circle cx="76" cy="72" r="11" fill={TINT_MID} />
        <rect x="94" y="64" width="72" height="8" rx="4" fill={GRAY_300} />
        <rect x="94" y="77" width="44" height="6" rx="3" fill={GRAY_200} />
        <line x1="64" y1="94" x2="244" y2="94" stroke={GRAY_100} strokeWidth="2" />
        {/* Bubble cascade */}
        <rect x="64" y="106" width="108" height="30" rx="10" fill={GRAY_100} />
        <rect x="74" y="117" width="70" height="7" rx="3.5" fill={GRAY_300} />
        <rect x="116" y="146" width="128" height="30" rx="10" fill={EMERALD} />
        <rect x="126" y="157" width="80" height="7" rx="3.5" fill="#FFFFFF" opacity="0.85" />
        <rect x="64" y="186" width="96" height="30" rx="10" fill={GRAY_100} />
        <rect x="74" y="197" width="58" height="7" rx="3.5" fill={GRAY_300} />
        <rect x="104" y="226" width="140" height="34" rx="10" fill={EMERALD} />
        <rect x="114" y="235" width="90" height="6" rx="3" fill="#FFFFFF" opacity="0.85" />
        <rect x="114" y="246" width="60" height="5" rx="2.5" fill="#FFFFFF" opacity="0.6" />
        {/* Delivered double-check */}
        <path d="M214 250l3.5 3.5 6-6.5" stroke={TINT_LIGHT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d="M221 250l3.5 3.5 6-6.5" stroke={TINT_LIGHT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        {/* Megaphone */}
        <rect x="284" y="168" width="22" height="40" rx="8" fill={TINT_MID} />
        <path d="M304 172L376 138L376 244L304 208Z" fill="#FFFFFF" />
        <rect x="316" y="210" width="14" height="40" rx="7" fill={TINT_MID} />
        {/* Broadcast waves */}
        <path d="M382 172A19 19 0 0 1 382 210" stroke={TINT_LIGHT} strokeWidth="4" strokeLinecap="round" fill="none" />
        <path d="M392 157A33 33 0 0 1 392 223" stroke={TINT_LIGHT} strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.85" />
        <path d="M404 143A47 47 0 0 1 404 237" stroke={TINT_LIGHT} strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.65" />
        {/* Broadcast messages flying out */}
        <rect x="414" y="118" width="30" height="20" rx="7" fill={EMERALD} />
        <circle cx="429" cy="128" r="3" fill="#FFFFFF" />
        <rect x="428" y="166" width="24" height="16" rx="6" fill={EMERALD} opacity="0.85" />
        <circle cx="424" cy="222" r="4" fill={AMBER} />
    </svg>
);

/* 5. Email Marketing — opening envelope + send-stats bars + subscriber list */
export const EmailMarketingIllustration = ({ className }: IllustrationProps) => (
    <svg {...svgProps(className)}>
        <GroundShadow id="em-shadow" />
        {/* Open flap */}
        <polygon points="70,146 168,66 266,146" fill={TINT_MID} />
        {/* Sheet emerging */}
        <rect x="98" y="88" width="140" height="92" rx="8" fill="#FFFFFF" stroke={TINT_LIGHT} strokeWidth="2" />
        <rect x="112" y="104" width="80" height="7" rx="3.5" fill={GRAY_300} />
        <rect x="112" y="118" width="112" height="6" rx="3" fill={GRAY_200} />
        <rect x="112" y="131" width="96" height="6" rx="3" fill={GRAY_200} />
        {/* Envelope body */}
        <rect x="70" y="146" width="196" height="116" rx="12" fill="#FFFFFF" />
        <path d="M72 150L168 214L264 150" stroke={GRAY_200} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        {/* Open/click stats card */}
        <rect x="296" y="60" width="144" height="112" rx="16" fill="#FFFFFF" />
        <rect x="312" y="74" width="52" height="7" rx="3.5" fill={GRAY_200} />
        <rect x="316" y="122" width="22" height="34" rx="5" fill={TINT_MID} />
        <rect x="348" y="104" width="22" height="52" rx="5" fill={BRAND} />
        <rect x="380" y="88" width="22" height="68" rx="5" fill={EMERALD} />
        <line x1="310" y1="158" x2="424" y2="158" stroke={GRAY_100} strokeWidth="3" />
        {/* Subscriber list card */}
        <rect x="288" y="190" width="152" height="118" rx="16" fill="#FFFFFF" />
        {([
            { y: 206, status: EMERALD },
            { y: 240, status: BRAND },
            { y: 274, status: GRAY_300 },
        ] as const).map((row, i) => (
            <g key={row.y}>
                <circle cx="308" cy={row.y + 8} r="9" fill={TINT_LIGHT} />
                <circle cx="308" cy={row.y + 8} r="3.5" fill={TINT_MID} />
                <rect x="324" y={row.y + 1} width="84" height="7" rx="3.5" fill={GRAY_200} />
                <rect x="324" y={row.y + 13} width="52" height="5" rx="2.5" fill={GRAY_100} />
                {i === 0 ? (
                    <>
                        <circle cx="422" cy={row.y + 8} r="7" fill={EMERALD} />
                        <path
                            d={`M419 ${row.y + 8}l2 2 4-4.5`}
                            stroke="#FFFFFF"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            fill="none"
                        />
                    </>
                ) : (
                    <circle cx="422" cy={row.y + 8} r="4" fill={row.status} />
                )}
            </g>
        ))}
    </svg>
);

/* 6. OmniChannel — three channel badges funneling into one inbox */
export const OmnichannelIllustration = ({ className }: IllustrationProps) => (
    <svg {...svgProps(className)}>
        <GroundShadow id="oc-shadow" />
        {/* Funnel paths */}
        <path d="M116 118C116 160 190 168 226 196" stroke={TINT_MID} strokeWidth="3" strokeLinecap="round" fill="none" />
        <path d="M240 96C240 130 240 160 240 192" stroke={TINT_MID} strokeWidth="3" strokeLinecap="round" fill="none" />
        <path d="M364 118C364 160 290 168 254 196" stroke={TINT_MID} strokeWidth="3" strokeLinecap="round" fill="none" />
        <circle cx="152" cy="158" r="4" fill={EMERALD} />
        <circle cx="240" cy="150" r="4" fill={BRAND} />
        <circle cx="328" cy="158" r="4" fill={AMBER} />
        {/* WhatsApp chat badge */}
        <circle cx="116" cy="84" r="30" fill="#FFFFFF" />
        <rect x="101" y="72" width="30" height="20" rx="8" fill={EMERALD} />
        <path d="M110 91l-4 8 10-5z" fill={EMERALD} />
        <circle cx="110" cy="82" r="2.2" fill="#FFFFFF" />
        <circle cx="119" cy="82" r="2.2" fill="#FFFFFF" />
        {/* Email badge */}
        <circle cx="240" cy="62" r="30" fill="#FFFFFF" />
        <rect x="225" y="52" width="30" height="21" rx="4" fill={BRAND} />
        <polyline points="228,56 240,65 252,56" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        {/* Web chat badge */}
        <circle cx="364" cy="84" r="30" fill="#FFFFFF" />
        <rect x="349" y="73" width="30" height="23" rx="5" fill={AMBER} />
        <circle cx="355" cy="79" r="2" fill="#FFFFFF" />
        <rect x="360" y="77" width="14" height="3" rx="1.5" fill="#FFFFFF" />
        <rect x="355" y="85" width="18" height="3" rx="1.5" fill="#FFFFFF" opacity="0.85" />
        <rect x="355" y="91" width="12" height="3" rx="1.5" fill="#FFFFFF" opacity="0.85" />
        {/* Unified inbox card */}
        <rect x="126" y="198" width="228" height="126" rx="18" fill="#FFFFFF" />
        <rect x="144" y="214" width="64" height="9" rx="4.5" fill={TINT_MID} />
        <rect x="310" y="212" width="28" height="14" rx="7" fill={BRAND} />
        <circle cx="324" cy="219" r="3" fill="#FFFFFF" />
        <line x1="142" y1="236" x2="338" y2="236" stroke={GRAY_100} strokeWidth="2" />
        {/* Row 1 (highlighted) */}
        <rect x="138" y="242" width="204" height="30" rx="8" fill={TINT_LIGHT} />
        <circle cx="154" cy="257" r="9" fill="#FFFFFF" />
        <circle cx="154" cy="257" r="3.5" fill={TINT_MID} />
        <rect x="170" y="249" width="74" height="7" rx="3.5" fill={TINT_MID} />
        <rect x="170" y="260" width="48" height="5" rx="2.5" fill={GRAY_300} />
        <circle cx="330" cy="257" r="5" fill={EMERALD} />
        {/* Row 2 */}
        <circle cx="154" cy="291" r="9" fill={TINT_LIGHT} />
        <circle cx="154" cy="291" r="3.5" fill={TINT_MID} />
        <rect x="170" y="283" width="84" height="7" rx="3.5" fill={GRAY_200} />
        <rect x="170" y="294" width="56" height="5" rx="2.5" fill={GRAY_100} />
        <circle cx="330" cy="291" r="5" fill={AMBER} />
    </svg>
);

/* 7. Data Intelligence — magnifier over a company-dot grid + radar card */
export const DataIntelligenceIllustration = ({ className }: IllustrationProps) => {
    const rows = [84, 126, 168, 210, 252];
    const cols = [88, 130, 172, 214, 256, 298];
    const cluster: Record<string, string> = {
        '214-126': BRAND,
        '172-168': BRAND,
        '256-126': BRAND,
        '214-168': EMERALD,
    };
    return (
        <svg {...svgProps(className)}>
            <GroundShadow id="di-shadow" />
            {/* Company grid card */}
            <rect x="52" y="44" width="278" height="244" rx="20" fill="#FFFFFF" />
            {/* Cluster halo */}
            <circle cx="214" cy="147" r="50" fill={TINT_LIGHT} />
            {rows.map((y) =>
                cols.map((x) => {
                    const special = cluster[`${x}-${y}`];
                    return (
                        <circle
                            key={`${x}-${y}`}
                            cx={x}
                            cy={y}
                            r={special ? 6 : 5}
                            fill={special ?? GRAY_200}
                        />
                    );
                })
            )}
            {/* Magnifier */}
            <circle cx="214" cy="147" r="56" stroke={BRAND} strokeWidth="8" fill="none" />
            <path d="M186 122A40 40 0 0 1 210 110" stroke={TINT_MID} strokeWidth="5" strokeLinecap="round" fill="none" />
            <line x1="174" y1="187" x2="136" y2="225" stroke={BRAND} strokeWidth="13" strokeLinecap="round" />
            {/* Business-signal radar card */}
            <rect x="312" y="182" width="128" height="124" rx="16" fill="#FFFFFF" />
            <circle cx="376" cy="244" r="14" stroke={TINT_LIGHT} strokeWidth="2.5" fill="none" />
            <circle cx="376" cy="244" r="28" stroke={TINT_LIGHT} strokeWidth="2.5" fill="none" />
            <circle cx="376" cy="244" r="42" stroke={GRAY_200} strokeWidth="2.5" fill="none" />
            <path d="M376 244L376 202A42 42 0 0 1 405.7 214.3Z" fill={TINT_MID} opacity="0.5" />
            <circle cx="394" cy="226" r="4" fill={EMERALD} />
            <circle cx="362" cy="262" r="3.5" fill={AMBER} />
            <circle cx="388" cy="254" r="3" fill={BRAND} />
        </svg>
    );
};

/* 8. Support & Service Ticketing — stacked tickets, resolved badge, SLA clock */
export const TicketingIllustration = ({ className }: IllustrationProps) => (
    <svg {...svgProps(className)}>
        <GroundShadow id="tk-shadow" />
        {/* Stacked ticket cards */}
        {([
            { x: 76, y: 60, dot: EMERALD },
            { x: 96, y: 124, dot: AMBER },
            { x: 116, y: 188, dot: BRAND },
        ] as const).map((t) => (
            <g key={t.y}>
                <rect x={t.x} y={t.y} width="252" height="72" rx="14" fill="#FFFFFF" />
                <circle cx={t.x + 26} cy={t.y + 24} r="7" fill={t.dot} />
                <rect x={t.x + 44} y={t.y + 16} width="108" height="8" rx="4" fill={GRAY_300} />
                <rect x={t.x + 44} y={t.y + 32} width="72" height="6" rx="3" fill={GRAY_200} />
                <rect x={t.x + 44} y={t.y + 48} width="90" height="6" rx="3" fill={GRAY_100} />
                <line
                    x1={t.x + 188}
                    y1={t.y + 12}
                    x2={t.x + 188}
                    y2={t.y + 60}
                    stroke={GRAY_200}
                    strokeWidth="2"
                    strokeDasharray="3 6"
                />
                <rect x={t.x + 200} y={t.y + 18} width="38" height="14" rx="7" fill={TINT_LIGHT} />
                <circle cx={t.x + 210} cy={t.y + 25} r="3" fill={t.dot} />
            </g>
        ))}
        {/* Resolved badge */}
        <circle cx="356" cy="84" r="26" fill={EMERALD} stroke="#FFFFFF" strokeWidth="4" />
        <path d="M344 84l8 8 16-17" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        {/* SLA clock */}
        <circle cx="394" cy="236" r="36" fill="#FFFFFF" />
        <path d="M394 208A28 28 0 0 1 418 250" stroke={AMBER} strokeWidth="5" strokeLinecap="round" fill="none" />
        <circle cx="422" cy="236" r="2" fill={GRAY_200} />
        <circle cx="394" cy="264" r="2" fill={GRAY_200} />
        <circle cx="366" cy="236" r="2" fill={GRAY_200} />
        <line x1="394" y1="236" x2="394" y2="216" stroke={BRAND} strokeWidth="4" strokeLinecap="round" />
        <line x1="394" y1="236" x2="408" y2="242" stroke={BRAND} strokeWidth="4" strokeLinecap="round" />
        <circle cx="394" cy="236" r="3.5" fill={BRAND} />
    </svg>
);
