"use client";

import React from "react";
import { motion, useReducedMotion } from "motion/react";

const X = Math.cos(Math.PI / 6);
const Y = 0.5;

const PAPER = "var(--card)";
const STONE = "var(--muted)";
const STONE_SOFT = "color-mix(in oklch, var(--muted) 55%, var(--card))";
const LINE = "var(--border)";
const EDGE = "color-mix(in oklch, var(--foreground) 24%, var(--border))";
const INK = "var(--foreground)";
const MUTED = "var(--muted-foreground)";
const MINT = "var(--mint)";
const KEY = "color-mix(in oklch, var(--mint) 55%, var(--foreground))";

type IsoPoint = [number, number, number?];

const project = (x: number, y: number, z = 0) => {
  return [(x - y) * X, (x + y) * Y - z] as const;
};

const polygon = (points: IsoPoint[]) =>
  points.map(([x, y, z]) => project(x, y, z ?? 0).join(",")).join(" ");

const topPlaneTransform = (x: number, y: number, z: number) => {
  const [ox, oy] = project(x, y, z);
  return `matrix(${X} ${Y} ${-X} ${Y} ${ox} ${oy})`;
};

const frontPlaneTransform = (x: number, y: number, z: number) => {
  const [ox, oy] = project(x, y, z);
  return `matrix(${X} ${Y} 0 1 ${ox} ${oy})`;
};

type IsoBoxProps = {
  x: number;
  y: number;
  w: number;
  d: number;
  h: number;
  z?: number;
  topFill?: string;
  frontFill?: string;
  sideFill?: string;
  stroke?: string;
  strokeWidth?: number;
  className?: string;
};

const IsoBox = ({
  x,
  y,
  w,
  d,
  h,
  z = 0,
  topFill = PAPER,
  frontFill = STONE,
  sideFill = STONE_SOFT,
  stroke = EDGE,
  strokeWidth = 1,
  className,
}: IsoBoxProps) => {
  const top: IsoPoint[] = [
    [x, y, z + h],
    [x + w, y, z + h],
    [x + w, y + d, z + h],
    [x, y + d, z + h],
  ];
  const front: IsoPoint[] = [
    [x, y + d, z],
    [x + w, y + d, z],
    [x + w, y + d, z + h],
    [x, y + d, z + h],
  ];
  const side: IsoPoint[] = [
    [x + w, y, z],
    [x + w, y + d, z],
    [x + w, y + d, z + h],
    [x + w, y, z + h],
  ];

  const edge = {
    stroke,
    strokeWidth,
    strokeLinejoin: "round",
    vectorEffect: "non-scaling-stroke",
  } as const;

  return (
    <g className={className}>
      <polygon points={polygon(side)} fill={sideFill} {...edge} />
      <polygon points={polygon(front)} fill={frontFill} {...edge} />
      <polygon points={polygon(top)} fill={topFill} {...edge} />
    </g>
  );
};

type IsoFlatProps = {
  x: number;
  y: number;
  w: number;
  d: number;
  z?: number;
  fill?: string;
  fillOpacity?: number;
  stroke?: string;
  strokeOpacity?: number;
  strokeWidth?: number;
  strokeDasharray?: string;
};

const IsoFlat = ({
  x,
  y,
  w,
  d,
  z = 0,
  fill = "transparent",
  fillOpacity,
  stroke = LINE,
  strokeOpacity,
  strokeWidth = 1,
  strokeDasharray,
}: IsoFlatProps) => (
  <polygon
    points={polygon([
      [x, y, z],
      [x + w, y, z],
      [x + w, y + d, z],
      [x, y + d, z],
    ])}
    fill={fill}
    fillOpacity={fillOpacity}
    stroke={stroke}
    strokeOpacity={strokeOpacity}
    strokeWidth={strokeWidth}
    strokeDasharray={strokeDasharray}
    strokeLinejoin="round"
    vectorEffect="non-scaling-stroke"
  />
);

const TopPlane = ({
  x,
  y,
  z,
  children,
}: {
  x: number;
  y: number;
  z: number;
  children: React.ReactNode;
}) => <g transform={topPlaneTransform(x, y, z)}>{children}</g>;

const FrontPlane = ({
  x,
  y,
  z,
  children,
}: {
  x: number;
  y: number;
  z: number;
  children: React.ReactNode;
}) => <g transform={frontPlaneTransform(x, y, z)}>{children}</g>;

const IsoShadow = ({
  cx,
  cy,
  rx,
  ry,
  opacity = 0.05,
}: {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  opacity?: number;
}) => (
  <ellipse
    cx={cx}
    cy={cy}
    rx={rx}
    ry={ry}
    fill="#000"
    opacity={opacity}
    style={{ filter: "blur(5px)" }}
  />
);

const Label = ({
  x,
  y,
  children,
  tone = "muted",
  className,
}: {
  x: number;
  y: number;
  children: React.ReactNode;
  tone?: "muted" | "mint";
  className?: string;
}) => (
  <text
    x={x}
    y={y}
    textAnchor="middle"
    fontSize={8}
    fontWeight={500}
    letterSpacing="0.18em"
    fill={tone === "mint" ? MINT : MUTED}
    opacity={tone === "mint" ? 0.9 : 0.75}
    className={className}
  >
    {children}
  </text>
);

const MonoLabel = ({
  x,
  y,
  children,
  anchor = "middle",
  className,
}: {
  x: number;
  y: number;
  children: React.ReactNode;
  anchor?: "start" | "middle" | "end";
  className?: string;
}) => (
  <text
    x={x}
    y={y}
    textAnchor={anchor}
    fontFamily="var(--font-mono)"
    fontSize={7.5}
    letterSpacing="0.05em"
    fill={MUTED}
    opacity={0.8}
    className={className}
  >
    {children}
  </text>
);

const useReduced = () => useReducedMotion() ?? false;

const useLoop = (callback: () => void, delay: number) => {
  const reduced = useReduced();
  const saved = React.useRef(callback);
  saved.current = callback;

  React.useEffect(() => {
    if (reduced) {
      return;
    }

    const id = window.setInterval(() => saved.current(), delay);
    return () => window.clearInterval(id);
  }, [delay, reduced]);
};

const Mote = ({
  x,
  y,
  delay = 0,
  pathX,
  pathY,
  duration = 3,
}: {
  x: number;
  y: number;
  delay?: number;
  pathX: number[];
  pathY: number[];
  duration?: number;
}) => {
  const reduced = useReduced();

  if (reduced) {
    return (
      <rect
        x={x - 2.5}
        y={y - 2.5}
        width={5}
        height={5}
        rx={1}
        fill={MINT}
        opacity={0.8}
        transform={`rotate(45 ${x} ${y})`}
      />
    );
  }

  return (
    <motion.g
      initial={{ x: 0, y: 0, opacity: 0 }}
      animate={{ x: pathX, y: pathY, opacity: [0, 1, 1, 0] }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <rect
        x={x - 2.5}
        y={y - 2.5}
        width={5}
        height={5}
        rx={1}
        fill={MINT}
        transform={`rotate(45 ${x} ${y})`}
      />
    </motion.g>
  );
};

const ServerRack = ({
  w = 34,
  d = 26,
  h = 60,
}: {
  w?: number;
  d?: number;
  h?: number;
}) => {
  const rows = 4;

  return (
    <g>
      <IsoBox
        x={0}
        y={0}
        w={w}
        d={d}
        h={h}
        topFill={STONE_SOFT}
        frontFill={PAPER}
        sideFill={STONE}
      />
      <FrontPlane x={4} y={d} z={h - 7}>
        {Array.from({ length: rows }).map((_, index) => (
          <g key={index}>
            <rect
              x={0}
              y={index * 11}
              width={w - 8}
              height={7.5}
              rx={1.4}
              fill={INK}
              opacity={0.05}
            />
            <rect
              x={3}
              y={index * 11 + 2.2}
              width={w - 15}
              height={1.4}
              rx={0.7}
              fill={INK}
              opacity={0.16}
            />
            <circle
              cx={w - 10.5}
              cy={index * 11 + 3.8}
              r={1.1}
              fill={MINT}
              className="motion-safe:animate-pulse"
              style={{ animationDelay: `${index * 0.3}s` }}
            />
          </g>
        ))}
      </FrontPlane>
    </g>
  );
};

const Laptop = () => (
  <g>
    <IsoShadow cx={16} cy={42} rx={47} ry={14} />
    <IsoBox
      x={0}
      y={0}
      w={56}
      d={34}
      h={3}
      topFill={STONE_SOFT}
      frontFill={STONE}
      sideFill={PAPER}
    />
    <TopPlane x={5} y={7} z={3.1}>
      {Array.from({ length: 4 }).map((_, row) =>
        Array.from({ length: 10 }).map((_, col) => (
          <rect
            key={`${row}-${col}`}
            x={2 + col * 4.5}
            y={2 + row * 3.6}
            width={3.7}
            height={2.5}
            rx={0.6}
            fill={INK}
            opacity={0.07}
          />
        )),
      )}
      <rect
        x={18}
        y={24}
        width={19}
        height={6.5}
        rx={1}
        fill={INK}
        opacity={0.05}
      />
    </TopPlane>
    <IsoBox
      x={0}
      y={0}
      z={3}
      w={56}
      d={3}
      h={30}
      topFill={PAPER}
      frontFill={PAPER}
      sideFill={STONE_SOFT}
    />
    <FrontPlane x={0} y={3.02} z={33}>
      <rect width={56} height={30} fill={STONE} opacity={0.55} />
      <rect width={56} height={5} fill={PAPER} opacity={0.92} />
      {[3, 6, 9].map((cx) => (
        <circle key={cx} cx={cx} cy={2.5} r={0.8} fill={MUTED} opacity={0.5} />
      ))}
      <rect
        x={14}
        y={1.4}
        width={26}
        height={2.2}
        rx={1.1}
        fill={MINT}
        opacity={0.28}
      />
      <rect x={0} y={5} width={14} height={25} fill={PAPER} opacity={0.72} />
      {[8, 13, 18].map((cy) => (
        <rect
          key={cy}
          x={3}
          y={cy}
          width={8}
          height={1.5}
          rx={0.75}
          fill={INK}
          opacity={0.12}
        />
      ))}
      <rect
        x={18}
        y={9}
        width={31}
        height={3}
        rx={1.5}
        fill={INK}
        opacity={0.16}
      />
      <rect
        x={18}
        y={14}
        width={24}
        height={2}
        rx={1}
        fill={MUTED}
        opacity={0.45}
      />
      <rect
        x={18}
        y={18}
        width={29}
        height={2}
        rx={1}
        fill={MUTED}
        opacity={0.32}
      />
      <rect
        x={18}
        y={23}
        width={15}
        height={3.5}
        rx={1.5}
        fill={MINT}
        opacity={0.55}
      />
    </FrontPlane>
  </g>
);

export const EncryptionIllustration = () => (
  <svg
    viewBox="0 0 600 260"
    preserveAspectRatio="xMidYMid meet"
    className="h-full w-full"
    aria-hidden="true"
  >
    <path
      d="M 178 111 C 220 99, 252 94, 289 97"
      fill="none"
      stroke={LINE}
      strokeWidth={1}
      strokeDasharray="2 5"
      vectorEffect="non-scaling-stroke"
    />
    <path
      d="M 315 102 C 352 110, 387 118, 423 135"
      fill="none"
      stroke={LINE}
      strokeWidth={1}
      strokeDasharray="2 5"
      vectorEffect="non-scaling-stroke"
    />

    <Mote x={180} y={111} pathX={[0, 55, 108]} pathY={[0, -8, -14]} />
    <Mote
      x={320}
      y={104}
      delay={1.4}
      pathX={[0, 50, 100]}
      pathY={[0, 12, 31]}
    />

    <g transform="translate(104 94) scale(1.4)">
      <Laptop />
    </g>

    <g transform="translate(300 108) scale(1.85)">
      <IsoShadow cx={0} cy={8} rx={20} ry={6} opacity={0.06} />
      <polygon
        points={polygon([
          [2, 2, 26],
          [18, 2, 26],
          [18, 18, 26],
          [2, 18, 26],
        ])}
        fill={MINT}
        opacity={0.2}
        stroke={MINT}
        strokeWidth={0.9}
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      <polygon
        points={polygon([
          [2, 18, 26],
          [18, 18, 26],
          [10, 10, 4],
        ])}
        fill={MINT}
        opacity={0.5}
        stroke={MINT}
        strokeWidth={0.9}
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      <polygon
        points={polygon([
          [18, 2, 26],
          [18, 18, 26],
          [10, 10, 4],
        ])}
        fill={MINT}
        opacity={0.35}
        stroke={MINT}
        strokeWidth={0.9}
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      <path
        d={`M ${project(10, 10, 26).join(" ")} L ${project(10, 10, 4).join(" ")}`}
        fill="none"
        stroke={MINT}
        strokeWidth={0.75}
        opacity={0.7}
        vectorEffect="non-scaling-stroke"
      />
      <text
        y={26}
        textAnchor="middle"
        fontFamily="var(--font-mono)"
        fontSize={6}
        letterSpacing="0.08em"
        fill={MUTED}
        opacity={0.85}
      >
        AES-256-GCM
      </text>
    </g>

    <g transform="translate(446 148) scale(1.32)">
      <IsoShadow cx={16} cy={34} rx={29} ry={9} />
      <ServerRack />
    </g>

    <Label x={146} y={184} className="hidden lg:block">
      CLIENT
    </Label>
    <Label x={465} y={208} className="hidden lg:block">
      SERVER
    </Label>
    <MonoLabel x={378} y={156} className="hidden lg:block">
      ciphertext
    </MonoLabel>
  </svg>
);

export const AutofillIllustration = () => {
  const reduced = useReduced();
  const [active, setActive] = React.useState(true);

  React.useEffect(() => {
    if (reduced) {
      setActive(true);
      return;
    }

    const id = window.setInterval(() => setActive((prev) => !prev), 3800);
    return () => window.clearInterval(id);
  }, [reduced]);

  const transition = {
    duration: 1.1,
    ease: [0.22, 1, 0.36, 1] as const,
  };

  return (
    <svg
      viewBox="0 0 360 250"
      preserveAspectRatio="xMidYMid meet"
      className="h-full w-full"
      aria-hidden="true"
    >
      <path
        d="M 104 180 C 134 170, 170 160, 210 148"
        fill="none"
        stroke={MINT}
        strokeWidth={1}
        strokeDasharray="2 6"
        opacity={0.55}
        vectorEffect="non-scaling-stroke"
      />

      <motion.g
        animate={
          active ? { x: 0, y: 0, opacity: 1 } : { x: 0, y: 10, opacity: 0.55 }
        }
        transition={transition}
      >
        <g transform="translate(64 170) scale(1.4)">
          <IsoShadow cx={14} cy={22} rx={22} ry={7} opacity={0.05} />
          <IsoBox
            x={0}
            y={0}
            w={30}
            d={18}
            h={2}
            topFill={PAPER}
            frontFill={STONE}
            sideFill={STONE_SOFT}
          />
          <TopPlane x={0} y={0} z={2}>
            <rect x={0} y={0} width={30} height={5} fill={MINT} opacity={0.5} />
            <circle
              cx={6}
              cy={11}
              r={2.1}
              fill="none"
              stroke={KEY}
              strokeWidth={0.9}
            />
            <path
              d="M 8 11 H 17 M 14 11 V 13.5 M 17 11 V 13"
              fill="none"
              stroke={KEY}
              strokeWidth={0.9}
              strokeLinecap="round"
            />
            <rect
              x={21}
              y={9}
              width={5}
              height={1.4}
              rx={0.7}
              fill={INK}
              opacity={0.18}
            />
          </TopPlane>
        </g>
      </motion.g>

      <g transform="translate(156 138) scale(1.03)">
        <IsoShadow cx={20} cy={48} rx={50} ry={15} opacity={0.045} />
        <IsoBox
          x={0}
          y={0}
          w={150}
          d={30}
          h={4}
          topFill={STONE_SOFT}
          frontFill={STONE}
          sideFill={PAPER}
        />
        <IsoBox
          x={0}
          y={2}
          z={4}
          w={140}
          d={3}
          h={100}
          topFill={PAPER}
          frontFill={PAPER}
          sideFill={STONE}
        />
        <FrontPlane x={0} y={5.02} z={104}>
          <rect width={140} height={100} fill={PAPER} />
          <rect
            width={140}
            height={14}
            fill={STONE}
            opacity={0.7}
            stroke={LINE}
            strokeWidth={0.75}
            vectorEffect="non-scaling-stroke"
          />
          {[6, 10, 14].map((cx) => (
            <circle
              key={cx}
              cx={cx}
              cy={7}
              r={1.2}
              fill={MUTED}
              opacity={0.45}
            />
          ))}
          <rect
            x={24}
            y={4}
            width={108}
            height={6}
            rx={3}
            fill={PAPER}
            stroke={LINE}
            strokeWidth={0.75}
            vectorEffect="non-scaling-stroke"
          />
          <circle cx={30} cy={7} r={1.2} fill={MINT} opacity={0.8} />
          <rect
            x={34}
            y={6.4}
            width={32}
            height={1.2}
            rx={0.6}
            fill={MUTED}
            opacity={0.4}
          />

          <rect
            x={10}
            y={24}
            width={56}
            height={3}
            rx={1.5}
            fill={INK}
            opacity={0.16}
          />
          <rect
            x={10}
            y={30}
            width={40}
            height={2}
            rx={1}
            fill={MUTED}
            opacity={0.35}
          />

          <rect
            x={10}
            y={40}
            width={120}
            height={16}
            rx={2.5}
            fill={STONE}
            opacity={0.45}
            stroke={LINE}
            strokeWidth={0.75}
            vectorEffect="non-scaling-stroke"
          />
          <rect
            x={14}
            y={47}
            width={48}
            height={2.4}
            rx={1.2}
            fill={INK}
            opacity={0.28}
          />

          <motion.g
            animate={{ opacity: active ? 1 : 0.25 }}
            transition={{ duration: 0.5 }}
          >
            <rect
              x={10}
              y={64}
              width={120}
              height={16}
              rx={2.5}
              fill={MINT}
              opacity={0.08}
              stroke={active ? MINT : LINE}
              strokeWidth={active ? 1 : 0.75}
              vectorEffect="non-scaling-stroke"
            />
            {Array.from({ length: 8 }).map((_, index) => (
              <circle
                key={index}
                cx={16 + index * 5}
                cy={72}
                r={2.2}
                fill={INK}
                opacity={0.62}
              />
            ))}
          </motion.g>

          <rect
            x={10}
            y={88}
            width={42}
            height={9}
            rx={2}
            fill={MINT}
            opacity={0.95}
          />
          <rect
            x={20}
            y={91.8}
            width={22}
            height={2.4}
            rx={1.2}
            fill={KEY}
            opacity={0.75}
          />
        </FrontPlane>
      </g>

      <path
        d="M 249 186 L 249 198 L 252 195 L 255 201 L 258 199 L 254 193 L 259 192 Z"
        fill={PAPER}
        stroke={INK}
        strokeWidth={1}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
};

const VaultCard = ({
  x,
  y,
  z,
  kind,
  delay,
}: {
  x: number;
  y: number;
  z: number;
  kind: "key" | "card" | "note" | "code";
  delay: number;
}) => {
  const w = 58;
  const d = 36;

  return (
    <motion.g
      animate={{ y: [0, -2.5, 0] }}
      transition={{
        duration: 5.5,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <IsoBox
        x={x}
        y={y}
        z={z}
        w={w}
        d={d}
        h={2.5}
        topFill={PAPER}
        frontFill={STONE}
        sideFill={STONE_SOFT}
      />
      <TopPlane x={x} y={y} z={z + 2.5}>
        <rect
          x={6}
          y={6}
          width={11}
          height={11}
          rx={2}
          fill={INK}
          opacity={0.05}
        />
        {kind === "key" ? (
          <g stroke={MINT} strokeWidth={0.9} strokeLinecap="round" fill="none">
            <circle cx={11.5} cy={10.5} r={2.2} />
            <path d="M 11.5 12.7 V 16.5 M 11.5 15.2 H 13.5 M 11.5 16.5 H 13" />
          </g>
        ) : null}
        {kind === "card" ? (
          <g>
            <rect
              x={7.5}
              y={8}
              width={8}
              height={6}
              rx={1}
              fill={MINT}
              opacity={0.55}
            />
            <rect
              x={7.5}
              y={10.4}
              width={8}
              height={1}
              fill={PAPER}
              opacity={0.8}
            />
          </g>
        ) : null}
        {kind === "note" ? (
          <g
            stroke={INK}
            strokeWidth={0.9}
            strokeLinecap="round"
            fill="none"
            opacity={0.35}
          >
            <path d="M 8 9 H 15 M 8 11.5 H 15 M 8 14 H 12.5" />
          </g>
        ) : null}
        {kind === "code" ? (
          <g
            stroke={MINT}
            strokeWidth={0.9}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          >
            <path d="M 9.5 9 L 7 11.5 L 9.5 14 M 13.5 9 L 16 11.5 L 13.5 14" />
          </g>
        ) : null}
        <rect
          x={22}
          y={8}
          width={26}
          height={2}
          rx={1}
          fill={INK}
          opacity={0.16}
        />
        <rect
          x={22}
          y={12.5}
          width={16}
          height={1.5}
          rx={0.75}
          fill={MUTED}
          opacity={0.35}
        />
        <rect
          x={22}
          y={17}
          width={21}
          height={1.5}
          rx={0.75}
          fill={MUTED}
          opacity={0.22}
        />
        <circle cx={50} cy={9} r={1.2} fill={MINT} opacity={0.8} />
      </TopPlane>
    </motion.g>
  );
};

export const VaultIllustration = () => (
  <svg
    viewBox="0 0 360 250"
    preserveAspectRatio="xMidYMid meet"
    className="h-full w-full"
    aria-hidden="true"
  >
    <g transform="translate(180 94) scale(1.02)">
      <IsoShadow cx={34} cy={74} rx={78} ry={24} opacity={0.045} />
      <IsoBox
        x={0}
        y={0}
        w={130}
        d={64}
        h={16}
        topFill={STONE_SOFT}
        frontFill={PAPER}
        sideFill={STONE}
      />

      <FrontPlane x={12} y={64} z={15}>
        <path
          d="M 0 4.5 H 106 M 0 9 H 106"
          fill="none"
          stroke={LINE}
          strokeWidth={0.75}
          vectorEffect="non-scaling-stroke"
        />
        <rect
          x={46}
          y={2.7}
          width={14}
          height={1.4}
          rx={0.7}
          fill={MUTED}
          opacity={0.4}
        />
        <rect
          x={46}
          y={7.2}
          width={14}
          height={1.4}
          rx={0.7}
          fill={MUTED}
          opacity={0.4}
        />
      </FrontPlane>

      <IsoBox
        x={20}
        y={64}
        z={10}
        w={90}
        d={30}
        h={6}
        topFill={PAPER}
        frontFill={STONE}
        sideFill={STONE_SOFT}
      />
      <FrontPlane x={55} y={94.02} z={15.5}>
        <rect
          x={-3}
          y={-0.5}
          width={26}
          height={2.5}
          rx={1.25}
          fill={MINT}
          opacity={0.85}
        />
      </FrontPlane>

      <VaultCard x={36} y={34} z={58} kind="note" delay={0.6} />
      <VaultCard x={30} y={48} z={50} kind="card" delay={0.3} />
      <VaultCard x={24} y={62} z={42} kind="key" delay={0} />
      <VaultCard x={58} y={44} z={64} kind="code" delay={0.9} />
    </g>
  </svg>
);

const PasswordTicker = () => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
  const [password, setPassword] = React.useState("a8F#k9!mXp2$Qz");
  const [strength, setStrength] = React.useState(92);

  useLoop(() => {
    setPassword(
      Array.from({ length: 14 })
        .map(() => chars.charAt(Math.floor(Math.random() * chars.length)))
        .join(""),
    );
    setStrength(88 + Math.floor(Math.random() * 10));
  }, 1600);

  return (
    <>
      <text
        x={180}
        y={50}
        textAnchor="middle"
        fontFamily="var(--font-mono)"
        fontSize={15}
        fontWeight={500}
        letterSpacing="0.06em"
        fill={INK}
      >
        {password}
      </text>
      <text
        x={104}
        y={66}
        fontFamily="var(--font-mono)"
        fontSize={6.5}
        letterSpacing="0.12em"
        fill={MUTED}
        opacity={0.8}
      >
        STRENGTH
      </text>
      <text
        x={256}
        y={66}
        textAnchor="end"
        fontFamily="var(--font-mono)"
        fontSize={6.5}
        letterSpacing="0.12em"
        fill={MUTED}
        opacity={0.8}
      >
        {strength}%
      </text>
      {[0, 1, 2, 3].map((index) => (
        <g key={index}>
          <rect
            x={104 + index * 39}
            y={72}
            width={35}
            height={3.5}
            rx={1.75}
            fill={STONE}
            stroke={EDGE}
            strokeWidth={0.75}
            vectorEffect="non-scaling-stroke"
          />
          <rect
            x={104 + index * 39}
            y={72}
            width={index < Math.ceil(strength / 25) ? 35 : 0}
            height={3.5}
            rx={1.75}
            fill={MINT}
          />
        </g>
      ))}
    </>
  );
};

export const GeneratorIllustration = () => {
  const reduced = useReduced();

  return (
    <svg
      viewBox="0 0 360 250"
      preserveAspectRatio="xMidYMid meet"
      className="h-full w-full"
      aria-hidden="true"
    >
      <PasswordTicker />

      <g transform="translate(152 116) scale(1.1)">
        <IsoShadow cx={52} cy={96} rx={82} ry={25} opacity={0.05} />
        <IsoBox
          x={0}
          y={0}
          w={140}
          d={76}
          h={12}
          topFill={STONE_SOFT}
          frontFill={STONE}
          sideFill={PAPER}
        />

        <IsoBox
          x={14}
          y={10}
          z={12}
          w={16}
          d={12}
          h={20}
          topFill={PAPER}
          frontFill={STONE_SOFT}
          sideFill={STONE}
        />
        <IsoBox
          x={110}
          y={10}
          z={12}
          w={16}
          d={12}
          h={20}
          topFill={PAPER}
          frontFill={STONE_SOFT}
          sideFill={STONE}
        />

        <IsoBox
          x={30}
          y={40}
          z={17}
          w={72}
          d={18}
          h={1.5}
          topFill={PAPER}
          frontFill={STONE_SOFT}
          sideFill={STONE}
        />
        <TopPlane x={30} y={40} z={18.5}>
          {Array.from({ length: 12 }).map((_, index) => (
            <rect
              key={index}
              x={4 + index * 5.4}
              y={6}
              width={3.8}
              height={1.6}
              rx={0.8}
              fill={INK}
              opacity={index % 3 === 0 ? 0.16 : 0.08}
            />
          ))}
          <rect
            x={4}
            y={10.5}
            width={38}
            height={1.4}
            rx={0.7}
            fill={MINT}
            opacity={0.45}
          />
        </TopPlane>

        <TopPlane x={0} y={0} z={12}>
          <circle
            cx={70}
            cy={38}
            r={25}
            fill={STONE}
            opacity={0.45}
            stroke={LINE}
            strokeWidth={0.75}
            vectorEffect="non-scaling-stroke"
          />
          <motion.circle
            cx={70}
            cy={38}
            r={19}
            fill="none"
            stroke={MINT}
            strokeWidth={1}
            strokeDasharray="3 5"
            opacity={0.65}
            animate={reduced ? undefined : { strokeDashoffset: -32 }}
            transition={{
              duration: 2.4,
              repeat: Infinity,
              ease: "linear",
            }}
            vectorEffect="non-scaling-stroke"
          />
          {Array.from({ length: 8 }).map((_, index) => {
            const angle = (index / 8) * Math.PI * 2;
            return (
              <line
                key={index}
                x1={70 + Math.cos(angle) * 12}
                y1={38 + Math.sin(angle) * 12}
                x2={70 + Math.cos(angle) * 18}
                y2={38 + Math.sin(angle) * 18}
                stroke={INK}
                strokeWidth={0.9}
                opacity={0.22}
              />
            );
          })}
          <g
            stroke={KEY}
            strokeWidth={1.1}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            opacity={0.8}
          >
            <circle cx={68} cy={36} r={3} />
            <path d="M 70.2 37.7 L 77 43 M 75 41.4 V 44.5 M 77 43 V 45.5" />
          </g>
          <circle cx={70} cy={38} r={2} fill={MINT} />
        </TopPlane>

        <FrontPlane x={0} y={76} z={11}>
          <rect
            x={10}
            y={0}
            width={30}
            height={1.6}
            rx={0.8}
            fill={MINT}
            opacity={0.5}
          />
          <rect
            x={98}
            y={0}
            width={30}
            height={1.6}
            rx={0.8}
            fill={INK}
            opacity={0.14}
          />
        </FrontPlane>
      </g>
    </svg>
  );
};

const ORBIT = Array.from({ length: 25 }, (_, index) => {
  const angle = (index / 24) * Math.PI * 2;
  return [Math.cos(angle) * 112, Math.sin(angle) * 48] as const;
});

const shift = <T,>(values: T[], amount: number) => [
  ...values.slice(amount),
  ...values.slice(0, amount),
];

const OrbitDot = ({
  offset,
  color = MINT,
}: {
  offset: number;
  color?: string;
}) => {
  const reduced = useReduced();

  if (reduced) {
    return null;
  }

  const xs = shift(
    ORBIT.map(([x]) => x),
    offset,
  );
  const ys = shift(
    ORBIT.map(([, y]) => y),
    offset,
  );

  return (
    <motion.g
      animate={{ x: xs, y: ys }}
      transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
    >
      <circle r={2.4} fill={color} />
      <circle r={2.4} fill={color} opacity={0.25} transform="scale(2)" />
    </motion.g>
  );
};

const Phone = () => (
  <g>
    <IsoShadow cx={0} cy={18} rx={16} ry={6} opacity={0.05} />
    <IsoBox
      x={-8}
      y={-6}
      w={16}
      d={10}
      h={2}
      topFill={STONE_SOFT}
      frontFill={STONE}
      sideFill={PAPER}
    />
    <IsoBox
      x={-6}
      y={-5}
      z={2}
      w={12}
      d={1.5}
      h={24}
      topFill={PAPER}
      frontFill={PAPER}
      sideFill={STONE}
    />
    <FrontPlane x={-6} y={-3.48} z={26}>
      <rect width={12} height={24} fill={STONE} opacity={0.55} />
      <rect
        x={2}
        y={4}
        width={8}
        height={1.4}
        rx={0.7}
        fill={INK}
        opacity={0.18}
      />
      <rect
        x={2}
        y={7}
        width={6}
        height={1.2}
        rx={0.6}
        fill={MUTED}
        opacity={0.35}
      />
      <circle cx={6} cy={17} r={1.6} fill={MINT} opacity={0.7} />
    </FrontPlane>
  </g>
);

export const SyncIllustration = () => (
  <svg
    viewBox="0 0 360 250"
    preserveAspectRatio="xMidYMid meet"
    className="h-full w-full"
    aria-hidden="true"
  >
    <g transform="rotate(-8 180 132)">
      <ellipse
        cx={180}
        cy={132}
        rx={112}
        ry={48}
        fill="none"
        stroke={EDGE}
        strokeWidth={1}
        strokeDasharray="2 7"
        opacity={0.3}
        vectorEffect="non-scaling-stroke"
      />
      <g transform="translate(180 132)">
        <OrbitDot offset={0} />
        <OrbitDot offset={8} />
        <OrbitDot offset={16} />
      </g>
    </g>

    <g transform="translate(76 82) scale(0.84)">
      <Laptop />
    </g>

    <g transform="translate(288 124) scale(1.12)">
      <Phone />
    </g>

    <g transform="translate(180 132) scale(1.15)">
      <IsoShadow cx={0} cy={26} rx={36} ry={11} opacity={0.06} />
      <IsoBox
        x={-18}
        y={-18}
        w={36}
        d={36}
        h={28}
        topFill={PAPER}
        frontFill={STONE}
        sideFill={STONE_SOFT}
      />
      <TopPlane x={-18} y={-18} z={28}>
        <polygon
          points="18,5 31,18 18,31 5,18"
          fill={MINT}
          opacity={0.12}
          stroke={MINT}
          strokeWidth={0.75}
          vectorEffect="non-scaling-stroke"
        />
        <polygon points="18,12 24,18 18,24 12,18" fill={MINT} opacity={0.55} />
      </TopPlane>
      <FrontPlane x={-18} y={18} z={28}>
        <path
          d="M 18 0 V 28"
          fill="none"
          stroke={LINE}
          strokeWidth={0.75}
          vectorEffect="non-scaling-stroke"
        />
        <circle cx={18} cy={6} r={1.2} fill={MINT} opacity={0.75} />
      </FrontPlane>
    </g>
  </svg>
);

const WireCube = ({
  x,
  y,
  w,
  d,
  h,
}: {
  x: number;
  y: number;
  w: number;
  d: number;
  h: number;
}) => {
  const top: IsoPoint[] = [
    [x, y, h],
    [x + w, y, h],
    [x + w, y + d, h],
    [x, y + d, h],
  ];
  const front: IsoPoint[] = [
    [x, y + d, 0],
    [x + w, y + d, 0],
    [x + w, y + d, h],
    [x, y + d, h],
  ];
  const side: IsoPoint[] = [
    [x + w, y, 0],
    [x + w, y + d, 0],
    [x + w, y + d, h],
    [x + w, y, h],
  ];

  return (
    <g>
      <polygon
        points={polygon(front)}
        fill={PAPER}
        fillOpacity={0.72}
        stroke={EDGE}
        strokeWidth={1}
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      <polygon
        points={polygon(side)}
        fill={PAPER}
        fillOpacity={0.52}
        stroke={EDGE}
        strokeWidth={1}
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      <polygon
        points={polygon(top)}
        fill={PAPER}
        fillOpacity={0.18}
        stroke={MINT}
        strokeWidth={1.2}
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      <g
        fill="none"
        stroke={EDGE}
        strokeWidth={0.75}
        opacity={0.35}
        strokeDasharray="2 4"
        vectorEffect="non-scaling-stroke"
      >
        <path
          d={`M ${project(x, y, 0).join(" ")} L ${project(x, y, h).join(" ")}`}
        />
        <path
          d={`M ${project(x + w, y, 0).join(" ")} L ${project(x + w, y, h).join(" ")}`}
        />
        <path
          d={`M ${project(x, y, h).join(" ")} L ${project(x + w, y, h).join(" ")}`}
        />
      </g>
      <g
        fill="none"
        stroke={EDGE}
        strokeWidth={1}
        opacity={0.85}
        vectorEffect="non-scaling-stroke"
      >
        <path
          d={`M ${project(x, y + d, 0).join(" ")} L ${project(x + w, y + d, 0).join(" ")} L ${project(x + w, y, 0).join(" ")}`}
        />
        <path
          d={`M ${project(x + w, y + d, 0).join(" ")} L ${project(x + w, y + d, h).join(" ")}`}
        />
        <path
          d={`M ${project(x, y + d, 0).join(" ")} L ${project(x, y + d, h).join(" ")}`}
        />
      </g>
      <g
        fill="none"
        stroke={MINT}
        strokeWidth={1.2}
        opacity={0.9}
        vectorEffect="non-scaling-stroke"
      >
        <path
          d={`M ${project(x, y + d, h).join(" ")} L ${project(x + w, y + d, h).join(" ")} L ${project(x + w, y, h).join(" ")}`}
        />
      </g>
    </g>
  );
};

export const ZeroKnowledgeIllustration = () => (
  <svg
    viewBox="0 0 600 260"
    preserveAspectRatio="xMidYMid meet"
    className="h-full w-full"
    aria-hidden="true"
  >
    <g transform="translate(170 100)">
      <IsoFlat
        x={0}
        y={0}
        w={136}
        d={136}
        fill={MINT}
        fillOpacity={0.1}
        stroke={MINT}
        strokeOpacity={0.55}
        strokeDasharray="3 6"
      />
      <IsoShadow cx={0} cy={86} rx={64} ry={20} opacity={0.05} />
      <WireCube x={32} y={32} w={72} d={72} h={50} />
      <motion.g
        animate={{ y: [0, -2, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <TopPlane x={32} y={32} z={20}>
          <g
            stroke={KEY}
            strokeWidth={1.2}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            opacity={0.82}
          >
            <circle cx={32} cy={36} r={6.5} />
            <path d="M 38.5 36 H 56 M 51 36 V 40.5 M 56 36 V 39.5" />
          </g>
          <circle cx={32} cy={36} r={2} fill={MINT} />
        </TopPlane>
      </motion.g>
    </g>

    <path
      d="M 289 168 C 328 165, 365 160, 406 156"
      fill="none"
      stroke={EDGE}
      strokeWidth={1}
      strokeDasharray="2 5"
      opacity={0.55}
      vectorEffect="non-scaling-stroke"
    />
    <Mote x={292} y={168} pathX={[0, 58, 116]} pathY={[0, -2, -6]} />

    <g transform="translate(405 110)">
      <IsoFlat
        x={0}
        y={0}
        w={100}
        d={100}
        fill={STONE}
        fillOpacity={0.16}
        stroke={EDGE}
        strokeOpacity={0.35}
        strokeDasharray="3 6"
      />
      <g transform="translate(46 48) scale(1.3)">
        <IsoShadow cx={17} cy={34} rx={27} ry={9} opacity={0.07} />
        <ServerRack w={34} d={26} h={58} />
      </g>
    </g>

    <Label x={170} y={248} tone="mint" className="hidden lg:block">
      KEY STAYS LOCAL
    </Label>
    <MonoLabel x={405} y={224} className="hidden lg:block">
      ciphertext only
    </MonoLabel>
  </svg>
);
