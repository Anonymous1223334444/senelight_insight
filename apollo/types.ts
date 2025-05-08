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
  
  // Analytics Types
  export type ImpactTypeCount = {
      impactTypeId: string;
      impactTypeName: string;
      count: number;
  }
  
  export type LocationHeatmap = {
      latitude: number;
      longitude: number;
      count: number;
  }
  
  export type DailyReportCount = {
      date: string;
      count: number;
  }
  
  export type SilentZone = {
      latitude: number;
      longitude: number;
      radius: number; // en km
  }
  
  export type SentimentAnalysis = {
      impactTypeName: string;
      averageSentiment: number; // de -1 (négatif) à 1 (positif)
      count: number;
  }