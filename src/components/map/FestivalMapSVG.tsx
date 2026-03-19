import React from 'react';
import { Dimensions } from 'react-native';
import Svg, { Rect, Text as SvgText, G, Defs, LinearGradient, Stop, Circle, Path } from 'react-native-svg';

type ZoneId = 'action' | 'learn' | 'rest' | 'russia' | 'world' | 'develop' | 'b2b';

interface ZoneBlock {
  id: ZoneId;
  x: number;
  y: number;
  w: number;
  h: number;
  fill: string;
  gradId: string;
  gradEnd: string;
  label: string;
  sub: string;
  emoji: string;
  rx: number;
  isStrip?: boolean;
  textY?: number;
}

// Canvas base dimensions (scaled to screen)
const BASE_W = 320;
const BASE_H = 200;

const ZONES: ZoneBlock[] = [
  // ── TOP STRIP: Развивай! / B2B ──────────────────────────
  {
    id: 'develop',
    x: 0, y: 0, w: 320, h: 37,
    fill: '#00ACC1', gradEnd: '#0097A7', gradId: 'gDevelop',
    label: 'Развивай!', sub: 'B2B · B2G',
    emoji: '🔵',
    rx: 8, isStrip: true,
  },
  // ── TOP LEFT: Отдыхай! ───────────────────────────────────
  {
    id: 'rest',
    x: 0, y: 41, w: 93, h: 76,
    fill: '#FFB300', gradEnd: '#FF8F00', gradId: 'gRest',
    label: 'Отдыхай!', sub: 'Круизный\nПляжный',
    emoji: '🏖',
    rx: 10,
  },
  // ── CENTER TALL: Путешествуй по России! ──────────────────
  {
    id: 'russia',
    x: 97, y: 41, w: 126, h: 155,
    fill: '#F57C00', gradEnd: '#E65100', gradId: 'gRussia',
    label: 'По России!', sub: 'Все регионы РФ',
    emoji: '🏔',
    rx: 10,
  },
  // ── TOP RIGHT: Узнавай! ──────────────────────────────────
  {
    id: 'learn',
    x: 227, y: 41, w: 93, h: 76,
    fill: '#1E88E5', gradEnd: '#1565C0', gradId: 'gLearn',
    label: 'Узнавай!', sub: 'Культурный\nПатриотич.',
    emoji: '🏛',
    rx: 10,
  },
  // ── BOTTOM LEFT: По миру! ────────────────────────────────
  {
    id: 'world',
    x: 0, y: 121, w: 93, h: 75,
    fill: '#8E24AA', gradEnd: '#6A1B9A', gradId: 'gWorld',
    label: 'По миру!', sub: 'Зарубежные\nнаправления',
    emoji: '🌍',
    rx: 10,
  },
  // ── BOTTOM RIGHT: Действуй! ──────────────────────────────
  {
    id: 'action',
    x: 227, y: 121, w: 93, h: 75,
    fill: '#E53935', gradEnd: '#B71C1C', gradId: 'gAction',
    label: 'Действуй!', sub: 'Активный\nАвтомоб.',
    emoji: '⚡',
    rx: 10,
  },
];

interface Props {
  onZonePress: (id: ZoneId) => void;
  standCounts?: Partial<Record<ZoneId, number>>;
}

export const FestivalMapSVG: React.FC<Props> = ({ onZonePress, standCounts = {} }) => {
  const screenW = Dimensions.get('window').width - 32;
  const scale = screenW / BASE_W;
  const svgH = Math.round(BASE_H * scale);

  return (
    <Svg
      width={screenW}
      height={svgH}
      viewBox={`0 0 ${BASE_W} ${BASE_H}`}
    >
      <Defs>
        {ZONES.map((z) => (
          <LinearGradient key={z.gradId} id={z.gradId} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={z.fill} stopOpacity="1" />
            <Stop offset="1" stopColor={z.gradEnd} stopOpacity="1" />
          </LinearGradient>
        ))}
      </Defs>

      {ZONES.map((z) => {
        const count = standCounts[z.id];
        const cx = z.x + z.w / 2;

        // Text y-positions
        const emojiY = z.isStrip
          ? z.y + 14
          : z.y + z.h * 0.32;
        const labelY = z.isStrip
          ? z.y + 26
          : z.y + z.h * 0.52;
        const sub1Y = z.y + z.h * 0.66;
        const sub2Y = z.y + z.h * 0.76;
        const [sub1, sub2] = z.sub.split('\n');

        return (
          <G key={z.id} onPress={() => onZonePress(z.id)}>
            {/* Zone block */}
            <Rect
              x={z.x + 1.5}
              y={z.y + 1.5}
              width={z.w - 3}
              height={z.h - 3}
              fill={`url(#${z.gradId})`}
              rx={z.rx}
              ry={z.rx}
            />

            {/* Subtle inner highlight */}
            <Rect
              x={z.x + 1.5}
              y={z.y + 1.5}
              width={z.w - 3}
              height={Math.min(20, z.h * 0.3)}
              fill="rgba(255,255,255,0.12)"
              rx={z.rx}
              ry={z.rx}
            />

            {/* Emoji */}
            <SvgText
              x={cx}
              y={emojiY}
              fontSize={z.isStrip ? 11 : 16}
              textAnchor="middle"
            >
              {z.emoji}
            </SvgText>

            {/* Zone label */}
            <SvgText
              x={cx}
              y={labelY}
              fill="white"
              fontSize={z.isStrip ? 11 : 10}
              fontWeight="700"
              textAnchor="middle"
            >
              {z.label}
            </SvgText>

            {/* Subtitle line 1 */}
            {!z.isStrip && sub1 && (
              <SvgText
                x={cx}
                y={sub1Y}
                fill="rgba(255,255,255,0.8)"
                fontSize={7}
                fontWeight="400"
                textAnchor="middle"
              >
                {sub1}
              </SvgText>
            )}

            {/* Subtitle line 2 */}
            {!z.isStrip && sub2 && (
              <SvgText
                x={cx}
                y={sub2Y}
                fill="rgba(255,255,255,0.8)"
                fontSize={7}
                fontWeight="400"
                textAnchor="middle"
              >
                {sub2}
              </SvgText>
            )}

            {/* Stand count badge */}
            {count !== undefined && count > 0 && (
              <G>
                <Rect
                  x={z.x + z.w - 22}
                  y={z.y + z.h - 16}
                  width={20}
                  height={14}
                  fill="rgba(0,0,0,0.35)"
                  rx={4}
                  ry={4}
                />
                <SvgText
                  x={z.x + z.w - 12}
                  y={z.y + z.h - 6}
                  fill="white"
                  fontSize={7}
                  fontWeight="700"
                  textAnchor="middle"
                >
                  {count}
                </SvgText>
              </G>
            )}
          </G>
        );
      })}

      {/* ── LANDMARKS ── */}

      {/* Лекторий — inside Russia, top area */}
      <G>
        <Rect x={106} y={50} width={38} height={14} fill="rgba(0,0,0,0.25)" rx={3} ry={3} />
        <SvgText x={125} y={60} fill="rgba(255,255,255,0.9)" fontSize={6.5} textAnchor="middle">
          📖 Лекторий
        </SvgText>
      </G>

      {/* Ретрит зона — inside Russia center */}
      <G>
        <Rect x={106} y={102} width={42} height={14} fill="rgba(0,0,0,0.25)" rx={3} ry={3} />
        <SvgText x={127} y={112} fill="rgba(255,255,255,0.9)" fontSize={6.5} textAnchor="middle">
          🧘 Ретрит зона
        </SvgText>
      </G>

      {/* Главная сцена — top-right corner label */}
      <G>
        <Rect x={228} y={50} width={46} height={14} fill="rgba(0,0,0,0.25)" rx={3} ry={3} />
        <SvgText x={251} y={60} fill="rgba(255,255,255,0.9)" fontSize={6.5} textAnchor="middle">
          🎤 Гл. сцена
        </SvgText>
      </G>

      {/* Вход → (right side arrow) */}
      <G>
        <SvgText x={312} y={112} fill="#002B77" fontSize={7} fontWeight="700" textAnchor="end">
          Вход →
        </SvgText>
      </G>

      {/* Compass N */}
      <G>
        <SvgText x={308} y={12} fill="rgba(0,0,0,0.5)" fontSize={8} fontWeight="700" textAnchor="middle">
          N↑
        </SvgText>
      </G>
    </Svg>
  );
};

export default FestivalMapSVG;
