
import { useState } from 'react';
import { GripVertical, Trash2, Clock, Timer, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Activity, TimeCalculation } from '@/types/TimeTypes';
import { formatDuration } from '@/utils/timeCalculations';

interface ActivityListProps {
  activities: Activity[];
  calculation: TimeCalculation | null;
  onUpdateActivity: (id: string, updates: Partial<Activity>) => void;
  onDeleteActivity: (id: string) => void;
  onReorderActivities: (draggedId: string, targetIndex: number) => void;
  onMoveActivity: (id: string, direction: 'up' | 'down') => void;
}

const ActivityList = ({
  activities,
  calculation,
  onUpdateActivity,
  onDeleteActivity,
  onReorderActivities,
  onMoveActivity
}: ActivityListProps) => {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const sortedActivities = [...activities].sort((a, b) => a.order - b.order);
  const totalDuration = activities.reduce((total, activity) => total + activity.duration + activity.waitTime, 0);

  const handleDragStart = (id: string) => {
    setDraggedId(id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedId) {
      onReorderActivities(draggedId, targetIndex);
      setDraggedId(null);
    }
  };

  const getActivityTimes = (activityId: string) => {
    if (!calculation) return null;
    return calculation.activities.find(a => a.id === activityId);
  };

  const getBarWidth = (duration: number) => {
    return Math.max((duration / totalDuration) * 100, 5);
  };

  return (
    <div className="space-y-2">
      {sortedActivities.map((activity, index) => {
        const activityTimes = getActivityTimes(activity.id);
        const isEditing = editingId === activity.id;
        const isDragging = draggedId === activity.id;
        const isFirst = index === 0;
        const isLast = index === sortedActivities.length - 1;

        return (
          <Card
            key={activity.id}
            className={`p-3 transition-all duration-200 ${
              isDragging ? 'shadow-lg scale-105 bg-blue-50' : 'hover:shadow-md'
            }`}
            draggable
            onDragStart={() => handleDragStart(activity.id)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, index)}
          >
            <div className="space-y-2">
              {/* Activity Title Row */}
              <div className="flex items-center gap-2">
                <GripVertical className="w-4 h-4 text-slate-400 cursor-grab active:cursor-grabbing flex-shrink-0" />
                
                <div className="flex-1 min-w-0">
                  {isEditing ? (
                    <Input
                      value={activity.title}
                      onChange={(e) => onUpdateActivity(activity.id, { title: e.target.value })}
                      onBlur={() => setEditingId(null)}
                      onKeyDown={(e) => e.key === 'Enter' && setEditingId(null)}
                      className="font-semibold text-sm h-7"
                      autoFocus
                    />
                  ) : (
                    <h3
                      className="font-bold text-slate-800 cursor-pointer hover:text-blue-600 text-sm truncate"
                      onClick={() => setEditingId(activity.id)}
                      title={activity.title}
                    >
                      {activity.title}
                    </h3>
                  )}
                </div>

                {/* Arrow Controls */}
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onMoveActivity(activity.id, 'up')}
                    disabled={isFirst}
                    className="h-6 w-6 p-0 text-slate-400 hover:text-blue-500"
                  >
                    <ArrowUp className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onMoveActivity(activity.id, 'down')}
                    disabled={isLast}
                    className="h-6 w-6 p-0 text-slate-400 hover:text-blue-500"
                  >
                    <ArrowDown className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              {/* Times Display */}
              {activityTimes && (
                <div className="text-xs text-blue-600 font-semibold pl-6">
                  <Clock className="w-3 h-3 inline mr-1" />
                  {activityTimes.startTime} → {activityTimes.endTime}
                </div>
              )}

              {/* Duration Controls - Updated with better spacing and wider inputs */}
              <div className="flex items-center gap-4 pl-6">
                <div className="flex items-center gap-2 flex-1">
                  <Clock className="w-3 h-3 text-slate-500 flex-shrink-0" />
                  <span className="text-xs text-slate-600 w-12 flex-shrink-0">duration</span>
                  <Input
                    type="number"
                    value={activity.duration}
                    onChange={(e) => onUpdateActivity(activity.id, { duration: parseInt(e.target.value) || 0 })}
                    className="text-xs h-6 w-16 text-center"
                    min="1"
                  />
                  <span className="text-xs text-slate-500 flex-shrink-0">min</span>
                </div>

                <div className="flex items-center gap-2 flex-1">
                  <Timer className="w-3 h-3 text-slate-500 flex-shrink-0" />
                  <span className="text-xs text-slate-600 w-8 flex-shrink-0">wait</span>
                  <Input
                    type="number"
                    value={activity.waitTime}
                    onChange={(e) => onUpdateActivity(activity.id, { waitTime: parseInt(e.target.value) || 0 })}
                    className="text-xs h-6 w-16 text-center"
                    min="0"
                  />
                  <span className="text-xs text-slate-500 flex-shrink-0">min</span>
                </div>
              </div>

              {/* Visual Bars and Delete Button Row */}
              <div className="flex items-center gap-2 pl-6">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
                      style={{ width: `${getBarWidth(activity.duration)}%` }}
                    />
                    <span className="text-xs text-slate-500">
                      {formatDuration(activity.duration)}
                    </span>
                  </div>
                  
                  {activity.waitTime > 0 && (
                    <div className="flex items-center gap-2">
                      <div
                        className="h-2 bg-slate-300 rounded-full border border-dashed border-slate-400"
                        style={{ width: `${getBarWidth(activity.waitTime)}%` }}
                      />
                      <span className="text-xs text-slate-500">
                        {formatDuration(activity.waitTime)} wait
                      </span>
                    </div>
                  )}
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDeleteActivity(activity.id)}
                  className="h-6 w-6 p-0 text-slate-400 hover:text-red-500"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default ActivityList;
