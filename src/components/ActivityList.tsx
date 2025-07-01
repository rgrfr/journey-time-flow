
import { useState } from 'react';
import { GripVertical, Trash2, Clock, Timer } from 'lucide-react';
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
}

const ActivityList = ({
  activities,
  calculation,
  onUpdateActivity,
  onDeleteActivity,
  onReorderActivities
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
    return Math.max((duration / totalDuration) * 100, 5); // Minimum 5% width for visibility
  };

  return (
    <div className="space-y-3">
      {sortedActivities.map((activity, index) => {
        const activityTimes = getActivityTimes(activity.id);
        const isEditing = editingId === activity.id;
        const isDragging = draggedId === activity.id;

        return (
          <Card
            key={activity.id}
            className={`p-4 transition-all duration-200 ${
              isDragging ? 'shadow-lg scale-105 bg-blue-50' : 'hover:shadow-md'
            }`}
            draggable
            onDragStart={() => handleDragStart(activity.id)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, index)}
          >
            <div className="flex items-start gap-3">
              <GripVertical className="w-5 h-5 text-slate-400 cursor-grab active:cursor-grabbing mt-1" />
              
              <div className="flex-1 space-y-3">
                {/* Activity Title */}
                <div className="flex items-center justify-between">
                  {isEditing ? (
                    <Input
                      value={activity.title}
                      onChange={(e) => onUpdateActivity(activity.id, { title: e.target.value })}
                      onBlur={() => setEditingId(null)}
                      onKeyDown={(e) => e.key === 'Enter' && setEditingId(null)}
                      className="font-semibold"
                      autoFocus
                    />
                  ) : (
                    <h3
                      className="font-bold text-slate-800 cursor-pointer hover:text-blue-600"
                      onClick={() => setEditingId(activity.id)}
                    >
                      {activity.title}
                    </h3>
                  )}
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteActivity(activity.id)}
                    className="text-slate-400 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                {/* Times Display */}
                {activityTimes && (
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1 text-blue-600 font-semibold">
                      <Clock className="w-4 h-4" />
                      {activityTimes.startTime} → {activityTimes.endTime}
                    </div>
                  </div>
                )}

                {/* Duration Controls */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs text-slate-600 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      duration
                    </label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={activity.duration}
                        onChange={(e) => onUpdateActivity(activity.id, { duration: parseInt(e.target.value) || 0 })}
                        className="text-sm"
                        min="1"
                      />
                      <span className="text-xs text-slate-500">min</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs text-slate-600 flex items-center gap-1">
                      <Timer className="w-3 h-3" />
                      wait or delay
                    </label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={activity.waitTime}
                        onChange={(e) => onUpdateActivity(activity.id, { waitTime: parseInt(e.target.value) || 0 })}
                        className="text-sm"
                        min="0"
                      />
                      <span className="text-xs text-slate-500">min</span>
                    </div>
                  </div>
                </div>

                {/* Visual Bars */}
                <div className="space-y-2">
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
                        className="h-2 bg-slate-300 rounded-full border-2 border-dashed border-slate-400"
                        style={{ width: `${getBarWidth(activity.waitTime)}%` }}
                      />
                      <span className="text-xs text-slate-500">
                        {formatDuration(activity.waitTime)} wait
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default ActivityList;
