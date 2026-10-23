import React from 'react';
import type { TimelineState } from './types';
import { TimelineComposition } from './TimelineComposition';
import { compileTimeline } from './compileTimeline';
import sampleTimelineJson from './exemplos/timeline_showcase_completo.json';

export interface JsonTimelinePlayerProps {
  timeline?: Partial<TimelineState>;
}

export const defaultCompiledTimeline = compileTimeline(sampleTimelineJson as any);

export const JsonTimelinePlayer: React.FC<JsonTimelinePlayerProps> = ({ timeline }) => {
  const activeTimeline = timeline ? compileTimeline(timeline) : defaultCompiledTimeline;
  return <TimelineComposition timeline={activeTimeline} />;
};
