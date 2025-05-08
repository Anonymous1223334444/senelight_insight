import { ApolloClient, InMemoryCache, createHttpLink, NormalizedCacheObject } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { QueueLink } from 'apollo-link-queue';
import { persistCache } from 'apollo3-cache-persist';
import { onError } from '@apollo/client/link/error';
import { RetryLink } from '@apollo/client/link/retry';
import { useNetworkStore } from '../store/networkStore';

// Cache persistence setup
const cache = new InMemoryCache();

export const setupCache = async () => {
  await persistCache({
    cache,
    storage: AsyncStorage,
    maxSize: false,
    debug: __DEV__,
  });
};

// Queue link for offline support
const queueLink = new QueueLink();

// Auth link for authentication
const authLink = setContext(async (_, { headers }) => {
  const token = await AsyncStorage.getItem('auth_token');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    }
  };
});

// Error handling link
const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) =>
      console.log(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
      ),
    );
  }
  if (networkError) {
    console.log(`[Network error]: ${networkError}`);
  }
});

// Retry link for connection issues
const retryLink = new RetryLink({
  delay: {
    initial: 1000,
    max: 5000,
    jitter: true,
  },
  attempts: {
    max: 3,
    retryIf: (error, operation) => !!error && operation.operationName !== 'login',
  },
});

// HTTP link
const httpLink = createHttpLink({
  uri: 'http://192.168.1.22:3000/graphql', // Android emulator
  // uri: 'http://localhost:3000/graphql', // iOS simulator
});

// Client instance
export const client = new ApolloClient({
  link: authLink.concat(errorLink).concat(retryLink).concat(queueLink).concat(httpLink),
  cache,
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
    },
  },
  connectToDevTools: __DEV__,
});

// Network status management
export const handleNetworkStatusChange = (isConnected: boolean) => {
  useNetworkStore.getState().updateConnectionStatus(isConnected);
  
  if (isConnected) {
    // Start processing queued operations
    queueLink.open();
    console.log('Network connection restored - processing queued operations');
  } else {
    // Stop processing and start queueing operations
    queueLink.close();
    console.log('Network connection lost - queueing operations');
  }
};