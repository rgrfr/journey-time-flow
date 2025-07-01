
import { Calendar, Download, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Activity, TimeCalculation } from '@/types/TimeTypes';

interface CalendarButtonsProps {
  calculation: TimeCalculation | null;
  activities: Activity[];
  selectedDate: string;
  className?: string;
}

const CalendarButtons = ({ calculation, activities, selectedDate, className = '' }: CalendarButtonsProps) => {
  if (!calculation || activities.length === 0) return null;

  const generateCalendarEvent = () => {
    const title = activities[0]?.title || 'Journey Plan';
    const startDateTime = `${selectedDate}T${calculation.startTime}:00`;
    const endDateTime = `${selectedDate}T${calculation.endTime}:00`;
    
    // Get current plan ID from URL if it exists
    const urlParams = new URLSearchParams(window.location.search);
    const planId = urlParams.get('plan');
    const shareLink = planId ? `${window.location.origin}?plan=${planId}` : '';
    
    const activitiesText = activities.map((activity, index) => 
      `${index + 1}. ${activity.title} (${activity.duration}min${activity.waitTime > 0 ? ` + ${activity.waitTime}min wait` : ''})`
    ).join('\n');
    
    const description = shareLink 
      ? `${activitiesText}\n\nView/Edit Plan: ${shareLink}`
      : activitiesText;

    return { title, startDateTime, endDateTime, description };
  };

  const handleGoogleCalendar = () => {
    const event = generateCalendarEvent();
    const startDate = new Date(event.startDateTime).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const endDate = new Date(event.endDateTime).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${startDate}/${endDate}&details=${encodeURIComponent(event.description)}`;
    window.open(url, '_blank');
  };

  const handleOutlook = () => {
    const event = generateCalendarEvent();
    const url = `https://outlook.live.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(event.title)}&startdt=${event.startDateTime}&enddt=${event.endDateTime}&body=${encodeURIComponent(event.description)}`;
    window.open(url, '_blank');
  };

  const handleICS = () => {
    const event = generateCalendarEvent();
    const startDate = new Date(event.startDateTime).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const endDate = new Date(event.endDateTime).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//start-arrive-time//EN
BEGIN:VEVENT
UID:${Date.now()}@start-arrive-time
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTSTART:${startDate}
DTEND:${endDate}
SUMMARY:${event.title}
DESCRIPTION:${event.description}
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${event.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ics`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className={`p-4 bg-white/80 backdrop-blur-sm border-0 shadow-lg ${className}`}>
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <Calendar className="w-4 h-4" />
          add to calendar
        </div>
        
        <div className="grid grid-cols-3 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleGoogleCalendar}
            className="text-xs hover:bg-blue-50 hover:border-blue-200"
          >
            <ExternalLink className="w-3 h-3 mr-1" />
            Google
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleOutlook}
            className="text-xs hover:bg-blue-50 hover:border-blue-200"
          >
            <ExternalLink className="w-3 h-3 mr-1" />
            Outlook
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleICS}
            className="text-xs hover:bg-blue-50 hover:border-blue-200"
          >
            <Download className="w-3 h-3 mr-1" />
            iCal
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default CalendarButtons;
