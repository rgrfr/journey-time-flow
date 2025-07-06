

import { Activity, TimeCalculation } from '@/types/TimeTypes';

interface TimelineViewProps {
  calculation: TimeCalculation;
  activities: Activity[];
  className?: string;
}

const TimelineView = ({ calculation, activities, className = '' }: TimelineViewProps) => {
  const colors = [
    'bg-orange-500',
    'bg-green-500', 
    'bg-amber-500',
    'bg-emerald-500',
    'bg-yellow-500',
    'bg-lime-500',
    'bg-orange-600',
    'bg-green-600'
  ];

  return (
    <div className={`bg-white/80 backdrop-blur-sm rounded-lg p-3 shadow-lg ${className}`}>
      <div className="space-y-3">
        {/* Horizontal Timeline Summary */}
        <div className="relative">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-2">
            <span>{calculation.startTime}</span>
            <span>{calculation.endTime}</span>
          </div>
          
          <div className="relative h-2 bg-slate-200 rounded-full overflow-hidden">
            {calculation.activities.map((activity, index) => {
              const activityDuration = activity.duration + activity.waitTime;
              const widthPercent = (activityDuration / calculation.totalDuration) * 100;
              
              return (
                <div
                  key={activity.id}
                  className={`absolute h-full ${colors[index % colors.length]} opacity-80`}
                  style={{
                    left: `${calculation.activities
                      .slice(0, index)
                      .reduce((acc, a) => acc + ((a.duration + a.waitTime) / calculation.totalDuration) * 100, 0)}%`,
                    width: `${widthPercent}%`
                  }}
                />
              );
            })}
          </div>
          
          {/* Activity markers */}
          <div className="flex justify-between mt-1">
            {calculation.activities.map((activity, index) => (
              <div
                key={activity.id}
                className={`w-2 h-2 rounded-full ${colors[index % colors.length]} border border-white shadow-sm`}
                style={{
                  position: 'absolute',
                  left: `${calculation.activities
                    .slice(0, index + 1)
                    .reduce((acc, a) => acc + ((a.duration + a.waitTime) / calculation.totalDuration) * 100, 0) - 1}%`,
                  top: '0.75rem'
                }}
              />
            ))}
          </div>
        </div>

        {/* Vertical Timeline Detail - Compact */}
        <div className="space-y-2 mt-4">
          {calculation.activities.map((activity, index) => (
            <div key={activity.id} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${colors[index % colors.length]} flex-shrink-0`} />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-slate-800 text-sm truncate">{activity.title}</div>
                <div className="text-xs text-slate-600">
                  {activity.startTime} → {activity.endTime}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TimelineView;

