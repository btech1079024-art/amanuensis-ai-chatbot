import { useEffect, useState } from "react";

// The nib mark — a faceted pen-nib badge. On the empty-state hero it pops in
// once (the nib scales in, the ink slit draws itself, the breather hole
// punches through last); everywhere else (navbar, sidebar, message avatars)
// it's static, so the motion reads as a one-time signature, not a repeated tic.
function Logo({ size = 40, animated = false, className = "" }) {
    const [played, setPlayed] = useState(!animated);

    useEffect(() => {
        if (!animated) return;
        let raf2;
        const raf1 = requestAnimationFrame(() => {
            raf2 = requestAnimationFrame(() => setPlayed(true));
        });
        return () => {
            cancelAnimationFrame(raf1);
            if (raf2) cancelAnimationFrame(raf2);
        };
    }, [animated]);

    const nibStyle = animated ? {
        transformBox: "fill-box",
        transformOrigin: "center",
        transform: played ? "scale(1)" : "scale(0.4)",
        opacity: played ? 1 : 0,
        transition: "transform 420ms cubic-bezier(.34,1.56,.64,1) 60ms, opacity 260ms ease 60ms",
    } : undefined;

    const slitStyle = animated ? {
        strokeDasharray: 24,
        strokeDashoffset: played ? 0 : 24,
        transition: "stroke-dashoffset 300ms ease 480ms",
    } : undefined;

    const holeStyle = animated ? {
        transformBox: "fill-box",
        transformOrigin: "32px 41px",
        transform: played ? "scale(1)" : "scale(0)",
        transition: "transform 220ms cubic-bezier(.34,1.56,.64,1) 780ms",
    } : undefined;

    return (
        <svg width={size} height={size} viewBox="0 0 64 64" className={className} aria-hidden="true">
            <defs>
                <linearGradient id="logoGrad" x1="4" y1="4" x2="60" y2="60" gradientUnits="userSpaceOnUse">
                    <stop offset="0" style={{ stopColor: "var(--grad-a)" }} />
                    <stop offset="1" style={{ stopColor: "var(--grad-b)" }} />
                </linearGradient>
            </defs>

            <rect x="4" y="4" width="56" height="56" rx="16" fill="url(#logoGrad)" />

            <g style={nibStyle}>
                <path d="M32 15 L45 33 L32 50 L19 33 Z" fill="var(--on-accent)" />
            </g>
            <line x1="32" y1="23" x2="32" y2="43" stroke="url(#logoGrad)" strokeWidth="3" strokeLinecap="round" style={slitStyle} />
            <circle cx="32" cy="41" r="2.6" fill="url(#logoGrad)" style={holeStyle} />
        </svg>
    );
}

export default Logo;