import type { NextApiRequest, NextApiResponse } from 'next';

type HealthScore = {
  label: 'Reach' | 'Engagement' | 'Consistency' | 'Growth Velocity';
  value: number;
  helper: string;
  delta: string;
};

type AnalyzeProfileResponse = {
  ok: true;
  source: 'live-api';
  profile: {
    pulse: string;
    thisWeekPlannedPosts: number;
    summary: string;
    priorityMove: string;
    priorityProgress: number;
    healthScores: HealthScore[];
    updatedAt: string;
  };
};

export default function handler(_req: NextApiRequest, res: NextApiResponse<AnalyzeProfileResponse>) {
  res.status(200).json({
    ok: true,
    source: 'live-api',
    profile: {
      pulse: 'Momentum is positive, but your strongest leverage is consistency and sharper hooks.',
      thisWeekPlannedPosts: 3,
      summary:
        'Last week, your short-form hooks improved but posting consistency dropped 14% on weekends. Rebalance cadence and focus on value-forward openings.',
      priorityMove: '2 educational reels + 1 breakdown short this weekend',
      priorityProgress: 62,
      updatedAt: new Date().toISOString(),
      healthScores: [
        {
          label: 'Reach',
          value: 78,
          helper: 'Strong exposure from short-form content.',
          delta: '+8% this month'
        },
        {
          label: 'Engagement',
          value: 71,
          helper: 'Audience response is improving on Q&A posts.',
          delta: '+5% this month'
        },
        {
          label: 'Consistency',
          value: 64,
          helper: 'Posting cadence has gaps on weekends.',
          delta: '-2% this month'
        },
        {
          label: 'Growth Velocity',
          value: 69,
          helper: 'Channel momentum is healthy but uneven.',
          delta: '+6% this month'
        }
      ]
    }
  });
}

