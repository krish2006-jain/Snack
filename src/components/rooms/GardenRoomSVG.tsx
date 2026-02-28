export default function GardenRoomSVG({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            viewBox="0 0 1000 600"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="xMidYMid slice"
            style={{ width: '100%', height: '100%', display: 'block' }}
        >
            {/* === SKY === */}
            <defs>
                <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#A8D8EA" />
                    <stop offset="60%" stopColor="#C8E6F0" />
                    <stop offset="100%" stopColor="#D8F0E8" />
                </linearGradient>
                <linearGradient id="grass" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7DB86A" />
                    <stop offset="100%" stopColor="#5A9C48" />
                </linearGradient>
                <linearGradient id="path-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#D4C4A0" />
                    <stop offset="100%" stopColor="#C8B890" />
                </linearGradient>
            </defs>

            {/* Sky */}
            <rect x="0" y="0" width="1000" height="320" fill="url(#sky)" />

            {/* Clouds */}
            <g opacity="0.6">
                <ellipse cx="150" cy="60" rx="70" ry="25" fill="white" />
                <ellipse cx="190" cy="50" rx="50" ry="20" fill="white" />
                <ellipse cx="120" cy="55" rx="40" ry="18" fill="white" />
            </g>
            <g opacity="0.4">
                <ellipse cx="700" cy="80" rx="60" ry="22" fill="white" />
                <ellipse cx="740" cy="72" rx="45" ry="18" fill="white" />
            </g>
            <g opacity="0.3">
                <ellipse cx="450" cy="40" rx="50" ry="16" fill="white" />
                <ellipse cx="480" cy="35" rx="35" ry="14" fill="white" />
            </g>

            {/* Sun */}
            <circle cx="850" cy="80" r="50" fill="#FDE68A" opacity="0.7" />
            <circle cx="850" cy="80" r="35" fill="#FCD34D" opacity="0.5" />

            {/* === GRASS GROUND === */}
            <rect x="0" y="300" width="1000" height="300" fill="url(#grass)" />
            {/* Grass texture lines */}
            <path d="M0 320 Q250 310 500 325 Q750 340 1000 315" fill="none" stroke="#6AA858" strokeWidth="1.5" opacity="0.4" />
            <path d="M0 360 Q200 350 400 365 Q700 380 1000 355" fill="none" stroke="#6AA858" strokeWidth="1" opacity="0.3" />

            {/* === GARDEN PATH (winding) === */}
            <path d="M500 600 Q480 500 460 440 Q440 380 420 340 Q410 310 430 290" fill="url(#path-grad)" stroke="#B8A880" strokeWidth="2" />
            <path d="M500 600 Q530 500 520 440 Q510 380 495 340 Q485 310 490 290" fill="url(#path-grad)" stroke="#B8A880" strokeWidth="2" />
            {/* Path stones */}
            <ellipse cx="478" cy="550" rx="20" ry="8" fill="#C8B898" stroke="#B8A880" strokeWidth="1" opacity="0.5" />
            <ellipse cx="472" cy="500" rx="18" ry="7" fill="#C8B898" stroke="#B8A880" strokeWidth="1" opacity="0.5" />
            <ellipse cx="465" cy="450" rx="16" ry="6" fill="#C8B898" stroke="#B8A880" strokeWidth="1" opacity="0.5" />

            {/* === FENCE (back) === */}
            <g opacity="0.6">
                {[...Array(20)].map((_, i) => (
                    <g key={i}>
                        <rect x={i * 50 + 5} y="260" width="8" height="60" rx="2" fill="#A08060" />
                        <polygon points={`${i * 50 + 5},260 ${i * 50 + 9},250 ${i * 50 + 13},260`} fill="#A08060" />
                    </g>
                ))}
                {/* Horizontal rails */}
                <rect x="0" y="278" width="1000" height="6" rx="2" fill="#907050" />
                <rect x="0" y="300" width="1000" height="6" rx="2" fill="#907050" />
            </g>

            {/* === TREE (left) === */}
            <g data-object-id="tree" transform="translate(80, 140)">
                {/* Trunk */}
                <rect x="25" y="80" width="30" height="120" rx="4" fill="#6B4520" stroke="#5A3810" strokeWidth="1" />
                {/* Trunk texture */}
                <path d="M30 90 Q40 100 35 110 Q45 120 38 140" fill="none" stroke="#5A3810" strokeWidth="1" opacity="0.4" />
                {/* Canopy layers */}
                <ellipse cx="40" cy="50" rx="65" ry="50" fill="#4A8C38" />
                <ellipse cx="30" cy="35" rx="50" ry="38" fill="#58A048" />
                <ellipse cx="55" cy="40" rx="45" ry="35" fill="#4A9040" />
                <ellipse cx="40" cy="25" rx="35" ry="28" fill="#60A850" />
                {/* Leaf highlights */}
                <ellipse cx="25" cy="30" rx="15" ry="12" fill="#6BB858" opacity="0.5" />
                <ellipse cx="60" cy="35" rx="12" ry="10" fill="#6BB858" opacity="0.4" />
            </g>

            {/* === IRON BENCH === */}
            <g data-object-id="bench" transform="translate(230, 370)">
                {/* Bench seat */}
                <rect x="0" y="0" width="200" height="14" rx="3" fill="#6B5335" stroke="#5C4225" strokeWidth="2" />
                {/* Bench back */}
                <rect x="5" y="-45" width="190" height="12" rx="3" fill="#6B5335" stroke="#5C4225" strokeWidth="2" />
                <rect x="5" y="-28" width="190" height="12" rx="3" fill="#6B5335" stroke="#5C4225" strokeWidth="2" />
                {/* Bench back uprights */}
                <rect x="10" y="-50" width="8" height="52" rx="2" fill="#5C4225" />
                <rect x="182" y="-50" width="8" height="52" rx="2" fill="#5C4225" />
                {/* Armrests */}
                <path d="M0 -5 Q-10 -15 -5 -35 L10 -48" fill="none" stroke="#5C4225" strokeWidth="4" strokeLinecap="round" />
                <path d="M200 -5 Q210 -15 205 -35 L190 -48" fill="none" stroke="#5C4225" strokeWidth="4" strokeLinecap="round" />
                {/* Legs */}
                <rect x="15" y="12" width="8" height="40" rx="2" fill="#5C4225" />
                <rect x="177" y="12" width="8" height="40" rx="2" fill="#5C4225" />
                {/* Leg cross bars */}
                <line x1="19" y1="35" x2="181" y2="35" stroke="#5C4225" strokeWidth="3" />
                {/* Shadow */}
                <ellipse cx="100" cy="55" rx="110" ry="8" fill="rgba(0,0,0,0.08)" />
            </g>

            {/* === MARIGOLD PATCH === */}
            <g data-object-id="marigolds" transform="translate(550, 340)">
                {/* Flower bed border */}
                <ellipse cx="120" cy="60" rx="140" ry="35" fill="#5A8C40" stroke="#4A7C30" strokeWidth="2" />
                <ellipse cx="120" cy="55" rx="130" ry="28" fill="#68A050" />
                {/* Marigold flowers */}
                {[
                    { x: 40, y: 30, color: '#F59E0B', size: 14 },
                    { x: 70, y: 20, color: '#EF4444', size: 12 },
                    { x: 100, y: 35, color: '#F59E0B', size: 16 },
                    { x: 130, y: 18, color: '#F97316', size: 13 },
                    { x: 155, y: 32, color: '#EF4444', size: 14 },
                    { x: 185, y: 25, color: '#F59E0B', size: 12 },
                    { x: 60, y: 48, color: '#F97316', size: 11 },
                    { x: 110, y: 50, color: '#F59E0B', size: 13 },
                    { x: 160, y: 46, color: '#EF4444', size: 12 },
                ].map((f, i) => (
                    <g key={i} transform={`translate(${f.x}, ${f.y})`}>
                        {/* Stem */}
                        <line x1="0" y1={f.size} x2="0" y2={f.size + 18} stroke="#4A7C30" strokeWidth="2" />
                        {/* Leaves */}
                        <ellipse cx="-6" cy={f.size + 10} rx="5" ry="3" fill="#5A9040" transform={`rotate(-30 -6 ${f.size + 10})`} />
                        <ellipse cx="6" cy={f.size + 14} rx="5" ry="3" fill="#5A9040" transform={`rotate(30 6 ${f.size + 14})`} />
                        {/* Flower */}
                        <circle cx="0" cy="0" r={f.size} fill={f.color} />
                        <circle cx="0" cy="0" r={f.size * 0.6} fill={f.color} opacity="0.8" />
                        <circle cx="0" cy="0" r={f.size * 0.3} fill="#FDE68A" />
                    </g>
                ))}
            </g>

            {/* === WATERING CAN === */}
            <g transform="translate(470, 410)">
                {/* Body */}
                <rect x="0" y="0" width="40" height="30" rx="4" fill="#EF4444" stroke="#DC2626" strokeWidth="1.5" />
                {/* Spout */}
                <line x1="40" y1="5" x2="60" y2="-10" stroke="#DC2626" strokeWidth="3" strokeLinecap="round" />
                {/* Handle */}
                <path d="M5 0 Q10 -15 35 0" fill="none" stroke="#DC2626" strokeWidth="3" strokeLinecap="round" />
            </g>

            {/* === BIRDHOUSE (on tree) === */}
            <g transform="translate(90, 160)">
                <rect x="0" y="0" width="24" height="20" rx="2" fill="#D4A855" stroke="#B8902A" strokeWidth="1" />
                <polygon points="0,0 12,-10 24,0" fill="#8B4513" stroke="#6B3310" strokeWidth="1" />
                <circle cx="12" cy="10" r="4" fill="#6B3310" />
                <rect x="10" y="18" width="4" height="8" fill="#B8902A" />
            </g>

            {/* === POTTED PLANTS along fence === */}
            {[700, 780, 860].map((x, i) => (
                <g key={i} transform={`translate(${x}, 310)`}>
                    {/* Pot */}
                    <path d={`M-8 0 L-12 30 L12 30 L8 0Z`} fill="#CC7755" stroke="#AA5533" strokeWidth="1" />
                    <rect x="-10" y="-2" width="20" height="5" rx="2" fill="#CC7755" stroke="#AA5533" strokeWidth="1" />
                    {/* Plant */}
                    <ellipse cx="0" cy="-12" rx="14" ry="12" fill="#58A048" />
                    <ellipse cx="-4" cy="-18" rx="10" ry="8" fill="#68B058" />
                    <ellipse cx="5" cy="-20" rx="8" ry="7" fill="#60A850" />
                </g>
            ))}

            {/* === BUTTERFLY === */}
            <g transform="translate(600, 200)" opacity="0.7">
                <ellipse cx="-8" cy="0" rx="8" ry="5" fill="#F97316" transform="rotate(-20)" />
                <ellipse cx="8" cy="0" rx="8" ry="5" fill="#F97316" transform="rotate(20)" />
                <rect x="-1" y="-6" width="2" height="12" rx="1" fill="#5C3A1E" />
            </g>

            {/* === SUN RAYS (subtle) === */}
            <circle cx="850" cy="80" r="120" fill="rgba(253, 230, 138, 0.08)" />
        </svg>
    );
}
