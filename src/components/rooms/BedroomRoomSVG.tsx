export default function BedroomRoomSVG({ className }: { className?: string }) {
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
            <rect x="0" y="0" width="1000" height="430" fill="#EDE6F0" />
            {/* Lower wall band */}
            <rect x="0" y="350" width="1000" height="80" fill="#E4DCE8" />
            <line x1="0" y1="350" x2="1000" y2="350" stroke="#D0C4D8" strokeWidth="2" />
            {/* Crown moulding */}
            <rect x="0" y="0" width="1000" height="8" fill="#D0C4D8" />

            {/* === FLOOR === */}
            <rect x="0" y="430" width="1000" height="170" fill="#C8B8A0" />
            {/* Wood plank lines */}
            {[450, 480, 510, 540, 570].map((y, i) => (
                <line key={i} x1="0" y1={y} x2="1000" y2={y} stroke="#B8A890" strokeWidth="1" opacity="0.4" />
            ))}
            {/* Floor shadow */}
            <rect x="0" y="430" width="1000" height="10" fill="rgba(0,0,0,0.05)" />

            {/* === RUG under bed area === */}
            <ellipse cx="450" cy="500" rx="260" ry="50" fill="#DED0C0" stroke="#C8B8A0" strokeWidth="1" opacity="0.6" />
            <ellipse cx="450" cy="500" rx="240" ry="40" fill="#E8DDD0" opacity="0.5" />

            {/* === BED === */}
            <g data-object-id="bed">
                {/* Headboard */}
                <rect x="200" y="180" width="500" height="120" rx="10" fill="#6B3310" stroke="#5A2808" strokeWidth="2" />
                {/* Headboard carving detail */}
                <rect x="220" y="195" width="460" height="90" rx="6" fill="none" stroke="#8B4513" strokeWidth="2" opacity="0.5" />
                <rect x="240" y="210" width="200" height="60" rx="4" fill="none" stroke="#8B4513" strokeWidth="1.5" opacity="0.3" />
                <rect x="460" y="210" width="200" height="60" rx="4" fill="none" stroke="#8B4513" strokeWidth="1.5" opacity="0.3" />

                {/* Bed frame */}
                <rect x="180" y="300" width="540" height="130" rx="6" fill="#8B4513" stroke="#6B3310" strokeWidth="2" />

                {/* Mattress */}
                <rect x="195" y="290" width="510" height="100" rx="8" fill="#F5F0E8" stroke="#E8E0D0" strokeWidth="2" />

                {/* Bedsheet */}
                <rect x="200" y="310" width="500" height="80" rx="6" fill="#FAFAF5" stroke="#E0D8C8" strokeWidth="1" />
                {/* Sheet fold line */}
                <path d="M200 350 Q450 340 700 350" fill="none" stroke="#E0D8C8" strokeWidth="1" />

                {/* Pillows */}
                <rect x="220" y="296" width="130" height="50" rx="20" fill="white" stroke="#E8E0D0" strokeWidth="1.5" />
                <rect x="540" y="296" width="130" height="50" rx="20" fill="white" stroke="#E8E0D0" strokeWidth="1.5" />
                {/* Pillow shading */}
                <ellipse cx="285" cy="321" rx="55" ry="18" fill="rgba(0,0,0,0.02)" />
                <ellipse cx="605" cy="321" rx="55" ry="18" fill="rgba(0,0,0,0.02)" />

                {/* Bed legs */}
                <rect x="190" y="425" width="20" height="25" rx="3" fill="#6B3310" />
                <rect x="690" y="425" width="20" height="25" rx="3" fill="#6B3310" />

                {/* Bed shadow */}
                <ellipse cx="450" cy="450" rx="280" ry="10" fill="rgba(0,0,0,0.06)" />
            </g>

            {/* === BEDSIDE TABLE (right) === */}
            <g data-object-id="bedside-table" transform="translate(740, 310)">
                {/* Table body */}
                <rect x="0" y="0" width="70" height="120" rx="4" fill="#8B7355" stroke="#6B5335" strokeWidth="1.5" />
                {/* Drawer */}
                <rect x="5" y="10" width="60" height="40" rx="3" fill="#7A6548" stroke="#5C4A30" strokeWidth="1" />
                <circle cx="35" cy="30" r="3" fill="#A28B6D" />
                <rect x="5" y="60" width="60" height="40" rx="3" fill="#7A6548" stroke="#5C4A30" strokeWidth="1" />
                <circle cx="35" cy="80" r="3" fill="#A28B6D" />
                {/* Table top */}
                <rect x="-5" y="-6" width="80" height="10" rx="3" fill="#9B8565" stroke="#6B5335" strokeWidth="1" />
                {/* Lamp on table */}
                <rect x="22" y="-30" width="26" height="24" rx="2" fill="#F5E6C0" stroke="#D4C4A0" strokeWidth="1" />
                <rect x="30" y="-50" width="10" height="22" rx="2" fill="#C9B48E" />
                <ellipse cx="35" cy="-52" rx="18" ry="10" fill="#FFF5E0" stroke="#E8D5B7" strokeWidth="1" />
            </g>

            {/* === MEDICINE CABINET (wall, above bedside table) === */}
            <g data-object-id="medicine-cabinet" transform="translate(740, 140)">
                <rect x="0" y="0" width="80" height="90" rx="4" fill="white" stroke="#D0D0D0" strokeWidth="2" />
                {/* Glass panel */}
                <rect x="8" y="8" width="64" height="74" rx="2" fill="#F0F8FF" stroke="#C8D8E8" strokeWidth="1" />
                {/* Shelves */}
                <line x1="10" y1="35" x2="70" y2="35" stroke="#D0D0D0" strokeWidth="1" />
                <line x1="10" y1="60" x2="70" y2="60" stroke="#D0D0D0" strokeWidth="1" />
                {/* Medicine bottles */}
                <rect x="14" y="14" width="12" height="18" rx="2" fill="#82C882" opacity="0.7" />
                <rect x="30" y="16" width="12" height="16" rx="2" fill="#6BA3D6" opacity="0.7" />
                <rect x="48" y="12" width="12" height="20" rx="2" fill="#E88E8E" opacity="0.7" />
                <rect x="16" y="40" width="14" height="16" rx="2" fill="#F0C060" opacity="0.7" />
                <rect x="36" y="42" width="14" height="14" rx="2" fill="#B8A0D0" opacity="0.7" />
                {/* Lock icon */}
                <circle cx="76" cy="45" r="6" fill="none" stroke="#999" strokeWidth="1.5" />
                <rect x="73" y="45" width="6" height="6" rx="1" fill="#999" />
                {/* Handle */}
                <rect x="68" y="38" width="5" height="14" rx="2" fill="#BBBBBB" />
            </g>

            {/* === ALMIRAH (left wall) === */}
            <g data-object-id="almirah" transform="translate(30, 120)">
                {/* Almirah body */}
                <rect x="0" y="0" width="130" height="310" rx="4" fill="#C0C0C0" stroke="#A0A0A0" strokeWidth="2" />
                {/* Three doors */}
                <rect x="5" y="8" width="38" height="290" rx="2" fill="#B0B0B0" stroke="#999" strokeWidth="1" />
                <rect x="47" y="8" width="36" height="290" rx="2" fill="#B0B0B0" stroke="#999" strokeWidth="1" />
                <rect x="87" y="8" width="38" height="290" rx="2" fill="#B0B0B0" stroke="#999" strokeWidth="1" />
                {/* Door handles */}
                <circle cx="38" cy="155" r="4" fill="#888" />
                <circle cx="78" cy="155" r="4" fill="#888" />
                <circle cx="92" cy="155" r="4" fill="#888" />
                {/* Top ventilation slats */}
                {[20, 28, 36].map((y, i) => (
                    <line key={i} x1="10" y1={y} x2="35" y2={y} stroke="#A0A0A0" strokeWidth="1" opacity="0.5" />
                ))}
                {/* Almirah shadow */}
                <rect x="130" y="10" width="8" height="300" fill="rgba(0,0,0,0.04)" rx="2" />
            </g>

            {/* === WALL CLOCK (Ajanta) === */}
            <g data-object-id="wall-clock" transform="translate(450, 80)">
                {/* Wooden frame */}
                <circle cx="0" cy="0" r="52" fill="#8B6540" stroke="#6B4520" strokeWidth="3" />
                {/* Clock face */}
                <circle cx="0" cy="0" r="45" fill="#FAFAF5" stroke="#E0D8C8" strokeWidth="1" />
                {/* Hour markers */}
                {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle, i) => (
                    <line
                        key={i}
                        x1={Math.cos((angle - 90) * Math.PI / 180) * 36}
                        y1={Math.sin((angle - 90) * Math.PI / 180) * 36}
                        x2={Math.cos((angle - 90) * Math.PI / 180) * 42}
                        y2={Math.sin((angle - 90) * Math.PI / 180) * 42}
                        stroke="#4A3A2A"
                        strokeWidth={angle % 90 === 0 ? 3 : 1.5}
                        strokeLinecap="round"
                    />
                ))}
                {/* Hour hand */}
                <line x1="0" y1="0" x2="14" y2="-20" stroke="#2A1A0A" strokeWidth="3" strokeLinecap="round" />
                {/* Minute hand */}
                <line x1="0" y1="0" x2="-6" y2="-32" stroke="#2A1A0A" strokeWidth="2" strokeLinecap="round" />
                <circle cx="0" cy="0" r="3" fill="#2A1A0A" />
            </g>

            {/* === SMALL FRAMED PHOTO on wall === */}
            <g transform="translate(360, 170)">
                <rect x="0" y="0" width="60" height="50" rx="3" fill="white" stroke="#C9B48E" strokeWidth="2" />
                <rect x="6" y="6" width="48" height="38" rx="2" fill="#E8D8C8" />
                {/* Stick figure family */}
                <circle cx="22" cy="18" r="5" fill="#C8B8A0" />
                <circle cx="38" cy="18" r="5" fill="#C8B8A0" />
                <line x1="22" y1="23" x2="22" y2="36" stroke="#C8B8A0" strokeWidth="1.5" />
                <line x1="38" y1="23" x2="38" y2="36" stroke="#C8B8A0" strokeWidth="1.5" />
            </g>

            {/* === WARM AMBIENT GLOW === */}
            <ellipse cx="770" cy="280" rx="80" ry="60" fill="rgba(255, 240, 200, 0.1)" />
        </svg>
    );
}
