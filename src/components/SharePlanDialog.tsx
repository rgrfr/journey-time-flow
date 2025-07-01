
import { useState } from 'react';
import { Copy, Share2, Users, Clock } from 'lucide-react';
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
import { supabase } from '@/integrations/supabase/client';

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
  const [editorName, setEditorName] = useState('');
  const { toast } = useToast();

  const createShareableLink = async () => {
    setIsCreating(true);
    try {
      let planId = currentPlanId;
      
      if (!planId) {
        // Create new shared plan
        const { data, error } = await supabase
          .from('shared_timeline_plans')
          .insert({
            title: planTitle,
            activities: activities,
            calculation_mode: calculationMode,
            target_time: targetTime,
            target_date: targetDate,
            last_edited_by: editorName || 'Anonymous'
          })
          .select()
          .single();

        if (error) throw error;
        planId = data.id;
        onPlanCreated(planId);
      } else {
        // Update existing shared plan
        const { error } = await supabase
          .from('shared_timeline_plans')
          .update({
            title: planTitle,
            activities: activities,
            calculation_mode: calculationMode,
            target_time: targetTime,
            target_date: targetDate,
            last_edited_by: editorName || 'Anonymous',
            version: supabase.from('shared_timeline_plans').select('version').eq('id', planId).single().then(r => (r.data?.version || 0) + 1)
          })
          .eq('id', planId);

        if (error) throw error;
      }

      const url = `${window.location.origin}?plan=${planId}`;
      setShareUrl(url);
      
      // Update URL without page reload
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.set('plan', planId);
      window.history.replaceState({}, '', newUrl.toString());

      toast({
        title: "Link created!",
        description: "Your plan is now shareable and collaborative",
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
            Share Your Plan
          </DialogTitle>
          <DialogDescription>
            Create a collaborative link that updates in real-time for all users
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!shareUrl ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="editor-name" className="text-sm">
                  Your name (optional)
                </Label>
                <Input
                  id="editor-name"
                  placeholder="Enter your name"
                  value={editorName}
                  onChange={(e) => setEditorName(e.target.value)}
                />
              </div>

              <div className="bg-blue-50 p-3 rounded-lg space-y-2">
                <div className="flex items-center gap-2 text-blue-700">
                  <Users className="w-4 h-4" />
                  <span className="font-medium text-sm">Real-time Collaboration</span>
                </div>
                <p className="text-xs text-blue-600">
                  Changes are instantly synced across all users viewing this link
                </p>
              </div>

              <Button 
                onClick={createShareableLink}
                disabled={isCreating}
                className="w-full bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
              >
                {isCreating ? 'Creating link...' : 'Create shareable link'}
              </Button>
            </>
          ) : (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label className="text-sm">Shareable Link</Label>
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
                  <span className="font-medium text-sm">Link Active</span>
                </div>
                <p className="text-xs text-green-600">
                  This link will stay active for future collaboration
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
