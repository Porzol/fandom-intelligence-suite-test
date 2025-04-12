export interface Fan {
  id: number;
  name: string;
  total_spent: number;
  first_seen: string;
  last_active: string;
  created_at: string;
  updated_at: string;
}

export interface Chatter {
  id: number;
  name: string;
  timezone: string | null;
  performance_score: number;
  created_at: string;
  updated_at: string;
}

export interface Creator {
  id: number;
  name: string;
  join_date: string | null;
  earnings_total: number;
  created_at: string;
  updated_at: string;
}

export enum MessageType {
  TEXT = "text",
  PHOTO = "photo",
  VIDEO = "video",
  VOICE = "voice",
  PPV = "ppv"
}

export interface Message {
  id: number;
  fan_id: number;
  chatter_id: number;
  creator_id: number;
  sent_time: string;
  message_type: MessageType;
  content: string | null;
  price: number;
  purchased: boolean;
  created_at: string;
  updated_at: string;
}

export interface Upload {
  id: number;
  file_name: string;
  file_hash: string;
  uploaded_at: string;
  processed: boolean;
  processed_at: string | null;
  created_at: string;
  updated_at: string;
}

export enum TargetType {
  FAN = "fan",
  CHATTER = "chatter",
  CREATOR = "creator",
  MESSAGE = "message"
}

export interface AIInsight {
  id: number;
  target_type: TargetType;
  target_id: number;
  summary: string;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
}

export enum NotificationSeverity {
  NORMAL = "normal",
  CAUTION = "caution",
  RISK = "risk"
}

export interface Notification {
  id: number;
  message: string;
  severity: NotificationSeverity;
  related_id: number | null;
  related_type: string | null;
  is_read: boolean;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export enum UserRole {
  ADMIN = "admin",
  MANAGER = "manager",
  OPS_ANALYST = "ops_analyst",
  TRAINER = "trainer"
}

export interface User {
  id: number;
  email: string;
  username: string;
  full_name: string | null;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface TestResult {
  id: string;
  name: string;
  variant_a: any;
  variant_b: any;
  start_date: string;
  end_date: string | null;
  status: string;
  metrics: {
    variant_a: {
      impressions: number;
      conversions: number;
      revenue: number;
    };
    variant_b: {
      impressions: number;
      conversions: number;
      revenue: number;
    };
  };
}

export interface SimulationResponse {
  simulation_id: string;
  status: string;
  fan_profile: {
    name: string;
    spending_level: string;
    personality: string;
    interests: string[];
  };
  scenario: string;
  start_time: string;
}

export interface SimulationMessageResponse {
  simulation_id: string;
  response: string;
  metrics: {
    engagement_score: number;
    conversion_potential: number;
    sentiment: string;
  };
  coaching_tips: string[];
}

export interface SimulationResult {
  simulation_id: string;
  status: string;
  duration_minutes: number;
  final_score: number;
  metrics: {
    engagement_rate: number;
    response_quality: number;
    conversion_opportunities: number;
    conversion_success: number;
  };
  feedback: string[];
}
