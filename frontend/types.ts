export interface Person {
  id: number;
  name: string;
  balance: number;
  total_drinks: number;
  avatarUrl?: string; // Added avatarUrl property
}

export interface TopUpResponse {
  checkoutUrl: string;
}

export interface BuddyScore {
  buddy_id: number;
  buddy_name: string;
  score: number;
}
