export default function LivingRoomSVG({ className }: { className?: string }) {
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
            <rect x="0" y="0" width="1000" height="430" fill="#F0EBE4" />
            {/* Wall texture band */}
            <rect x="0" y="340" width="1000" height="90" fill="#E8E2D8" />
            <line x1="0" y1="340" x2="1000" y2="340" stroke="#D8D0C4" strokeWidth="2" />
            <rect x="0" y="0" width="1000" height="8" fill="#D8D0C4" />

            {/* === FLOOR === */}
            <rect x="0" y="430" width="1000" height="170" fill="#C4B098" />
            {/* Wood planks */}
            {[455, 485, 515, 545, 575].map((y, i) => (
                <line key={i} x1="0" y1={y} x2="1000" y2={y} stroke="#B8A488" strokeWidth="1" opacity="0.35" />
            ))}
            <rect x="0" y="430" width="1000" height="10" fill="rgba(0,0,0,0.05)" />

            {/* === LARGE RUG === */}
            <g data-object-id="rug">
                <ellipse cx="350" cy="500" rx="280" ry="55" fill="#DCD0C0" opacity="0.6" />
                <ellipse cx="350" cy="500" rx="260" ry="42" fill="#E8DED0" opacity="0.5" />
                {/* Rug pattern — border lines */}
                <ellipse cx="350" cy="500" rx="240" ry="36" fill="none" stroke="#C8B8A0" strokeWidth="1.5" strokeDasharray="8 4" opacity="0.4" />
            </g>

            {/* === RECLINER CHAIR (left) === */}
            <g data-object-id="recliner" transform="translate(60, 280)">
                {/* Chair back */}
                <rect x="0" y="-80" width="130" height="100" rx="14" fill="#5C3A1E" stroke="#4A2E16" strokeWidth="2" />
                {/* Backrest cushion */}
                <rect x="10" y="-70" width="110" height="75" rx="10" fill="#6B4528" />
                {/* Seat */}
                <rect x="-5" y="15" width="140" height="80" rx="10" fill="#5C3A1E" stroke="#4A2E16" strokeWidth="2" />
                {/* Seat cushion */}
                <rect x="5" y="20" width="120" height="60" rx="8" fill="#6B4528" />
                {/* Armrests */}
                <rect x="-15" y="-30" width="22" height="110" rx="8" fill="#5C3A1E" stroke="#4A2E16" strokeWidth="1.5" />
                <rect x="123" y="-30" width="22" height="110" rx="8" fill="#5C3A1E" stroke="#4A2E16" strokeWidth="1.5" />
                {/* Legs */}
                <rect x="5" y="92" width="15" height="30" rx="3" fill="#4A2E16" />
                <rect x="110" y="92" width="15" height="30" rx="3" fill="#4A2E16" />
                {/* Chair shadow */}
                <ellipse cx="65" cy="125" rx="75" ry="8" fill="rgba(0,0,0,0.06)" />
            </g>

            {/* === SOFA (center) === */}
            <g data-object-id="sofa" transform="translate(280, 300)">
                {/* Sofa back */}
                <rect x="0" y="-70" width="340" height="80" rx="12" fill="#7B5E3A" stroke="#5C4225" strokeWidth="2" />
                {/* Back cushions */}
                <rect x="15" y="-60" width="95" height="60" rx="10" fill="#8B6E4A" />
                <rect x="122" y="-60" width="95" height="60" rx="10" fill="#8B6E4A" />
                <rect x="230" y="-60" width="95" height="60" rx="10" fill="#8B6E4A" />
                {/* Seat base */}
                <rect x="-10" y="5" width="360" height="70" rx="10" fill="#7B5E3A" stroke="#5C4225" strokeWidth="2" />
                {/* Seat cushions */}
                <rect x="5" y="10" width="160" height="50" rx="8" fill="#8B6E4A" />
                <rect x="175" y="10" width="160" height="50" rx="8" fill="#8B6E4A" />
                {/* Armrests */}
                <rect x="-20" y="-30" width="25" height="100" rx="10" fill="#7B5E3A" stroke="#5C4225" strokeWidth="1.5" />
                <rect x="335" y="-30" width="25" height="100" rx="10" fill="#7B5E3A" stroke="#5C4225" strokeWidth="1.5" />
                {/* Sofa legs */}
                <rect x="10" y="72" width="12" height="20" rx="3" fill="#5C4225" />
                <rect x="320" y="72" width="12" height="20" rx="3" fill="#5C4225" />
                {/* Throw pillows */}
                <rect x="20" y="-20" width="45" height="35" rx="12" fill="#D4A855" transform="rotate(-8 42 -2)" />
                <rect x="280" y="-18" width="45" height="35" rx="12" fill="#8B9E75" transform="rotate(6 302 0)" />
            </g>

            {/* === TV & STAND (right wall) === */}
            <g data-object-id="tv" transform="translate(730, 200)">
                {/* TV stand */}
                <rect x="-10" y="140" width="220" height="50" rx="6" fill="#4A3A2A" stroke="#3A2A1A" strokeWidth="1.5" />
                {/* Drawers */}
                <rect x="0" y="148" width="95" height="35" rx="3" fill="#3A2A1A" stroke="#2A1A0A" strokeWidth="1" />
                <rect x="105" y="148" width="95" height="35" rx="3" fill="#3A2A1A" stroke="#2A1A0A" strokeWidth="1" />
                <circle cx="47" cy="166" r="3" fill="#6B5B4C" />
                <circle cx="152" cy="166" r="3" fill="#6B5B4C" />

                {/* TV screen */}
                <rect x="10" y="0" width="180" height="130" rx="4" fill="#1A1A2E" stroke="#222222" strokeWidth="4" />
                {/* Screen glare */}
                <rect x="16" y="6" width="168" height="118" rx="2" fill="#16213E" />
                <path d="M16 6 L100 60 L16 124Z" fill="rgba(255,255,255,0.03)" />
                {/* TV base/stand */}
                <rect x="70" y="128" width="60" height="14" rx="2" fill="#333" />
            </g>

            {/* === PHOTO WALL === */}
            <g data-object-id="photos" transform="translate(340, 50)">
                {/* Frame 1 */}
                <rect x="0" y="0" width="70" height="55" rx="3" fill="white" stroke="#C9B48E" strokeWidth="2.5" />
                <rect x="6" y="6" width="58" height="43" rx="2" fill="#E8D8C8" />
                {/* Frame 2 */}
                <rect x="85" y="-10" width="55" height="70" rx="3" fill="white" stroke="#C9B48E" strokeWidth="2.5" />
                <rect x="91" y="-4" width="43" height="58" rx="2" fill="#D8C8B8" />
                {/* Frame 3 */}
                <rect x="155" y="5" width="65" height="50" rx="3" fill="white" stroke="#C9B48E" strokeWidth="2.5" />
                <rect x="161" y="11" width="53" height="38" rx="2" fill="#E0D0C0" />
                {/* Frame 4 */}
                <rect x="10" y="70" width="50" height="65" rx="3" fill="white" stroke="#C9B48E" strokeWidth="2.5" />
                <rect x="16" y="76" width="38" height="53" rx="2" fill="#D0C0B0" />
                {/* Frame 5 */}
                <rect x="75" y="75" width="75" height="50" rx="3" fill="white" stroke="#C9B48E" strokeWidth="2.5" />
                <rect x="81" y="81" width="63" height="38" rx="2" fill="#E8D8C8" />
                {/* Frame 6 */}
                <rect x="165" y="68" width="55" height="60" rx="3" fill="white" stroke="#C9B48E" strokeWidth="2.5" />
                <rect x="171" y="74" width="43" height="48" rx="2" fill="#D8E0D0" />
            </g>

            {/* === PRAYER CORNER (far left, on wall) === */}
            <g data-object-id="prayer-corner" transform="translate(60, 120)">
                {/* Small shelf */}
                <rect x="0" y="0" width="80" height="8" rx="2" fill="#A28B6D" />
                {/* Small temple frame */}
                <rect x="8" y="-60" width="64" height="58" rx="4" fill="#D4A855" stroke="#B8902A" strokeWidth="2" />
                <path d="M8 -60 L40 -80 L72 -60" fill="#D4A855" stroke="#B8902A" strokeWidth="2" />
                {/* Small idol outlines */}
                <ellipse cx="28" cy="-30" rx="8" ry="12" fill="#FFD700" opacity="0.4" />
                <ellipse cx="52" cy="-30" rx="8" ry="12" fill="#FFD700" opacity="0.4" />
                {/* Diya */}
                <ellipse cx="40" cy="0" rx="6" ry="3" fill="#F59E0B" />
                <ellipse cx="40" cy="-4" rx="3" ry="5" fill="#FCD34D" opacity="0.7" />
            </g>

            {/* === SIDE TABLE with remote === */}
            <g transform="translate(250, 370)">
                <rect x="0" y="0" width="40" height="44" rx="4" fill="#6B5335" stroke="#5C4225" strokeWidth="1" />
                <rect x="-4" y="-5" width="48" height="8" rx="3" fill="#7B6345" />
                {/* Remote */}
                <rect x="8" y="-12" width="24" height="8" rx="2" fill="#333" />
                <circle cx="20" cy="-8" r="2" fill="#EF4444" />
            </g>

            {/* === BOOKSHELF (right of photos) === */}
            <g transform="translate(880, 80)">
                <rect x="0" y="0" width="70" height="250" rx="4" fill="#8B7355" stroke="#6B5335" strokeWidth="1.5" />
                {/* Shelves */}
                {[0, 62, 124, 186].map((y, i) => (
                    <rect key={i} x="4" y={y + 4} width="62" height="56" rx="2" fill="#7A6548" />
                ))}
                {/* Books */}
                {[8, 18, 26, 32, 40].map((x, i) => (
                    <rect key={i} x={x} y="8" width="6" height="48" rx="1" fill={['#8B4513', '#4A6B3A', '#5B4A8A', '#8B6540', '#A05040'][i]} opacity="0.8" />
                ))}
                {[8, 16, 28, 38, 48].map((x, i) => (
                    <rect key={i} x={x} y="70" width="7" height="48" rx="1" fill={['#6B8060', '#8B5040', '#5A5A8A', '#A08050', '#6B4030'][i]} opacity="0.8" />
                ))}
            </g>

            {/* === WARM AMBIENT LIGHT from window area === */}
            <ellipse cx="100" cy="350" rx="160" ry="100" fill="rgba(255, 240, 200, 0.08)" />
        </svg>
    );
}
