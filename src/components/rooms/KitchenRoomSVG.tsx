export default function KitchenRoomSVG({ className }: { className?: string }) {
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
            <rect x="0" y="0" width="1000" height="430" fill="#F5EDE0" />
            {/* Wall dado / lower wall band */}
            <rect x="0" y="340" width="1000" height="90" fill="#EDE3D4" />
            <line x1="0" y1="340" x2="1000" y2="340" stroke="#D6C9B6" strokeWidth="2" />
            {/* Crown moulding */}
            <rect x="0" y="0" width="1000" height="8" fill="#D6C9B6" rx="0" />

            {/* === FLOOR === */}
            <rect x="0" y="430" width="1000" height="170" fill="#D4B896" />
            {/* Floor tile lines */}
            <line x1="0" y1="500" x2="1000" y2="500" stroke="#C9A97C" strokeWidth="1" opacity="0.5" />
            <line x1="200" y1="430" x2="200" y2="600" stroke="#C9A97C" strokeWidth="1" opacity="0.3" />
            <line x1="400" y1="430" x2="400" y2="600" stroke="#C9A97C" strokeWidth="1" opacity="0.3" />
            <line x1="600" y1="430" x2="600" y2="600" stroke="#C9A97C" strokeWidth="1" opacity="0.3" />
            <line x1="800" y1="430" x2="800" y2="600" stroke="#C9A97C" strokeWidth="1" opacity="0.3" />
            {/* Floor shadow at base of wall */}
            <rect x="0" y="430" width="1000" height="12" fill="rgba(0,0,0,0.06)" />

            {/* === WINDOW === */}
            <g data-object-id="window">
                <rect x="80" y="60" width="180" height="200" rx="4" fill="#B8D8E8" stroke="#A28B6D" strokeWidth="5" />
                {/* Panes */}
                <line x1="170" y1="60" x2="170" y2="260" stroke="#A28B6D" strokeWidth="3" />
                <line x1="80" y1="160" x2="260" y2="160" stroke="#A28B6D" strokeWidth="3" />
                {/* Sky fill */}
                <rect x="83" y="63" width="84" height="94" fill="#C8E4F0" opacity="0.7" />
                <rect x="173" y="63" width="84" height="94" fill="#D0EAFB" opacity="0.7" />
                {/* Curtain left */}
                <path d="M70 55 Q80 80 78 260 L60 260 Q62 120 70 55Z" fill="#E8D5B7" opacity="0.6" />
                {/* Curtain right */}
                <path d="M270 55 Q260 80 262 260 L280 260 Q278 120 270 55Z" fill="#E8D5B7" opacity="0.6" />
                {/* Curtain rod */}
                <line x1="55" y1="55" x2="285" y2="55" stroke="#8B7355" strokeWidth="4" strokeLinecap="round" />
                <circle cx="55" cy="55" r="5" fill="#8B7355" />
                <circle cx="285" cy="55" r="5" fill="#8B7355" />
            </g>

            {/* === WALL CLOCK === */}
            <g data-object-id="clock">
                <circle cx="170" cy="170" r="0" fill="none" /> {/* Positioned in window area — actual clock is above stove */}
            </g>
            {/* Actual wall clock position — above counter center */}
            <g data-object-id="wall-clock" transform="translate(460, 80)">
                <circle cx="0" cy="0" r="50" fill="#FAFAF8" stroke="#A28B6D" strokeWidth="4" />
                <circle cx="0" cy="0" r="44" fill="white" stroke="#E8E0D0" strokeWidth="1" />
                {/* Hour markers */}
                {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle, i) => (
                    <line
                        key={i}
                        x1={Math.cos((angle - 90) * Math.PI / 180) * 36}
                        y1={Math.sin((angle - 90) * Math.PI / 180) * 36}
                        x2={Math.cos((angle - 90) * Math.PI / 180) * 42}
                        y2={Math.sin((angle - 90) * Math.PI / 180) * 42}
                        stroke="#6B5B4C"
                        strokeWidth={angle % 90 === 0 ? 3 : 1.5}
                        strokeLinecap="round"
                    />
                ))}
                {/* Hour hand (10 o'clock-ish) */}
                <line x1="0" y1="0" x2="-18" y2="-22" stroke="#3A3020" strokeWidth="3.5" strokeLinecap="round" />
                {/* Minute hand */}
                <line x1="0" y1="0" x2="8" y2="-32" stroke="#3A3020" strokeWidth="2" strokeLinecap="round" />
                {/* Center dot */}
                <circle cx="0" cy="0" r="3" fill="#3A3020" />
            </g>

            {/* === KITCHEN COUNTER === */}
            <g data-object-id="counter">
                {/* Counter front */}
                <rect x="320" y="310" width="620" height="120" rx="4" fill="#C9A97C" />
                {/* Counter top surface */}
                <rect x="315" y="300" width="630" height="18" rx="3" fill="#E8D5B7" stroke="#C9A97C" strokeWidth="1" />
                {/* Counter shadow */}
                <rect x="320" y="425" width="620" height="8" fill="rgba(0,0,0,0.08)" rx="2" />
                {/* Cabinet doors */}
                <rect x="340" y="335" width="90" height="85" rx="4" fill="#D4B896" stroke="#B8A07C" strokeWidth="1.5" />
                <rect x="445" y="335" width="90" height="85" rx="4" fill="#D4B896" stroke="#B8A07C" strokeWidth="1.5" />
                <rect x="710" y="335" width="90" height="85" rx="4" fill="#D4B896" stroke="#B8A07C" strokeWidth="1.5" />
                <rect x="815" y="335" width="90" height="85" rx="4" fill="#D4B896" stroke="#B8A07C" strokeWidth="1.5" />
                {/* Cabinet knobs */}
                <circle cx="420" cy="378" r="4" fill="#8B7355" />
                <circle cx="525" cy="378" r="4" fill="#8B7355" />
                <circle cx="790" cy="378" r="4" fill="#8B7355" />
                <circle cx="895" cy="378" r="4" fill="#8B7355" />
            </g>

            {/* === GAS STOVE === */}
            <g data-object-id="stove" transform="translate(540, 255)">
                {/* Stove body */}
                <rect x="0" y="0" width="140" height="50" rx="6" fill="#555" stroke="#444" strokeWidth="2" />
                {/* Burners */}
                <circle cx="40" cy="25" r="18" fill="none" stroke="#777" strokeWidth="3" />
                <circle cx="40" cy="25" r="8" fill="#444" />
                <circle cx="100" cy="25" r="18" fill="none" stroke="#777" strokeWidth="3" />
                <circle cx="100" cy="25" r="8" fill="#444" />
                {/* Knobs */}
                <circle cx="20" cy="48" r="6" fill="#333" stroke="#555" strokeWidth="1" />
                <circle cx="50" cy="48" r="6" fill="#333" stroke="#555" strokeWidth="1" />
                <circle cx="90" cy="48" r="6" fill="#333" stroke="#555" strokeWidth="1" />
                <circle cx="120" cy="48" r="6" fill="#333" stroke="#555" strokeWidth="1" />
            </g>

            {/* === TEA CUP on counter === */}
            <g data-object-id="tea-cup" transform="translate(370, 260)">
                {/* Saucer */}
                <ellipse cx="20" cy="40" rx="24" ry="8" fill="#F0E6D4" stroke="#C9A97C" strokeWidth="1" />
                {/* Cup body */}
                <path d="M6 10 Q4 38 12 38 L28 38 Q36 38 34 10Z" fill="#8B5E3C" stroke="#6B4528" strokeWidth="1.5" />
                {/* Cup handle */}
                <path d="M34 16 Q50 18 48 28 Q46 36 34 34" fill="none" stroke="#6B4528" strokeWidth="2.5" strokeLinecap="round" />
                {/* Steam */}
                <path d="M16 6 Q14 -6 18 -10" fill="none" stroke="#C9B9A5" strokeWidth="1.5" opacity="0.5" />
                <path d="M24 4 Q26 -8 22 -14" fill="none" stroke="#C9B9A5" strokeWidth="1.5" opacity="0.4" />
            </g>

            {/* === SPICE BOX on counter === */}
            <g data-object-id="spice-box" transform="translate(600, 268)">
                {/* Round dabba */}
                <ellipse cx="20" cy="30" rx="28" ry="8" fill="#C0C0C0" stroke="#999" strokeWidth="1" />
                <rect x="-8" y="10" width="56" height="22" rx="4" fill="#D0D0D0" stroke="#B0B0B0" strokeWidth="1" />
                {/* Lid */}
                <ellipse cx="20" cy="10" rx="28" ry="8" fill="#E0E0E0" stroke="#B0B0B0" strokeWidth="1.5" />
                {/* Lid handle */}
                <ellipse cx="20" cy="6" rx="8" ry="4" fill="#C0C0C0" stroke="#999" strokeWidth="1" />
            </g>

            {/* === REFRIGERATOR === */}
            <g data-object-id="fridge" transform="translate(830, 110)">
                {/* Fridge body */}
                <rect x="0" y="0" width="120" height="320" rx="8" fill="#F0F0F0" stroke="#D0D0D0" strokeWidth="2" />
                {/* Freezer door */}
                <rect x="5" y="5" width="110" height="100" rx="4" fill="#E8E8E8" stroke="#CCCCCC" strokeWidth="1" />
                {/* Fridge door */}
                <rect x="5" y="112" width="110" height="200" rx="4" fill="#E8E8E8" stroke="#CCCCCC" strokeWidth="1" />
                {/* Handles */}
                <rect x="100" y="40" width="6" height="30" rx="3" fill="#BBBBBB" />
                <rect x="100" y="170" width="6" height="50" rx="3" fill="#BBBBBB" />
                {/* Brand label */}
                <rect x="30" y="20" width="50" height="12" rx="2" fill="#D8D8D8" />
                {/* Sticky notes on fridge */}
                <rect x="15" y="130" width="35" height="35" rx="2" fill="#FDE68A" transform="rotate(-5 32 147)" />
                <rect x="60" y="140" width="35" height="35" rx="2" fill="#A7F3D0" transform="rotate(3 77 157)" />
            </g>

            {/* === MEDICINE BOX (wall cabinet) === */}
            <g data-object-id="medicine-box" transform="translate(740, 100)">
                <rect x="0" y="0" width="70" height="80" rx="4" fill="white" stroke="#D0D0D0" strokeWidth="2" />
                {/* Red cross */}
                <rect x="28" y="20" width="14" height="40" rx="2" fill="#EF4444" opacity="0.7" />
                <rect x="15" y="33" width="40" height="14" rx="2" fill="#EF4444" opacity="0.7" />
                {/* Cabinet handle */}
                <rect x="56" y="35" width="6" height="12" rx="2" fill="#BBBBBB" />
            </g>

            {/* === SHELF WITH JARS above counter === */}
            <g transform="translate(340, 200)">
                {/* Shelf */}
                <rect x="0" y="0" width="180" height="6" rx="2" fill="#A28B6D" />
                {/* Jars */}
                <rect x="10" y="-40" width="25" height="40" rx="4" fill="#E8D5B7" stroke="#C9A97C" strokeWidth="1" />
                <rect x="45" y="-35" width="25" height="35" rx="4" fill="#C4D4A0" stroke="#A0B070" strokeWidth="1" />
                <rect x="80" y="-38" width="25" height="38" rx="4" fill="#F0D0A0" stroke="#D0B080" strokeWidth="1" />
                <rect x="120" y="-32" width="25" height="32" rx="4" fill="#E0C0B0" stroke="#C0A090" strokeWidth="1" />
            </g>

            {/* === DECORATIVE: Hanging utensils near stove === */}
            <g transform="translate(680, 180)">
                <line x1="0" y1="0" x2="0" y2="60" stroke="#8B7355" strokeWidth="2" />
                <ellipse cx="0" cy="66" rx="12" ry="6" fill="none" stroke="#8B7355" strokeWidth="2" />
                <line x1="25" y1="0" x2="25" y2="55" stroke="#8B7355" strokeWidth="2" />
                <rect x="18" y="55" width="14" height="22" rx="2" fill="none" stroke="#8B7355" strokeWidth="2" />
            </g>

            {/* === WARM LIGHT EFFECT — sunlight from window === */}
            <ellipse cx="200" cy="350" rx="200" ry="120" fill="rgba(255, 240, 200, 0.12)" />
        </svg>
    );
}
