

import { useState } from 'react';
import { Copy, Share2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Activity } from '@/types/TimeTypes';
import { saveTimelinePlan } from '@/lib/timelinePlanApi';

interface SharePlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activities: Activity[];
  calculationMode: 'arrival' | 'start';
  targetTime: string;
  targetDate: string;
  planTitle: string;
  currentPlanId: string | null;
  onPlanCreated: (planId: string) => void;
}

const SharePlanDialog = ({
  open,
  onOpenChange,
  activities,
  calculationMode,
  targetTime,
  targetDate,
  planTitle,
  currentPlanId,
  onPlanCreated
}: SharePlanDialogProps) => {
  const [isCreating, setIsCreating] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const { toast } = useToast();

  const createShareableLink = async () => {
    setIsCreating(true);
    try {
      // Always create new shared plan (never update existing one)
      const savedPlan = await saveTimelinePlan({
        title: planTitle,
        activities: activities as unknown as any,
        calculation_mode: calculationMode,
        target_time: targetTime,
        target_date: targetDate,
        last_edited_by: 'Anonymous'
      });

      const planId = savedPlan.id;
      onPlanCreated(planId);

      const url = `${window.location.origin}?plan=${planId}`;
      setShareUrl(url);
      
      // Update URL without page reload
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.set('plan', planId);
      window.history.replaceState({}, '', newUrl.toString());

      toast({
        title: "New link created!",
        description: "Your plan has been saved with a new shareable link",
      });
    } catch (error) {
      console.error('Error creating shareable link:', error);
      toast({
        title: "Error",
        description: "Could not create shareable link",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Copied!",
        description: "Link copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setShareUrl('');
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Create New Shared Plan
          </DialogTitle>
          <DialogDescription>
            Create a new collaborative link that updates in real-time for all users
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!shareUrl ? (
            <>
              <div className="bg-orange-50 p-3 rounded-lg space-y-2">
                <div className="flex items-center gap-2 text-orange-700">
                  <Clock className="w-4 h-4" />
                  <span className="font-medium text-sm">Real-time Collaboration</span>
                </div>
                <p className="text-xs text-orange-600">
                  Changes are instantly synced across all users viewing this link
                </p>
              </div>

              <Button 
                onClick={createShareableLink}
                disabled={isCreating}
                className="w-full bg-gradient-to-r from-orange-500 to-green-600 hover:from-orange-600 hover:to-green-700"
              >
                {isCreating ? 'Creating new link...' : 'Create new shareable link'}
              </Button>
            </>
          ) : (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label className="text-sm">New Shareable Link</Label>
                <div className="flex gap-2">
                  <Input
                    value={shareUrl}
                    readOnly
                    className="text-xs"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyToClipboard}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="bg-green-50 p-3 rounded-lg">
                <div className="flex items-center gap-2 text-green-700 mb-1">
                  <Clock className="w-4 h-4" />
                  <span className="font-medium text-sm">New Link Active</span>
                </div>
                <p className="text-xs text-green-600">
                  This new link will stay active for future collaboration
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SharePlanDialog;

