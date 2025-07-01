
import { Activity, TimeCalculation, ActivityWithTimes } from '@/types/TimeTypes';

export const calculateTimes = (
  activities: Activity[],
  mode: 'arrival' | 'start',
  targetTime: string,
  selectedDate: string
): TimeCalculation => {
  const sortedActivities = [...activities].sort((a, b) => a.order - b.order);
  
  // Calculate total duration including wait times
  const totalDuration = sortedActivities.reduce(
    (total, activity) => total + activity.duration + activity.waitTime,
    0
  );

  let startDateTime: Date;
  let endDateTime: Date;

  if (mode === 'arrival') {
    // Working backward from arrival time
    endDateTime = new Date(`${selectedDate}T${targetTime}:00`);
    startDateTime = new Date(endDateTime.getTime() - totalDuration * 60000);
  } else {
    // Working forward from start time
    startDateTime = new Date(`${selectedDate}T${targetTime}:00`);
    endDateTime = new Date(startDateTime.getTime() + totalDuration * 60000);
  }

  // Calculate individual activity times
  const activitiesWithTimes: ActivityWithTimes[] = [];
  let currentTime = new Date(startDateTime);

  sortedActivities.forEach((activity) => {
    const activityStart = new Date(currentTime);
    const activityEnd = new Date(currentTime.getTime() + activity.duration * 60000);
    
    activitiesWithTimes.push({
      ...activity,
      startTime: formatTime(activityStart),
      endTime: formatTime(activityEnd)
    });

    // Move to next activity (including wait time)
    currentTime = new Date(activityEnd.getTime() + activity.waitTime * 60000);
  });

  return {
    startTime: formatTime(startDateTime),
    endTime: formatTime(endDateTime),
    totalDuration,
    activities: activitiesWithTimes
  };
};

const formatTime = (date: Date): string => {
  return date.toTimeString().slice(0, 5);
};

export const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) {
    return `${mins}min`;
  } else if (mins === 0) {
    return `${hours}h`;
  } else {
    return `${hours}h ${mins}min`;
  }
};
