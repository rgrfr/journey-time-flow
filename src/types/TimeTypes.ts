
export interface Activity {
  id: string;
  title: string;
  duration: number; // in minutes
  waitTime: number; // in minutes
  order: number;
}

export interface ActivityWithTimes extends Activity {
  startTime: string;
  endTime: string;
}

export interface TimeCalculation {
  startTime: string;
  endTime: string;
  totalDuration: number;
  activities: ActivityWithTimes[];
}
