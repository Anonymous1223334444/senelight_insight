import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { QueueLink } from 'apollo-link-queue';
import { persistCache } from 'apollo-cache-persist';

// Créer le lien pour les requêtes en file d'attente (hors ligne)
const queueLink = new QueueLink();

// Mettre en file d'attente les requêtes quand l'appareil est hors ligne
window.addEventListener('offline', () => queueLink.close());
window.addEventListener('online', () => queueLink.open());

const httpLink = createHttpLink({
  uri: 'http://192.168.1.22:3000/graphql',
});

const authLink = setContext(async (_, { headers }) => {
    const token = await AsyncStorage.getItem('auth_token');

    return {
        headers: {
        ...headers,
        authorization: token ? `Bearer ${token}` : "",
        }
    };
});

// Créer le cache Apollo
const cache = new InMemoryCache();

// Persister le cache pour le mode hors ligne
persistCache({
  cache,
  storage: AsyncStorage,
});

export const client = new ApolloClient({
    link: authLink.concat(queueLink).concat(httpLink),
    cache,
    defaultOptions: {
      watchQuery: {
        fetchPolicy: 'cache-and-network',
      },
    },
});