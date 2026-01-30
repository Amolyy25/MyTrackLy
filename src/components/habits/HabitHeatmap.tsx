import React from 'react';
import CalendarHeatmap from '@uiw/react-heat-map';
import { HabitLog } from '../../types';
import { format, subYears } from 'date-fns';
import { fr } from 'date-fns/locale';

interface HabitHeatmapProps {
  logs: HabitLog[];
  color?: string;
}

const HabitHeatmap = ({ logs, color = '#22c55e' }: HabitHeatmapProps) => {
  const today = new Date();
  const startDate = subYears(today, 1);

  // Transform logs into the format expected by @uiw/react-heat-map
  // Format: { date: '2021/01/01', count: 2 }
  const data = logs.map(log => ({
    date: format(new Date(log.completedAt), 'yyyy/MM/dd'),
    count: 1
  }));

  return (
    <div className="w-full overflow-x-auto py-4">
      <CalendarHeatmap
        value={data}
        startDate={startDate}
        endDate={today}
        width={800}
        space={4}
        rectSize={12}
        legendRender={() => <g />}
        rectProps={{
          rx: 2,
        }}
        panelColors={{
          0: '#f3f4f6',
          1: color,
        }}
        weekLabels={['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']}
        monthLabels={[
          'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 
          'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'
        ]}
      />
    </div>
  );
};

export default HabitHeatmap;
