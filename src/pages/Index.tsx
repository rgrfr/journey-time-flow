
import { useState, useEffect } from 'react';
import { Plus, Clock, Calendar, Move3D } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import ActivityList from '@/components/ActivityList';
import TimelineView from '@/components/TimelineView';
import CalendarButtons from '@/components/CalendarButtons';
import { Activity, TimeCalculation } from '@/types/TimeTypes';
import { calculateTimes } from '@/utils/timeCalculations';

const Index = () => {
  const [activities, setActivities] = useState<Activity[]>([
    {
      id: '1',
      title: 'drive to car park',
      duration: 20,
      waitTime: 5,
      order: 0
    },
    {
      id: '2', 
      title: '6-mile walk',
      duration: 90,
      waitTime: 10,
      order: 1
    }
  ]);
  
  const [calculationMode, setCalculationMode] = useState<'arrival' | 'start'>('arrival');
  const [targetTime, setTargetTime] = useState('09:00');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [calculation, setCalculation] = useState<TimeCalculation | null>(null);

  useEffect(() => {
    const result = calculateTimes(activities, calculationMode, targetTime, selectedDate);
    setCalculation(result);
  }, [activities, calculationMode, targetTime, selectedDate]);

  const addActivity = () => {
    const newActivity: Activity = {
      id: Date.now().toString(),
      title: 'new activity',
      duration: 30,
      waitTime: 5,
      order: activities.length
    };
    setActivities([...activities, newActivity]);
  };

  const updateActivity = (id: string, updates: Partial<Activity>) => {
    setActivities(activities.map(activity => 
      activity.id === id ? { ...activity, ...updates } : activity
    ));
  };

  const deleteActivity = (id: string) => {
    setActivities(activities.filter(activity => activity.id !== id));
  };

  const reorderActivities = (draggedId: string, targetIndex: number) => {
    const draggedActivity = activities.find(a => a.id === draggedId);
    if (!draggedActivity) return;

    const otherActivities = activities.filter(a => a.id !== draggedId);
    const newActivities = [
      ...otherActivities.slice(0, targetIndex),
      draggedActivity,
      ...otherActivities.slice(targetIndex)
    ].map((activity, index) => ({ ...activity, order: index }));

    setActivities(newActivities);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-6 max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            start-arrive-time
          </h1>
          <p className="text-slate-600">
            plan your journey backward or forward
          </p>
        </div>

        {/* Mode Selection */}
        <Card className="p-6 mb-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button
                variant={calculationMode === 'arrival' ? 'default' : 'outline'}
                onClick={() => setCalculationMode('arrival')}
                className="flex-1 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
              >
                <Clock className="w-4 h-4 mr-2" />
                set arrival time
              </Button>
              <Button
                variant={calculationMode === 'start' ? 'default' : 'outline'}
                onClick={() => setCalculationMode('start')}
                className="flex-1 bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700"
              >
                <Move3D className="w-4 h-4 mr-2" />
                set start time
              </Button>
            </div>

            <div className="space-y-3">
              <div>
                <Label htmlFor="date" className="text-sm text-slate-600">
                  set date (optional)
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="time" className="text-sm text-slate-600">
                  {calculationMode === 'arrival' ? 'arrival time' : 'start time'}
                </Label>
                <Input
                  id="time"
                  type="time"
                  value={targetTime}
                  onChange={(e) => setTargetTime(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Calculated Result */}
        {calculation && (
          <Card className="p-4 mb-6 bg-gradient-to-r from-blue-600 to-teal-600 text-white border-0 shadow-lg">
            <div className="text-center">
              <div className="text-sm opacity-90 mb-1">
                calculated {calculationMode === 'arrival' ? 'start time' : 'arrival time'}
              </div>
              <div className="text-2xl font-bold">
                {calculationMode === 'arrival' ? calculation.startTime : calculation.endTime}
              </div>
            </div>
          </Card>
        )}

        {/* Timeline Summary */}
        {calculation && (
          <TimelineView 
            calculation={calculation} 
            activities={activities}
            className="mb-6"
          />
        )}

        {/* Calendar Integration */}
        <CalendarButtons 
          calculation={calculation}
          activities={activities}
          selectedDate={selectedDate}
          className="mb-6"
        />

        {/* Activities List */}
        <Card className="p-6 mb-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-800">activities</h2>
            <Button
              onClick={addActivity}
              size="sm"
              className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
            >
              <Plus className="w-4 h-4 mr-1" />
              add
            </Button>
          </div>

          <ActivityList
            activities={activities}
            calculation={calculation}
            onUpdateActivity={updateActivity}
            onDeleteActivity={deleteActivity}
            onReorderActivities={reorderActivities}
          />
        </Card>

        {/* Share Button Placeholder */}
        <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <Button 
            className="w-full bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700"
            disabled
          >
            <Calendar className="w-4 h-4 mr-2" />
            create a new link to share the plan
          </Button>
          <p className="text-xs text-slate-500 mt-2 text-center">
            collaboration features coming soon
          </p>
        </Card>
      </div>
    </div>
  );
};

export default Index;
