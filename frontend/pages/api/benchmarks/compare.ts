import type { NextApiRequest, NextApiResponse } from "next";

type BenchmarkRow = {
  name: string;
  postsPerWeek: number;
  engagementRate: string;
  growthRate: string;
  engagementRateValue: number;
  growthRateValue: number;
};

type CompareRequest = {
  competitors?: string[];
  sortBy?: "engagement" | "growth" | "posts";
  sortOrder?: "asc" | "desc";
  minEngagement?: number;
};

type CompareResponse = {
  ok: true;
  source: "heuristic-v1";
  rows: BenchmarkRow[];
  recommendation: string;
};

type CompareError = {
  ok: false;
  error: string;
};

function asPercent(value: number) {
  return `${value.toFixed(1)}%`;
}

function asSignedPercent(value: number) {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}

function baseSignal(name: string) {
  return name
    .split("")
    .reduce((acc, char, index) => acc + ((char.charCodeAt(0) % 13) * (index + 1)), 0);
}

function buildRow(name: string): BenchmarkRow {
  const signal = baseSignal(name);
  const postsPerWeek = 2 + (signal % 6);
  const engagement = 3.8 + (signal % 47) / 10;
  const growth = 0.8 + (signal % 41) / 10;

  return {
    name,
    postsPerWeek,
    engagementRate: asPercent(engagement),
    growthRate: asSignedPercent(growth),
    engagementRateValue: Number(engagement.toFixed(1)),
    growthRateValue: Number(growth.toFixed(1))
  };
}

function sortRows(rows: BenchmarkRow[], sortBy: CompareRequest["sortBy"], sortOrder: CompareRequest["sortOrder"]) {
  const orderFactor = sortOrder === "asc" ? 1 : -1;

  return [...rows].sort((left, right) => {
    if (sortBy === "posts") {
      return (left.postsPerWeek - right.postsPerWeek) * orderFactor;
    }
    if (sortBy === "growth") {
      return (left.growthRateValue - right.growthRateValue) * orderFactor;
    }

    return (left.engagementRateValue - right.engagementRateValue) * orderFactor;
  });
}

export default function handler(req: NextApiRequest, res: NextApiResponse<CompareResponse | CompareError>) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const body = (req.body ?? {}) as CompareRequest;
  const competitorsRaw = Array.isArray(body.competitors) ? body.competitors : [];

  const competitors = competitorsRaw
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean)
    .slice(0, 5);

  if (competitors.length === 0) {
    return res.status(400).json({ ok: false, error: "Provide at least one competitor" });
  }

  const sortBy: CompareRequest["sortBy"] = body.sortBy === "growth" || body.sortBy === "posts" ? body.sortBy : "engagement";
  const sortOrder: CompareRequest["sortOrder"] = body.sortOrder === "asc" ? "asc" : "desc";
  const minEngagement = Number.isFinite(Number(body.minEngagement)) ? Number(body.minEngagement) : 0;

  const rows = competitors.map((name) => buildRow(name)).filter((row) => row.engagementRateValue >= minEngagement);
  const sortedRows = sortRows(rows, sortBy, sortOrder);

  const top = sortedRows[0];
  const recommendation = top
    ? `Best move: borrow ${top.name}'s cadence (${top.postsPerWeek}/week) and test one format iteration around its strongest engagement pattern.`
    : "No rows matched your filter. Lower min engagement and compare again.";

  return res.status(200).json({
    ok: true,
    source: "heuristic-v1",
    rows: sortedRows,
    recommendation
  });
}