
import { useState, useEffect, useRef } from 'react';
import { Plus, Clock, Calendar, Move3D, Share2, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import ActivityList from '@/components/ActivityList';
import TimelineView from '@/components/TimelineView';
import CalendarButtons from '@/components/CalendarButtons';
import SharePlanDialog from '@/components/SharePlanDialog';
import { Activity, TimeCalculation } from '@/types/TimeTypes';
import { calculateTimes } from '@/utils/timeCalculations';
import { getTimelinePlan, saveTimelinePlan } from '@/lib/timelinePlanApi';

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
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [currentPlanId, setCurrentPlanId] = useState<string | null>(null);
  const [planTitle, setPlanTitle] = useState('My Timeline Plan');
  const [lastEditTime, setLastEditTime] = useState<string | null>(null);
  const { toast } = useToast();

  // Check for shared plan ID in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const planId = urlParams.get('plan');
    if (planId) {
      loadSharedPlan(planId);
    }
  }, []);

  // Poll for updates on shared plans (replaces real-time subscription)
  const lastVersionRef = useRef<number>(1);
  
  useEffect(() => {
    if (!currentPlanId) return;

    const pollInterval = setInterval(async () => {
      try {
        const plan = await getTimelinePlan(currentPlanId);
        
        if (plan && plan.version > lastVersionRef.current) {
          console.log('Update detected:', plan);
          lastVersionRef.current = plan.version;
          setActivities(plan.activities as unknown as Activity[]);
          setCalculationMode(plan.calculation_mode as 'arrival' | 'start');
          setTargetTime(plan.target_time);
          setSelectedDate(plan.target_date);
          setPlanTitle(plan.title);
          setLastEditTime(plan.last_edited_at);
          toast({
            title: "Plan updated",
            description: `Updated by ${plan.last_edited_by}`,
          });
        }
      } catch (error) {
        console.error('Error polling for updates:', error);
      }
    }, 3000); // Poll every 3 seconds

    return () => {
      clearInterval(pollInterval);
    };
  }, [currentPlanId, toast]);

  const loadSharedPlan = async (planId: string) => {
    try {
      const plan = await getTimelinePlan(planId);

      if (!plan) {
        throw new Error('Plan not found');
      }

      setActivities(plan.activities as unknown as Activity[]);
      setCalculationMode(plan.calculation_mode as 'arrival' | 'start');
      setTargetTime(plan.target_time);
      setSelectedDate(plan.target_date);
      setPlanTitle(plan.title);
      setCurrentPlanId(planId);
      setLastEditTime(plan.last_edited_at);
      lastVersionRef.current = plan.version;
      
      toast({
        title: "Shared plan loaded",
        description: "You're now viewing a collaborative plan",
      });
    } catch (error) {
      console.error('Error loading shared plan:', error);
      toast({
        title: "Error",
        description: "Could not load shared plan",
        variant: "destructive",
      });
    }
  };

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

  const moveActivity = (id: string, direction: 'up' | 'down') => {
    const sortedActivities = [...activities].sort((a, b) => a.order - b.order);
    const currentIndex = sortedActivities.findIndex(a => a.id === id);
    
    if ((direction === 'up' && currentIndex === 0) || 
        (direction === 'down' && currentIndex === sortedActivities.length - 1)) {
      return;
    }

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    reorderActivities(id, newIndex);
  };

  const formatLastEditTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-GB', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50">
      <div className="container mx-auto px-3 py-4 max-w-lg">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-slate-800 mb-1">
            start-arrive-time
          </h1>
          <p className="text-sm text-slate-600">
            plan your journey backward or forward
          </p>
          {lastEditTime && (
            <p className="text-xs text-slate-500 mt-1">
              last edit {formatLastEditTime(lastEditTime)}
            </p>
          )}
        </div>

        {/* Mode Selection - Compact Layout */}
        <Card className="p-4 mb-4 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <div className="space-y-3">
            <div className="flex gap-2">
              <Button
                variant={calculationMode === 'arrival' ? 'default' : 'outline'}
                onClick={() => setCalculationMode('arrival')}
                className="flex-1 text-sm bg-gradient-to-r from-orange-500 to-green-600 hover:from-orange-600 hover:to-green-700"
              >
                <Clock className="w-3 h-3 mr-1" />
                set arrival time
              </Button>
              <Button
                variant={calculationMode === 'start' ? 'default' : 'outline'}
                onClick={() => setCalculationMode('start')}
                className="flex-1 text-sm bg-gradient-to-r from-green-600 to-orange-500 hover:from-green-700 hover:to-orange-600"
              >
                <Move3D className="w-3 h-3 mr-1" />
                set start time
              </Button>
            </div>

            {/* Horizontal Layout for Date and Time */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <Label htmlFor="date" className="text-xs text-slate-600 whitespace-nowrap">
                  date
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="text-sm flex-1"
                />
              </div>

              <div className="flex items-center gap-2">
                <Label htmlFor="time" className="text-xs text-slate-600 whitespace-nowrap">
                  {calculationMode === 'arrival' ? 'arrive' : 'start'}
                </Label>
                <Input
                  id="time"
                  type="time"
                  value={targetTime}
                  onChange={(e) => setTargetTime(e.target.value)}
                  className="text-sm flex-1"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Calculated Result */}
        {calculation && (
          <Card className="p-3 mb-4 bg-gradient-to-r from-orange-500 to-green-600 text-white border-0 shadow-lg">
            <div className="text-center">
              <div className="text-xs opacity-90 mb-1">
                calculated {calculationMode === 'arrival' ? 'start time' : 'arrival time'}
              </div>
              <div className="text-xl font-bold">
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
            className="mb-4"
          />
        )}

        {/* Calendar Integration - Compact */}
        <CalendarButtons 
          calculation={calculation}
          activities={activities}
          selectedDate={selectedDate}
          className="mb-4"
        />

        {/* Activities List */}
        <Card className="p-4 mb-4 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-slate-800">activities</h2>
            <Button
              onClick={addActivity}
              size="sm"
              className="bg-gradient-to-r from-orange-500 to-green-600 hover:from-orange-600 hover:to-green-700"
            >
              <Plus className="w-3 h-3 mr-1" />
              add
            </Button>
          </div>

          <ActivityList
            activities={activities}
            calculation={calculation}
            onUpdateActivity={updateActivity}
            onDeleteActivity={deleteActivity}
            onReorderActivities={reorderActivities}
            onMoveActivity={moveActivity}
          />
        </Card>

        {/* Share Button */}
        <Card className="p-4 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <Button 
            className="w-full bg-gradient-to-r from-green-600 to-orange-500 hover:from-green-700 hover:to-orange-600"
            onClick={() => setShareDialogOpen(true)}
          >
            <Share2 className="w-4 h-4 mr-2" />
            create a new link to share the plan
          </Button>
          <p className="text-xs text-slate-500 mt-2 text-center">
            collaborate in real-time with others
          </p>
        </Card>

        <SharePlanDialog
          open={shareDialogOpen}
          onOpenChange={setShareDialogOpen}
          activities={activities}
          calculationMode={calculationMode}
          targetTime={targetTime}
          targetDate={selectedDate}
          planTitle={planTitle}
          currentPlanId={currentPlanId}
          onPlanCreated={(planId) => setCurrentPlanId(planId)}
        />
      </div>
    </div>
  );
};

export default Index;
