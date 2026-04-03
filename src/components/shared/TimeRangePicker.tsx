import React from 'react';
import { useAppSelector, useAppDispatch } from '@/store';
import { setSelectedTimeRange } from '@/store/slices/uiSlice';
import { TIME_RANGES } from '@/azure/azureConstants';

const TimeRangePicker: React.FC = () => {
  const selected = useAppSelector((s) => s.ui.selectedTimeRange);
  const dispatch = useAppDispatch();

  return (
    <select
      value={selected}
      onChange={(e) => dispatch(setSelectedTimeRange(e.target.value))}
      className="h-8 rounded-md bg-secondary border border-border text-xs text-secondary-foreground px-2 focus:outline-none focus:ring-1 focus:ring-ring"
    >
      {TIME_RANGES.map((t) => (
        <option key={t.value} value={t.value}>{t.label}</option>
      ))}
    </select>
  );
};

export default TimeRangePicker;
