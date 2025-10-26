/**
 * API client for shared timeline plans using custom MySQL backend
 */

const API_BASE_URL = 'https://rogerfrost.com/api';

export interface TimelinePlan {
  id: string;
  title: string;
  activities: any[];
  calculation_mode: 'arrival' | 'start';
  target_time: string;
  target_date: string;
  last_edited_by: string;
  last_edited_at: string;
  created_at: string;
  updated_at: string;
  version: number;
}

/**
 * Fetch a single timeline plan by ID
 */
export async function getTimelinePlan(planId: string): Promise<TimelinePlan | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/get_shared_timeline_plans.php?id=${planId}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (result.data && result.data.length > 0) {
      return result.data[0];
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching timeline plan:', error);
    throw error;
  }
}

/**
 * Fetch all timeline plans
 */
export async function getAllTimelinePlans(): Promise<TimelinePlan[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/get_shared_timeline_plans.php`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.error('Error fetching timeline plans:', error);
    throw error;
  }
}

/**
 * Create or update a timeline plan
 * If the plan has an id, it will update; otherwise it will create a new one
 */
export async function saveTimelinePlan(plan: Partial<TimelinePlan>): Promise<TimelinePlan> {
  try {
    // Generate UUID for new plans
    if (!plan.id) {
      plan.id = crypto.randomUUID();
    }

    const response = await fetch(`${API_BASE_URL}/insert_shared_timeline_plans.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(plan),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    
    // The insert API returns {status: "success", message: "..."} without data field
    // Since we already have the plan object with the ID, return it on success
    if (result.status === 'success') {
      return plan as TimelinePlan;
    }
    
    throw new Error(result.message || 'Invalid response from server');
  } catch (error) {
    console.error('Error saving timeline plan:', error);
    throw error;
  }
}
