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

// Impact Types
export const CREATE_IMPACT_TYPE_MUTATION = gql`
  mutation CreateImpactType($createImpactTypeInput: CreateImpactTypeInput!) {
    createImpactType(createImpactTypeInput: $createImpactTypeInput) {
      id
      name
      emoji
    }
  }
`;

export const UPDATE_IMPACT_TYPE_MUTATION = gql`
  mutation UpdateImpactType($id: Float!, $updateImpactTypeInput: CreateImpactTypeInput!) {
    updateImpactType(id: $id, updateImpactTypeInput: $updateImpactTypeInput) {
      id
      name
      emoji
    }
  }
`;

// Reports
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

// Outages
export const CREATE_OUTAGE_MUTATION = gql`
  mutation CreateOutage($createOutageInput: CreateOutageInput!, $latitude: Float, $longitude: Float) {
    createOutage(createOutageInput: $createOutageInput, latitude: $latitude, longitude: $longitude) {
      id
      description
      latitude
      longitude
      reportCount
      resolvedStatus
      startDate
    }
  }
`;

export const RESOLVE_OUTAGE_MUTATION = gql`
  mutation ResolveOutage($id: Float!) {
    resolveOutage(id: $id) {
      id
      resolvedStatus
      endDate
    }
  }
`;