import { ThemeProvider, GlobalStyle } from '@react95/core';
import { AudioContextProvider } from '../context/AudioContextProvider';
import 'leaflet/dist/leaflet.css';

export default function App({ Component, pageProps }) {
  return (
    <ThemeProvider>
      <GlobalStyle />
      <AudioContextProvider>
        <Component {...pageProps} />
      </AudioContextProvider>
    </ThemeProvider>
  );
}
