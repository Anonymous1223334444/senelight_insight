// Enums
export enum NetworkStatus {
    PENDING = 'PENDING',
    SENT = 'SENT',
    FAILED = 'FAILED'
  }
  
  // Input Types
  export type LoginUserInput = {
    email: string;
    password: string;
  }
  
  export type CreateUserInput = {
    name: string;
    email: string;
    password: string;
    phone?: string;
  }
  
  export type CreateImpactTypeInput = {
    name: string;
    emoji: string;
  }
  
  export type CreateReportInput = {
    description: string;
    sentimentText?: string;
    latitude?: number;
    longitude?: number;
    impactTypeId: number;
  }
  
  export type ReportFilterInput = {
    impactTypeId?: string;
    startDate?: string;
    endDate?: string;
    networkStatus?: NetworkStatus;
    limit?: number;
    offset?: number;
  }
  
  export type CreateOutageInput = {
    description: string;
    latitude?: number;
    longitude?: number;
  }
  
  // Model Types
  export type User = {
    id: string;
    name: string;
    email: string;
    phone?: string;
    createdAt?: string;
    updatedAt?: string;
  }
  
  export type ImpactType = {
    id: string;
    name: string;
    emoji: string;
    userId?: string;
    createdAt?: string;
    updatedAt?: string;
  }
  
  export type Report = {
    id: string;
    description: string;
    sentimentText?: string;
    latitude?: number;
    longitude?: number;
    impactTypeId: string;
    userId: string;
    networkStatus: NetworkStatus;
    reportDate: string;
    createdAt: string;
    updatedAt: string;
    impactType: ImpactType;
  }
  
  export type Outage = {
    id: string;
    description: string;
    latitude?: number;
    longitude?: number;
    reportCount: number;
    resolvedStatus: boolean;
    userId: string;
    startDate: string;
    endDate?: string;
    createdAt: string;
    updatedAt: string;
  }
  
  // Dashboard Types
  export type DashboardStats = {
    totalOutages: number;
    activeOutages: number;
    totalReports: number;
    pendingReports: number;
  }
  
  export type MapPoint = {
    id: string;
    type: string;
    latitude: number;
    longitude: number;
  }
  
  export type OutagePoint = MapPoint & {
    resolved: boolean;
    reportCount: number;
  }
  
  export type ReportPoint = MapPoint & {
    status: string;
    impactType: string;
  }
  
  export type MapData = {
    outages: OutagePoint[];
    reports: ReportPoint[];
  }
  
  // Analytics Types
  export type ImpactTypeCount = {
    impactTypeId: string;
    impactTypeName: string;
    count: number;
  }
  
  export type DailyReportCount = {
    date: string;
    count: number;
  }
  
  // Response Types
  export type LoginResponse = {
    access_token: string;
    user: User;
  }
  
  export type GetProfileResponse = {
    profile: User;
  }
  
  export type GetImpactTypesResponse = {
    impactTypes: ImpactType[];
  }
  
  export type GetReportsResponse = {
    reports: Report[];
  }
  
  export type GetReportResponse = {
    report: Report;
  }
  
  export type GetOutagesResponse = {
    outages: Outage[];
  }
  
  export type GetOutageResponse = {
    outage: Outage;
  }
  
  export type GetDashboardStatsResponse = {
    dashboardStats: DashboardStats;
  }
  
  export type GetMapDataResponse = {
    mapData: MapData;
  }
  
  export type GetReportsByImpactTypeResponse = {
    reportsByImpactType: ImpactTypeCount[];
  }
  
  export type GetMonthlyReportCountsResponse = {
    monthlyReportCounts: DailyReportCount[];
  }