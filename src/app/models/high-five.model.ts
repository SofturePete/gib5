export interface HighFive {
  id: string;
  from_user_id: string;
  to_user_id: string;
  message: string;
  created_at: string;
  from_user?: {
    name: string;
    email: string;
  };
  to_user?: {
    name: string;
    email: string;
  };
}

export interface CreateHighFive {
  to_user_id: string;
  message: string;
}

export interface WeeklyStats {
  user_id: string;
  user_name: string;
  given_count: number;
  received_count: number;
  week_start: string;
}
