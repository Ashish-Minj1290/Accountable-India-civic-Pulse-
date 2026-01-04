
import React from 'react';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  bio?: string;
  credits: number;
  constituency?: string;
  state?: string;
  impactScore: {
    daily: number;
    weekly: number;
  };
  provider?: string;
}

export interface CivicNotification {
  id: string;
  title: string;
  message: string;
  category: string;
  urgency: 'low' | 'medium' | 'high';
  source: string;
  timestamp: string;
  read?: boolean;
}

export interface PostMedia {
  type: 'image' | 'video';
  url: string;
}

export interface Post {
  id: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  tag: string;
  date: string;
  likes: number;
  comments: number;
  isLiked?: boolean;
  media?: PostMedia[];
}

export interface NavItem {
  label: string;
  icon: React.ReactNode;
  id: string;
}

export type ComplaintStatus = 'Active' | 'Processing' | 'Resolved' | 'Delayed' | 'Completed' | 'In Progress';
export type PriorityLevel = 'Low' | 'Medium' | 'High';

export interface Insight {
  topic: string;
  summary: string;
}

export interface MetricCardProps {
  title: string;
  value: string | number;
  change: number;
  icon: React.ReactNode;
}

export interface RewardItem {
  id: string;
  title: string;
  type: string;
  cost: number;
  icon: string;
}

export interface CharityNGO {
  id: string;
  name: string;
  category: string;
  description: string;
  logo: string;
  website: string;
}

export interface CivicComplaint {
  id: string;
  title: string;
  category: string;
  description: string;
  location: string;
  constituency: string;
  state: string;
  priority: PriorityLevel;
  date: string;
  status: ComplaintStatus;
  photo?: string;
  googleMapsLink?: string;
}

export interface PoliticalPromise {
  id: string;
  title: string;
  description: string;
  authority: string;
  party: string;
  date: string;
  targetDate: string;
  status: ComplaintStatus;
  category: string;
  scope: 'Centre' | 'State';
  progress: number;
  sourceUrl?: string;
}

export interface LeaderboardUser {
  id: string;
  name: string;
  avatar: string;
  score: number;
  rank: number;
}

export interface LeaderLegalStanding {
  totalCases: number;
  seriousCriminalCases: number;
  jailHistory: string;
  corruptionAllegations: string[];
  lastUpdated: string;
  justification: string;
  verificationSources: { title: string; uri: string }[];
}

export interface PoliticalLeader {
  id: string;
  name: string;
  role: 'MP' | 'MLA';
  party: string;
  constituency: string;
  state: string;
  rating: number;
  ratingCount: number;
  attendance: number;
  bills: number;
  debates: number;
  questions: number;
  sinceYear: number;
  avatar?: string;
  isFollowed?: boolean;
  legalStanding?: LeaderLegalStanding;
}

export interface Campaign {
  id: string;
  title: string;
  category: string;
  description: string;
  goal: string;
  signatures: number;
  signatureGoal: number;
  startedBy: string;
  date: string;
  isSignedByUser?: boolean;
}

export interface PollOption {
  id: string;
  label: string;
  votes: number;
}

export interface Poll {
  id: string;
  question: string;
  category: string;
  totalVotes: number;
  options: PollOption[];
  endsOn: string;
  votedOptionId?: string;
}

export interface LiveEvent {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'Live' | 'Upcoming' | 'Completed' | 'Ongoing';
  date: string;
  time: string;
  views: number;
  highlights: string[];
}

export interface ElectionRecord {
  id: string;
  title: string;
  status: 'Upcoming' | 'Ongoing' | 'Past';
  date: string;
  type: string;
  location: string;
  description: string;
  results?: { party: string; seats: number; totalSeats: number; color: string }[];
}

export interface ElectionTrend {
  party: string;
  currentSentiment: number;
  predictedSeats: number;
  pastSeats: number;
}

export interface ElectionIntelligence {
  records: ElectionRecord[];
  trends: ElectionTrend[];
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: Date;
  isSystem?: boolean;
}

export interface ChatRoom {
  id: string;
  name: string;
  description: string;
  participants: number;
}

export interface NationalIntel {
  schemes: { title: string; status: string; impact: string }[];
  parliament: { event: string; description: string; date: string }[];
  infrastructure: { project: string; progress: number; details: string }[];
  decisions: { ministry: string; decision: string }[];
  impact: { summary: string; highlights: string[] };
}

export interface StateIntel {
  initiatives: { title: string; status: string; citizenImpact: string }[];
  performance: { department: string; score: number; status: string; summary: string };
  infrastructure: { project: string; progress: number; delayReason?: string; impact: string }[];
  safety: { overview: string; alerts: string[] };
  localIssues: { issue: string; ward: string; urgency: string }[];
}
