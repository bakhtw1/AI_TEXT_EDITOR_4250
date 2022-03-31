import { useState, useEffect, useRef, useMemo } from 'react';

const COLOR_SCHEMES = ['no-preference', 'dark', 'light'];
// const DEFAULT_TARGET_COLOR_SCHEME = 'light';

function getCurrentColorScheme() {
  const QUERIES: any = {};

  for (let scheme of COLOR_SCHEMES) {
    const query = QUERIES.hasOwnProperty(scheme)
      ? QUERIES[scheme]
      : (QUERIES[scheme] = matchMedia(`(prefers-color-scheme: ${scheme})`));

    if (query.matches) return { query, scheme };
  }
}

export enum ThemeStyle {
    light,
    dark,
}

export function useColorScheme(): ThemeStyle {
    const isMounted = useRef<boolean>();
    const colorScheme = useRef<{query: any, scheme: string}>();
  
    const [scheme, setColorScheme] = useState(() => {
        colorScheme.current = getCurrentColorScheme();

        return colorScheme.current?.scheme;
    });
  
    useEffect(() => {
        let query = colorScheme.current?.query;
  
        query.addEventListener('change', schemeChangeHandler);
        isMounted.current = true;
  
        function schemeChangeHandler(evt: any) {
            if (!evt.matches) {
                query.removeEventListener('change', schemeChangeHandler);
                colorScheme.current = getCurrentColorScheme();

                query = colorScheme.current?.query;
                const scheme = colorScheme.current?.scheme
        
                isMounted.current && setColorScheme(scheme);
                query.addEventListener('change', schemeChangeHandler);
            }
        }
  
        return () => {
            const query = colorScheme.current?.query;
            query.removeEventListener('change', schemeChangeHandler);
            isMounted.current = false;
        };
    }, []);

    if (scheme === undefined || !['light', 'dark'].includes(scheme)) {
        return ThemeStyle.light;
    }
  
    return ThemeStyle[scheme as keyof typeof ThemeStyle];
}

interface iTheme {
    colors: {
        toolbarBackground: string,
        explorerBackground: string,
        editorBackground: string
    },
    text: {
        color: string
    }
}

export function useTheme() {
    let colorScheme = useColorScheme();

    const themes: {[ThemeStyle.light]: iTheme, [ThemeStyle.dark]: iTheme} = {
        [ThemeStyle.light]: {
            colors: {
                toolbarBackground: '#e7e6e6',
                explorerBackground: '#e7e6e6',
                // explorerBackground: '#d0d1d3',
                editorBackground: '#ffffff'
            },
            text: {
                color: '#4b4a4a'
            }
        },
        [ThemeStyle.dark]: {
            colors: {
                toolbarBackground: '#262626',
                explorerBackground: '#262626',
                editorBackground: '#1e1e1e'
            },
            text: {
                color: '#f0f0f0'
            }
        }
    }

    return themes[colorScheme];
}

