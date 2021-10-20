/* istanbul ignore file */
// ignore for coverage as we don't use apollo 1-8-2020

import { ApolloClient } from 'apollo-client';
import { HttpLink } from 'apollo-link-http';
import { onError } from 'apollo-link-error';
import { InMemoryCache } from 'apollo-cache-inmemory';
import api from '../redux/service/api';
import { history } from '../redux/store';
import { removeCookies } from '../utils';

// Base URL for GraphQL service
const url = new HttpLink({
    uri: `${api.ROOT_URL}/graphql`,
    credentials: 'include',
    opts: {
        credentials: 'include',
    },
    headers: {
        'Cache-Control': 'no-store,no-cache,max-age=0,private',
        Pragma: 'no-cache',
        // TODO: replace with Cookie.get()
        // 'X-CSRF-Token':
        //     process.env.NODE_ENV === 'production' ? document.head.querySelector('[name~=csrf][content]').content : '',
    },
});

// Apollo GraphQL client error handling
const errorHandling = onError(({ graphQLErrors, networkError }) => {
    if (graphQLErrors) {
        graphQLErrors.map(({ message, locations, path }) =>
            console.log(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`),
        );
    }

    if (networkError.statusCode === 401 || networkError.statusCode === 422) {
        removeCookies();
        history.push(`${process.env.PUBLIC_URL}/`);
    } else if (networkError.statusCode >= 400) {
        if (networkError) {
            console.log(`[Network error]: ${networkError}`);
        }
    }
});

// Create Apollo GraphQL client
export const client = new ApolloClient({
    cache: new InMemoryCache(),
    defaultOptions: {
        query: {
            fetchPolicy: 'no-cache',
            errorPolicy: 'all',
        },
        mutate: {
            fetchPolicy: 'no-cache',
            errorPolicy: 'all',
        },
    },
    fetchOptions: {
        credentials: 'include',
    },
    credentials: 'include',
    link: errorHandling.concat(url),
});
