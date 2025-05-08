import { gql } from '@apollo/client';

// Authentication
export const LOGIN_MUTATION = gql`
  mutation Login($loginInput: LoginUserInput!) {
    login(loginInput: $loginInput) {
      access_token,
      user{
        id
        name
        email
        }
    }
  }
`;

export const CREATE_USER_MUTATION = gql`
  mutation CreateUser($createUserInput: CreateUserInput!) {
    createUser(createUserInput: $createUserInput) {
      id
      name
      email
      phone
    }
  }
`;

export const GET_PROFILE_QUERY = gql`
  query GetProfile {
    profile {
      id
      name
      email
      phone
      createdAt
      updatedAt
    }
  }
`;

// Impact Types
export const GET_IMPACT_TYPES_QUERY = gql`
  query GetImpactTypes {
    impactTypes {
      id
      name
      emoji
      userId
      createdAt
      updatedAt
    }
  }
`;

export const CREATE_IMPACT_TYPE_MUTATION = gql`
  mutation CreateImpactType($createImpactTypeInput: CreateImpactTypeInput!) {
    createImpactType(createImpactTypeInput: $createImpactTypeInput) {
      id
      name
      emoji
    }
  }
`;

// Reports
export const GET_REPORTS_QUERY = gql`
  query GetReports($filters: ReportFilterInput) {
    reports(filters: $filters) {
      id
      description
      sentimentText
      latitude
      longitude
      impactTypeId
      userId
      networkStatus
      reportDate
      createdAt
      updatedAt
      impactType {
        id
        name
        emoji
      }
    }
  }
`;

export const CREATE_REPORT_MUTATION = gql`
  mutation CreateReport($createReportInput: CreateReportInput!) {
    createReport(createReportInput: $createReportInput) {
      id
      description
      sentimentText
      latitude
      longitude
      impactTypeId
      networkStatus
      reportDate
    }
  }
`;

export const UPDATE_REPORT_STATUS_MUTATION = gql`
  mutation UpdateReportStatus($id: Float!, $networkStatus: NetworkStatus!) {
    updateReportStatus(id: $id, networkStatus: $networkStatus) {
      id
      networkStatus
    }
  }
`;

// Analytics
export const GET_REPORTS_BY_IMPACT_TYPE_QUERY = gql`
  query GetReportsByImpactType {
    reportsByImpactType {
      impactTypeId
      impactTypeName
      count
    }
  }
`;

export const GET_LOCATION_HEATMAP_QUERY = gql`
  query GetLocationHeatmap {
    locationHeatmap {
      latitude
      longitude
      count
    }
  }
`;

export const GET_DAILY_REPORT_COUNTS_QUERY = gql`
  query GetDailyReportCounts($days: Int) {
    dailyReportCounts(days: $days) {
      date
      count
    }
  }
`;

export const GET_SILENT_ZONES_QUERY = gql`
  query GetSilentZones {
    silentZones {
      latitude
      longitude
      radius
    }
  }
`;

export const GET_SENTIMENT_ANALYSIS_QUERY = gql`
  query GetSentimentAnalysis {
    sentimentAnalysis {
      impactTypeName
      averageSentiment
      count
    }
  }
`;