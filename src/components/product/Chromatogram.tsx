/** Stylized batch-verification chromatogram (from the design prototype). */
export function Chromatogram({ compound }: { compound: string }) {
  const label = compound.length > 14 ? compound.slice(0, 14) + "…" : compound;
  return (
    <svg
      viewBox="0 0 560 300"
      className="mt-3 h-auto w-full rounded-[10px] bg-[#F2F6FA]"
    >
      <line x1="40" y1="20" x2="40" y2="260" stroke="#C3CFDA" strokeWidth="1" />
      <line x1="40" y1="260" x2="540" y2="260" stroke="#C3CFDA" strokeWidth="1" />
      {[212, 164, 116, 68].map((y) => (
        <line
          key={y}
          x1="40"
          y1={y}
          x2="540"
          y2={y}
          stroke="#DCE5ED"
          strokeWidth="1"
          strokeDasharray="3 4"
        />
      ))}
      {[
        [264, "0"],
        [216, "25"],
        [168, "50"],
        [120, "75"],
        [72, "100"],
      ].map(([y, t]) => (
        <text
          key={t}
          x="32"
          y={y}
          fontSize="10"
          fill="#7A8694"
          textAnchor="end"
          fontFamily="Montserrat"
        >
          {t}
        </text>
      ))}
      <text
        x="14"
        y="150"
        fontSize="10"
        fill="#7A8694"
        fontFamily="Montserrat"
        transform="rotate(-90 14 150)"
        textAnchor="middle"
      >
        mAU
      </text>
      {[
        [40, "0"],
        [140, "2"],
        [240, "4"],
        [340, "6"],
        [440, "8"],
        [540, "10"],
      ].map(([x, t]) => (
        <text
          key={x}
          x={x}
          y="278"
          fontSize="10"
          fill="#7A8694"
          fontFamily="Montserrat"
          textAnchor="middle"
        >
          {t}
        </text>
      ))}
      <text
        x="290"
        y="296"
        fontSize="10"
        fill="#7A8694"
        fontFamily="Montserrat"
        textAnchor="middle"
        letterSpacing="1.5"
      >
        RETENTION TIME (MIN)
      </text>
      <line
        x1="40"
        y1="56"
        x2="540"
        y2="56"
        stroke="#4E9E33"
        strokeWidth="1.5"
        strokeDasharray="6 5"
      />
      <text
        x="536"
        y="48"
        fontSize="10.5"
        fontWeight="700"
        fill="#4E9E33"
        fontFamily="Montserrat"
        textAnchor="end"
        letterSpacing="1"
      >
        ≥98% THRESHOLD
      </text>
      <polyline
        points="40,252 46,251 50,214 54,251 70,247 90,238 105,214 120,186 135,166 145,172 152,155 160,166 168,148 176,160 184,142 192,155 200,138 210,150 220,142 230,156 240,150 250,163 262,172 274,186 288,201 305,220 322,236 340,246 360,250 380,251 402,250 420,247 428,250 450,251 480,252 540,252"
        fill="none"
        stroke="#8D43B8"
        strokeWidth="1.6"
        opacity=".85"
      />
      <polyline
        points="40,252 300,252 370,251 396,249 406,238 412,204 416,140 419,84 422,58 425,84 429,146 434,210 440,242 448,250 470,251 540,252"
        fill="none"
        stroke="#1486C9"
        strokeWidth="2.4"
      />
      <text
        x="422"
        y="44"
        fontSize="11"
        fontWeight="700"
        fill="#1486C9"
        fontFamily="Montserrat"
        textAnchor="middle"
      >
        {label}
      </text>
      <text
        x="422"
        y="30"
        fontSize="9"
        fill="#5A6572"
        fontFamily="Montserrat"
        textAnchor="middle"
      >
        t = 8.1 min
      </text>
    </svg>
  );
}
