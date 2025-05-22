import { ApolloClient, InMemoryCache, createHttpLink, NormalizedCacheObject } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { QueueLink } from 'apollo-link-queue';
import { persistCache } from 'apollo3-cache-persist';
import { onError } from '@apollo/client/link/error';
import { RetryLink } from '@apollo/client/link/retry';
import { useNetworkStore } from '../store/networkStore';

// Cache persistence setup
const cache = new InMemoryCache();

export const setupCache = async () => {
  try {
    await persistCache({
      cache,
      storage: AsyncStorage,
      maxSize: false,
      debug: __DEV__,
    });
  } catch (error) {
    console.error('Error persisting cache:', error);
  }
};

// Queue link for offline support
const queueLink = new QueueLink();

// Auth link for authentication
const authLink = setContext(async (_, { headers }) => {
  try {
    const token = await AsyncStorage.getItem('auth_token');
    return {
      headers: {
        ...headers,
        authorization: token ? `Bearer ${token}` : "",
      }
    };
  } catch (error) {
    console.error('Error getting auth token:', error);
    return { headers };
  }
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

// HTTP link - Vérifiez que l'URL est correcte
const graphqlUri = Constants.expoConfig?.extra?.EXPO_PUBLIC_GRAPHQL_URL || 'http://localhost:4000/graphql';

if (!Constants.expoConfig?.extra?.EXPO_PUBLIC_GRAPHQL_URL) {
  console.warn("EXPO_PUBLIC_GRAPHQL_URL is not set. Using default http://localhost:4000/graphql. Please set this in your app.json or app.config.js under extra.");
}

const httpLink = createHttpLink({
  uri: graphqlUri,
});

// Client instance avec gestion d'erreur
let client: ApolloClient<NormalizedCacheObject>;

try {
  client = new ApolloClient({
    link: authLink.concat(errorLink).concat(retryLink).concat(queueLink).concat(httpLink),
    cache,
    defaultOptions: {
      watchQuery: {
        fetchPolicy: 'cache-and-network',
        errorPolicy: 'all',
      },
      query: {
        errorPolicy: 'all',
      },
    },
    connectToDevTools: __DEV__,
  });
} catch (error) {
  console.error('Error creating Apollo Client:', error);
  // Fallback client
  client = new ApolloClient({
    uri: graphqlUri, // Use the same variable here
    cache: new InMemoryCache(),
  });
}

export { client };

// Network status management
export const handleNetworkStatusChange = (isConnected: boolean) => {
  try {
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
  } catch (error) {
    console.error('Error handling network status change:', error);
  }
};

// Note: EXPO_PUBLIC_GRAPHQL_URL needs to be defined in the `extra` field of `app.json` or `app.config.js`.
// Example for `app.json`:
// {
//   "expo": {
//     "extra": {
//       "EXPO_PUBLIC_GRAPHQL_URL": "your_graphql_endpoint_here"
//     }
//   }
// }
