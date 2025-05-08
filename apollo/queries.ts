import { gql } from '@apollo/client';

// User Profile
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

// Reports
export const GET_REPORTS_QUERY = gql`
  query GetReports($status: NetworkStatus, $limit: Int) {
    reports(status: $status, limit: $limit) {
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

export const GET_REPORT_QUERY = gql`
  query GetReport($id: Float!) {
    report(id: $id) {
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

// Outages
export const GET_OUTAGES_QUERY = gql`
  query GetOutages($resolved: Boolean, $limit: Int) {
    outages(resolved: $resolved, limit: $limit) {
      id
      description
      latitude
      longitude
      reportCount
      resolvedStatus
      userId
      startDate
      endDate
      createdAt
      updatedAt
    }
  }
`;

export const GET_OUTAGE_QUERY = gql`
  query GetOutage($id: Float!) {
    outage(id: $id) {
      id
      description
      latitude
      longitude
      reportCount
      resolvedStatus
      userId
      startDate
      endDate
      createdAt
      updatedAt
    }
  }
`;

// Dashboard Data
export const GET_DASHBOARD_STATS_QUERY = gql`
  query GetDashboardStats {
    dashboardStats {
      totalOutages
      activeOutages
      totalReports
      pendingReports
    }
  }
`;

export const GET_MAP_DATA_QUERY = gql`
  query GetMapData {
    mapData {
      outages {
        id
        type
        latitude
        longitude
        resolved
        reportCount
      }
      reports {
        id
        type
        latitude
        longitude
        status
        impactType
      }
    }
  }
`;

// Reports Analysis
export const GET_REPORTS_BY_IMPACT_TYPE_QUERY = gql`
  query GetReportsByImpactType {
    reportsByImpactType {
      impactTypeId
      impactTypeName
      count
    }
  }
`;

export const GET_MONTHLY_REPORT_COUNTS_QUERY = gql`
  query GetMonthlyReportCounts($days: Int) {
    monthlyReportCounts(days: $days) {
      date
      count
    }
  }
`;