export default function MemoryRoomSVG({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            width="100%"
            height="160"
            viewBox="0 0 800 320"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
        >
            <rect x="0" y="0" width="800" height="320" rx="12" fill="#F8FAFC" />

            {/* Floor */}
            <rect x="0" y="240" width="800" height="80" fill="#F1F5F9" />

            {/* Sofa */}
            <g transform="translate(60,120)">
                <rect x="0" y="10" width="300" height="70" rx="10" fill="#FEF3C7" stroke="#FBBF24" />
                <rect x="10" y="0" width="90" height="40" rx="8" fill="#FFF7ED" stroke="#F59E0B" />
                <rect x="210" y="0" width="80" height="40" rx="8" fill="#FFF7ED" stroke="#F59E0B" />
                <circle cx="60" cy="45" r="6" fill="#F97316" />
                <circle cx="120" cy="45" r="6" fill="#FB7185" />
            </g>

            {/* Small side table */}
            <g transform="translate(380,160)">
                <rect x="0" y="0" width="40" height="50" rx="6" fill="#fff" stroke="#CBD5E1" />
                <rect x="8" y="-6" width="24" height="6" rx="2" fill="#FDE68A" />
            </g>

            {/* Plant */}
            <g transform="translate(460,130)">
                <rect x="0" y="40" width="20" height="40" rx="4" fill="#6EE7B7" />
                <ellipse cx="10" cy="20" rx="28" ry="20" fill="#34D399" />
            </g>

            {/* Rug */}
            <ellipse cx="220" cy="270" rx="110" ry="24" fill="#EFF6FF" />

            {/* Picture frame */}
            <g transform="translate(560,60)">
                <rect x="0" y="0" width="120" height="80" rx="6" fill="#fff" stroke="#CBD5E1" />
                <rect x="12" y="12" width="96" height="56" rx="4" fill="#E0E7FF" />
            </g>

            {/* Label */}
            <text x="40" y="38" fill="#0F172A" style={{ fontFamily: 'Inter, sans-serif', fontSize: 16, fontWeight: 700 }}>
                Memory Room — Living Room
            </text>
            <text x="40" y="60" fill="#475569" style={{ fontFamily: 'Inter, sans-serif', fontSize: 12 }}>
                Visual map to aid recall: key furniture and objects.
            </text>
        </svg>
    );
}
