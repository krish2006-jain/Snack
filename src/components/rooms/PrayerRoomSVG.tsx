export default function PrayerRoomSVG({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            viewBox="0 0 1000 600"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="xMidYMid slice"
            style={{ width: '100%', height: '100%', display: 'block' }}
        >
            {/* === WALL === */}
            <rect x="0" y="0" width="1000" height="430" fill="#F5ECD5" />
            {/* Saffron / warm yellow tint upper */}
            <rect x="0" y="0" width="1000" height="200" fill="#F8F0D8" opacity="0.5" />
            {/* Wall dado */}
            <rect x="0" y="350" width="1000" height="80" fill="#EDE0C5" />
            <line x1="0" y1="350" x2="1000" y2="350" stroke="#D8C8A8" strokeWidth="2" />
            {/* Crown moulding */}
            <rect x="0" y="0" width="1000" height="8" fill="#D8C8A8" />

            {/* === FLOOR === */}
            <rect x="0" y="430" width="1000" height="170" fill="#D4C4A0" />
            {/* Marble-like floor */}
            <rect x="0" y="430" width="500" height="85" fill="#DCD0B8" opacity="0.3" />
            <rect x="500" y="430" width="500" height="85" fill="#D0C4A8" opacity="0.3" />
            <rect x="0" y="515" width="500" height="85" fill="#D0C4A8" opacity="0.3" />
            <rect x="500" y="515" width="500" height="85" fill="#DCD0B8" opacity="0.3" />
            <rect x="0" y="430" width="1000" height="10" fill="rgba(0,0,0,0.04)" />

            {/* === PRAYER MAT === */}
            <g data-object-id="mat">
                <rect x="300" y="440" width="400" height="140" rx="4" fill="#B91C1C" stroke="#991B1B" strokeWidth="2" />
                {/* Mat border pattern */}
                <rect x="310" y="450" width="380" height="120" rx="3" fill="none" stroke="#DC2626" strokeWidth="2" />
                <rect x="320" y="460" width="360" height="100" rx="3" fill="none" stroke="#991B1B" strokeWidth="1" opacity="0.5" />
                {/* Mihrab/arch pattern in mat */}
                <path d="M420 460 Q500 420 580 460" fill="none" stroke="#F87171" strokeWidth="2" opacity="0.4" />
                <path d="M440 470 Q500 440 560 470" fill="none" stroke="#FCA5A5" strokeWidth="1" opacity="0.3" />
                {/* Mat tassels */}
                {[310, 330, 350, 370, 390, 410, 430, 450, 470, 490, 510, 530, 550, 570, 590, 610, 630, 650, 670].map((x, i) => (
                    <line key={i} x1={x} y1="580" x2={x} y2="592" stroke="#991B1B" strokeWidth="1.5" />
                ))}
            </g>

            {/* === MAIN MANDIR (TEMPLE) === */}
            <g data-object-id="mandir" transform="translate(350, 50)">
                {/* Temple base platform */}
                <rect x="-20" y="270" width="340" height="20" rx="4" fill="#C9A840" stroke="#A88830" strokeWidth="1.5" />
                <rect x="-30" y="288" width="360" height="12" rx="3" fill="#B89830" />

                {/* Temple body */}
                <rect x="0" y="80" width="300" height="195" rx="8" fill="#D4A855" stroke="#B8902A" strokeWidth="2.5" />

                {/* Ornate arch */}
                <path d="M30 275 L30 140 Q150 60 270 140 L270 275" fill="#E8D49C" stroke="#C9A840" strokeWidth="2" />
                <path d="M45 275 L45 155 Q150 85 255 155 L255 275" fill="#F5E6C0" stroke="#D4B068" strokeWidth="1.5" />

                {/* Inner sanctum */}
                <rect x="60" y="150" width="180" height="120" rx="4" fill="#FBF5E0" />

                {/* Shelves in temple */}
                <line x1="65" y1="200" x2="235" y2="200" stroke="#D4B068" strokeWidth="2" />
                <line x1="65" y1="240" x2="235" y2="240" stroke="#D4B068" strokeWidth="2" />

                {/* Idols - top shelf */}
                {/* Ram */}
                <g transform="translate(100, 165)">
                    <ellipse cx="0" cy="0" rx="12" ry="18" fill="#FFD700" opacity="0.7" />
                    <circle cx="0" cy="-10" r="6" fill="#FFE44D" opacity="0.6" />
                </g>
                {/* Ganesh */}
                <g transform="translate(150, 162)">
                    <ellipse cx="0" cy="0" rx="14" ry="20" fill="#FF8C00" opacity="0.6" />
                    <circle cx="0" cy="-12" r="7" fill="#FFA500" opacity="0.5" />
                </g>
                {/* Durga */}
                <g transform="translate(200, 165)">
                    <ellipse cx="0" cy="0" rx="12" ry="18" fill="#FFD700" opacity="0.7" />
                    <circle cx="0" cy="-10" r="6" fill="#FFE44D" opacity="0.6" />
                </g>

                {/* Lower shelf items */}
                {/* Small puja items */}
                <ellipse cx="100" cy="230" rx="8" ry="5" fill="#D4A855" />
                <ellipse cx="130" cy="228" rx="6" ry="4" fill="#CC7755" />
                <ellipse cx="170" cy="230" rx="8" ry="5" fill="#D4A855" />
                <ellipse cx="200" cy="228" rx="6" ry="4" fill="#CC7755" />

                {/* Temple top dome / spire */}
                <path d="M100 80 Q150 20 200 80" fill="#D4A855" stroke="#B8902A" strokeWidth="2" />
                <path d="M120 80 Q150 40 180 80" fill="#E8D49C" stroke="#C9A840" strokeWidth="1.5" />
                {/* Kalash (sacred vessel) at top */}
                <ellipse cx="150" cy="30" rx="12" ry="8" fill="#D4A855" stroke="#B8902A" strokeWidth="1.5" />
                <rect x="146" y="15" width="8" height="16" rx="2" fill="#D4A855" stroke="#B8902A" strokeWidth="1" />
                <polygon points="146,15 150,5 154,15" fill="#D4A855" stroke="#B8902A" strokeWidth="1" />

                {/* Decorative hanging bells */}
                <g transform="translate(40, 85)" opacity="0.7">
                    <line x1="0" y1="0" x2="0" y2="20" stroke="#B8902A" strokeWidth="1.5" />
                    <ellipse cx="0" cy="22" rx="5" ry="6" fill="#D4A855" />
                    <circle cx="0" cy="28" r="2" fill="#B8902A" />
                </g>
                <g transform="translate(260, 85)" opacity="0.7">
                    <line x1="0" y1="0" x2="0" y2="20" stroke="#B8902A" strokeWidth="1.5" />
                    <ellipse cx="0" cy="22" rx="5" ry="6" fill="#D4A855" />
                    <circle cx="0" cy="28" r="2" fill="#B8902A" />
                </g>
            </g>

            {/* === DIYA (oil lamp) — left of mandir === */}
            <g data-object-id="diya" transform="translate(300, 370)">
                {/* Diya base */}
                <ellipse cx="0" cy="0" rx="16" ry="6" fill="#D4A855" stroke="#B8902A" strokeWidth="1.5" />
                <path d="M-16 0 Q-14 -8 0 -8 Q14 -8 16 0" fill="#D4A855" stroke="#B8902A" strokeWidth="1" />
                {/* Oil */}
                <ellipse cx="0" cy="-6" rx="10" ry="3" fill="#F59E0B" opacity="0.5" />
                {/* Flame */}
                <ellipse cx="0" cy="-18" rx="5" ry="10" fill="#F59E0B" opacity="0.8" />
                <ellipse cx="0" cy="-22" rx="3" ry="7" fill="#FDE68A" opacity="0.9" />
                <ellipse cx="0" cy="-24" rx="1.5" ry="4" fill="white" opacity="0.6" />
                {/* Flame glow */}
                <circle cx="0" cy="-18" r="25" fill="#F59E0B" opacity="0.06" />
            </g>

            {/* === AGARBATTI (incense stand) — right of mandir === */}
            <g data-object-id="incense" transform="translate(700, 350)">
                {/* Stand base */}
                <ellipse cx="0" cy="20" rx="12" ry="5" fill="#8B7355" stroke="#6B5335" strokeWidth="1" />
                <rect x="-3" y="0" width="6" height="22" rx="2" fill="#8B7355" />
                {/* Incense stick */}
                <line x1="0" y1="0" x2="0" y2="-60" stroke="#6B4520" strokeWidth="2" />
                {/* Glowing tip */}
                <circle cx="0" cy="-60" r="3" fill="#EF4444" />
                <circle cx="0" cy="-60" r="6" fill="#EF4444" opacity="0.2" />
                {/* Smoke wisps */}
                <path d="M0 -63 Q-8 -80 -3 -95 Q2 -110 -5 -130" fill="none" stroke="#C8C0B0" strokeWidth="1.5" opacity="0.3" />
                <path d="M0 -63 Q6 -78 3 -90 Q-2 -105 4 -120" fill="none" stroke="#C8C0B0" strokeWidth="1" opacity="0.2" />
            </g>

            {/* === BHAJAN BOOK (on mat area) === */}
            <g data-object-id="bhajan-book" transform="translate(370, 460)">
                {/* Book */}
                <rect x="0" y="0" width="50" height="35" rx="3" fill="#2D6A2D" stroke="#1A5C1A" strokeWidth="1.5" transform="rotate(-5 25 17)" />
                {/* Pages edge */}
                <rect x="4" y="3" width="42" height="29" rx="2" fill="#FAFAF0" transform="rotate(-5 25 17)" />
                {/* Text lines */}
                <line x1="10" y1="12" x2="38" y2="11" stroke="#D4C8B0" strokeWidth="1" />
                <line x1="10" y1="18" x2="36" y2="17" stroke="#D4C8B0" strokeWidth="1" />
                <line x1="10" y1="24" x2="34" y2="23" stroke="#D4C8B0" strokeWidth="1" />
            </g>

            {/* === PRAYER BEADS (near mat) === */}
            <g transform="translate(640, 470)">
                {/* Beads in a loose circle */}
                {[...Array(12)].map((_, i) => {
                    const angle = (i * 30) * Math.PI / 180;
                    const cx = Math.cos(angle) * 15;
                    const cy = Math.sin(angle) * 10;
                    return (
                        <circle key={i} cx={cx} cy={cy} r="3" fill="#8B4513" stroke="#6B3310" strokeWidth="0.5" opacity="0.8" />
                    );
                })}
                {/* Tassel */}
                <line x1="0" y1="10" x2="0" y2="22" stroke="#991B1B" strokeWidth="2" />
                <circle cx="0" cy="24" r="3" fill="#991B1B" />
            </g>

            {/* === BELL (hanging from wall) === */}
            <g transform="translate(200, 150)">
                {/* Hook */}
                <circle cx="0" cy="0" r="4" fill="#B8902A" stroke="#A08020" strokeWidth="1" />
                {/* Chain */}
                <line x1="0" y1="4" x2="0" y2="30" stroke="#B8902A" strokeWidth="2" />
                {/* Bell */}
                <path d="M-14 30 Q-14 50 0 55 Q14 50 14 30Z" fill="#D4A855" stroke="#B8902A" strokeWidth="1.5" />
                <circle cx="0" cy="52" r="3" fill="#B8902A" />
                {/* Shine */}
                <ellipse cx="-5" cy="38" rx="3" ry="8" fill="rgba(255,255,255,0.2)" transform="rotate(-10)" />
            </g>

            {/* === FLOWER GARLAND (toran) on wall === */}
            <g transform="translate(340, 30)">
                <path d="M0 10 Q75 40 150 10 Q225 40 300 10" fill="none" stroke="#F97316" strokeWidth="3" opacity="0.5" />
                {/* Flowers on garland */}
                {[0, 40, 80, 120, 160, 200, 240, 280, 300].map((x, i) => (
                    <circle key={i} cx={x} cy={x < 150 ? 10 + (x / 150) * 30 : 10 + ((300 - x) / 150) * 30} r="5" fill={i % 2 === 0 ? '#F97316' : '#FDE68A'} opacity="0.7" />
                ))}
                {/* Mango leaves */}
                {[20, 60, 100, 140, 180, 220, 260].map((x, i) => {
                    const y = x < 150 ? 10 + (x / 150) * 30 : 10 + ((300 - x) / 150) * 30;
                    return (
                        <ellipse key={i} cx={x} cy={y + 8} rx="4" ry="8" fill="#4A8C38" opacity="0.6" transform={`rotate(${i % 2 === 0 ? -15 : 15} ${x} ${y + 8})`} />
                    );
                })}
            </g>

            {/* === WARM GOLDEN AMBIENT GLOW === */}
            <ellipse cx="500" cy="300" rx="300" ry="200" fill="rgba(253, 230, 138, 0.06)" />
            <ellipse cx="300" cy="360" rx="60" ry="40" fill="rgba(245, 158, 11, 0.04)" />
        </svg>
    );
}
