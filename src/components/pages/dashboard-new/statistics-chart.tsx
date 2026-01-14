"use client";

import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { ChartDataPoint } from "../../../hooks/useStatisticsData";

interface StatisticsChartProps {
  data: ChartDataPoint[];
  unit: string;
  label: string;
}

const CHART_COLORS = {
  stroke: "#8b5cf6",
  gradientId: "colorStatValue",
  tooltipBg: "#111113",
  tooltipBorder: "#27272a",
  tooltipText: "#fafafa",
  gridStroke: "#27272a",
  tickColor: "#71717a",
} as const;

export function StatisticsChart({ data, unit, label }: StatisticsChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <defs>
          <linearGradient id={CHART_COLORS.gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={CHART_COLORS.stroke} stopOpacity={0.4} />
            <stop offset="50%" stopColor={CHART_COLORS.stroke} stopOpacity={0.1} />
            <stop offset="95%" stopColor={CHART_COLORS.stroke} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke={CHART_COLORS.gridStroke}
          vertical={false}
        />
        <XAxis
          dataKey="label"
          tick={{ fill: CHART_COLORS.tickColor, fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          dy={10}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fill: CHART_COLORS.tickColor, fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(value) => `${value}`}
          dx={-10}
          width={40}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: CHART_COLORS.tooltipBg,
            border: `1px solid ${CHART_COLORS.tooltipBorder}`,
            borderRadius: "12px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
          }}
          labelStyle={{
            color: CHART_COLORS.tooltipText,
            fontWeight: 600,
            marginBottom: 4,
          }}
          itemStyle={{ color: CHART_COLORS.stroke }}
          formatter={(value: number) => [
            `${value.toLocaleString("fr-FR")} ${unit}`,
            label,
          ]}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke={CHART_COLORS.stroke}
          strokeWidth={3}
          fill={`url(#${CHART_COLORS.gradientId})`}
          dot={{ fill: CHART_COLORS.stroke, strokeWidth: 0, r: 4 }}
          activeDot={{
            r: 8,
            fill: CHART_COLORS.stroke,
            stroke: "#0a0a0b",
            strokeWidth: 3,
            className: "animate-violet-pulse",
          }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
