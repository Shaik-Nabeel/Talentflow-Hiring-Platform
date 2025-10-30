export interface Profile {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  role: string;
  department: string;
  avatar: string;
  memberSince: string;
}

export interface Settings {
  id: string;
  emailNotifications: boolean;
  inAppNotifications: boolean;
  theme: 'light' | 'dark' | 'system';
}

export interface NotificationItem {
  id: string;
  title: string;
  body?: string;
  read: boolean;
  timestamp: string;
}
import Dexie, { Table } from 'dexie';

export interface Job {
  id: string;
  title: string;
  slug: string;
  description: string;
  status: 'active' | 'archived';
  tags: string[];
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  stage: 'applied' | 'screen' | 'tech' | 'offer' | 'hired' | 'rejected';
  jobId: string;
  jobTitle?: string;
  resumeUrl?: string;
  tags: string[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface Timeline {
  id: string;
  candidateId: string;
  fromStage: string;
  toStage: string;
  note?: string;
  timestamp: string;
}

export interface Assessment {
  id: string;
  jobId: string;
  title: string;
  sections: AssessmentSection[];
  createdAt: string;
  updatedAt: string;
}

export interface AssessmentSection {
  id: string;
  title: string;
  questions: Question[];
}

export interface Question {
  id: string;
  type: 'single' | 'multi' | 'text' | 'longtext' | 'numeric' | 'file';
  question: string;
  required: boolean;
  options?: string[];
  minValue?: number;
  maxValue?: number;
  maxLength?: number;
  conditionalLogic?: {
    dependsOn: string;
    expectedValue: string;
  };
}

export interface AssessmentResponse {
  id: string;
  assessmentId: string;
  candidateId: string;
  responses: Record<string, any>;
  submittedAt: string;
}

export class TalentFlowDB extends Dexie {
  jobs!: Table<Job>;
  candidates!: Table<Candidate>;
  timelines!: Table<Timeline>;
  assessments!: Table<Assessment>;
  assessmentResponses!: Table<AssessmentResponse>;
  profile!: Table<Profile>;
  settings!: Table<Settings>;
  notifications!: Table<NotificationItem>;

  constructor() {
    super('TalentFlowDB');
    this.version(1).stores({
      jobs: 'id, slug, status, order',
      candidates: 'id, email, stage, jobId',
      timelines: 'id, candidateId, timestamp',
      assessments: 'id, jobId',
      assessmentResponses: 'id, assessmentId, candidateId'
      , profile: 'id'
      , settings: 'id'
      , notifications: 'id, read, timestamp'
    });
  }
}

export const db = new TalentFlowDB();
