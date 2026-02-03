"use client";

import { useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import type { RoomParticipant } from "@/app/api/rooms/[id]/route";
import { computeCompatibility } from "@/lib/compatibility";
import { getTierColor } from "@/lib/relationship";
import { getSaju } from "@/lib/saju";

const ZODIAC_EMOJI: Record<string, string> = {
  자: "🐀",
  축: "🐂",
  인: "🐅",
  묘: "🐇",
  진: "🐉",
  사: "🐍",
  오: "🐎",
  미: "🐐",
  신: "🐒",
  유: "🐓",
  술: "🐕",
  해: "🐷",
};

function getJiEmoji(p: RoomParticipant): string {
  const saju = getSaju(p.birth_year, p.birth_month, p.birth_day, p.birth_hour);
  return ZODIAC_EMOJI[saju.year.jiName] ?? "✨";
}

function displayName(p: RoomParticipant): string {
  return p.name?.trim() || p.mbti || "참여자";
}

const SVG_SIZE = 320;
const CENTER_X = SVG_SIZE / 2;
const CENTER_Y = SVG_SIZE / 2;
const NODE_RADIUS = 44;
const EDGE_HIT_STROKE = 28;
const EDGE_STROKE_NORMAL = 3;
const EDGE_STROKE_HIGHLIGHT = 4;

/** 선분 (x1,y1)-(x2,y2)에서 원(r) 경계까지 잘라낸 양 끝점 */
function trimLineToCircles(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  r: number,
): { x1: number; y1: number; x2: number; y2: number } {
  const d = Math.hypot(x2 - x1, y2 - y1);
  if (d <= 0) return { x1, y1, x2, y2 };
  const u = (x2 - x1) / d;
  const v = (y2 - y1) / d;
  return {
    x1: x1 + r * u,
    y1: y1 + r * v,
    x2: x2 - r * u,
    y2: y2 - r * v,
  };
}

type Props = {
  participants: RoomParticipant[];
  onSelectPair: (a: RoomParticipant, b: RoomParticipant) => void;
  /** 범례에서 선택한 등급. 이 등급인 관계만 강조, 나머지는 흐리게 */
  selectedTier?: string | null;
};

export default function RelationshipGraph({
  participants,
  onSelectPair,
  selectedTier = null,
}: Props) {
  const { nodes, edges } = useMemo(() => {
    const n = participants.length;
    if (n === 0)
      return {
        nodes: [] as { p: RoomParticipant; x: number; y: number }[],
        edges: [] as { a: number; b: number; color: string; tier: string }[],
      };

    const radius =
      n <= 2 ? 70 : Math.min(95, 220 / (1 + Math.sin(Math.PI / n)));
    const nodes = participants.map((p, i) => {
      const angle = (2 * Math.PI * i) / n - Math.PI / 2;
      return {
        p,
        x: CENTER_X + radius * Math.cos(angle),
        y: CENTER_Y + radius * Math.sin(angle),
      };
    });

    const edges: { a: number; b: number; color: string; tier: string }[] = [];
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const result = computeCompatibility(participants[i], participants[j]);
        edges.push({
          a: i,
          b: j,
          color: getTierColor(result.tier),
          tier: result.tier,
        });
      }
    }
    return { nodes, edges };
  }, [participants]);

  const handleEdgeClick = useCallback(
    (i: number, j: number) => {
      onSelectPair(participants[i], participants[j]);
    },
    [participants, onSelectPair],
  );

  if (participants.length === 0) return null;
  if (participants.length === 1) {
    const p = participants[0];
    return (
      <div className="flex justify-center py-6">
        <motion.div
          className="flex flex-col items-center rounded-2xl border-2 border-violet-300 bg-violet-50/90 px-6 py-5 shadow-sm dark:border-violet-600 dark:bg-violet-950/50"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <span className="text-3xl" aria-hidden>
            {getJiEmoji(p)}
          </span>
          <span className="mt-2 font-semibold text-slate-800 dark:text-slate-100">
            {displayName(p)}
          </span>
          {p.is_creator && (
            <span className="mt-0.5 text-xs text-violet-600 dark:text-violet-400">
              방장
            </span>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[320px] min-h-[280px] sm:min-h-[320px]">
      <svg
        viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
        className="w-full h-auto min-h-[280px] sm:min-h-[320px]"
        aria-label="참여자 관계도: 선을 누르면 두 사람 궁합을 볼 수 있어요"
      >
        {/* 관계선 (뒤에 그려서 노드 아래로). selectedTier면 해당 등급만 강조 */}
        <g>
          {edges.map((edge) => {
            const na = nodes[edge.a];
            const nb = nodes[edge.b];
            const t = trimLineToCircles(
              na.x,
              na.y,
              nb.x,
              nb.y,
              NODE_RADIUS + 4,
            );
            const midX = (t.x1 + t.x2) / 2;
            const midY = (t.y1 + t.y2) / 2;
            const isHighlighted = !selectedTier || edge.tier === selectedTier;
            const opacity = isHighlighted ? 1 : 0.2;
            return (
              <g
                key={`${edge.a}-${edge.b}`}
                style={{ opacity }}
                className="transition-opacity duration-200"
              >
                <line
                  x1={t.x1}
                  y1={t.y1}
                  x2={t.x2}
                  y2={t.y2}
                  stroke={edge.color}
                  strokeWidth={
                    isHighlighted ? EDGE_STROKE_HIGHLIGHT : EDGE_STROKE_NORMAL
                  }
                  strokeLinecap="round"
                />
                <line
                  x1={t.x1}
                  y1={t.y1}
                  x2={t.x2}
                  y2={t.y2}
                  stroke="transparent"
                  strokeWidth={EDGE_HIT_STROKE}
                  strokeLinecap="round"
                  style={{ cursor: "pointer" }}
                  onClick={() => handleEdgeClick(edge.a, edge.b)}
                  aria-label={`${displayName(na.p)}와 ${displayName(nb.p)} 궁합: ${edge.tier}`}
                />
                <motion.text
                  x={midX}
                  y={midY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="12"
                  fontWeight="600"
                  fill="white"
                  stroke="rgba(0,0,0,0.5)"
                  strokeWidth="2"
                  paintOrder="stroke"
                  style={{ pointerEvents: "none", userSelect: "none" }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.15 }}
                >
                  {edge.tier}
                </motion.text>
              </g>
            );
          })}
        </g>
        {/* 노드 (앞에). selectedTier일 때 해당 등급 관계에 참여한 노드만 강조 */}
        {nodes.map((node, i) => {
          const isHighlightedNode =
            !selectedTier ||
            edges.some(
              (e) => (e.a === i || e.b === i) && e.tier === selectedTier,
            );
          const nodeOpacity = isHighlightedNode ? 1 : 0.35;
          return (
            <motion.g
              key={node.p.id}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                delay: 0.05 * i,
                type: "spring",
                stiffness: 200,
                damping: 20,
              }}
              style={{ opacity: nodeOpacity }}
              className="transition-opacity duration-200"
            >
              <circle
                cx={node.x}
                cy={node.y}
                r={NODE_RADIUS}
                className="fill-white stroke-2 stroke-slate-200 dark:fill-slate-800 dark:stroke-slate-600"
              />
              {isHighlightedNode && selectedTier && (
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={NODE_RADIUS + 2}
                  className="fill-none stroke-2"
                  style={{
                    stroke: getTierColor(
                      selectedTier as Parameters<typeof getTierColor>[0],
                    ),
                  }}
                />
              )}
              {node.p.is_creator && (
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={NODE_RADIUS}
                  className="fill-none stroke-violet-400 stroke-2 dark:stroke-violet-500"
                />
              )}
              <text
                x={node.x}
                y={node.y - 10}
                textAnchor="middle"
                className="text-2xl"
                aria-hidden
              >
                {getJiEmoji(node.p)}
              </text>
              <text
                x={node.x}
                y={node.y + 14}
                textAnchor="middle"
                fontSize="13"
                fontWeight="600"
                className="fill-slate-800 dark:fill-slate-100"
              >
                {displayName(node.p).slice(0, 6)}
                {displayName(node.p).length > 6 ? "…" : ""}
              </text>
              {node.p.is_creator && (
                <text
                  x={node.x}
                  y={node.y + 28}
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight="500"
                  className="fill-violet-600 dark:fill-violet-400"
                >
                  방장
                </text>
              )}
            </motion.g>
          );
        })}
      </svg>
    </div>
  );
}
