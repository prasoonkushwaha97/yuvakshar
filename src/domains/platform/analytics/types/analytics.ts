export interface EditorialMetrics {
  pendingReviewCount: number;
  averageReviewTimeHours: number;
  averagePublishTimeHours: number;
  articlesPublishedCount: number;
  editorWorkload: Record<string, number>; // editorId -> count
}

export interface ContributorMetrics {
  totalSubmissions: number;
  acceptedCount: number;
  rejectedCount: number;
  revisionRequestedCount: number;
}

export interface CommunityMetrics {
  totalReports: number;
  averageModerationTimeHours: number;
  activeUsersCount: number;
}

export interface HomepageMetrics {
  featuredArticlesCount: number;
  manualSectionsCount: number;
  automaticSectionsCount: number;
}

export interface SecurityMetrics {
  failedLoginsCount: number;
  activeSessionsCount: number;
  highRiskEventsCount: number;
}

export interface NotificationMetrics {
  sentCount: number;
  deliveredCount: number;
  failedCount: number;
}

export interface GlobalAnalytics {
  editorial: EditorialMetrics;
  contributors: ContributorMetrics;
  community: CommunityMetrics;
  homepage: HomepageMetrics;
  security: SecurityMetrics;
  notifications: NotificationMetrics;
  lastUpdated: string;
}
