import { StatusBar } from "expo-status-bar";
import { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import WebView from "react-native-webview";
import { SITE_URL } from "./src/config";

const NAVY = "#0c1929";
const ACCENT = "#7dd3fc";

function AppBody() {
  const insets = useSafeAreaInsets();
  const webRef = useRef<WebView>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(() => {
    setError(null);
    setLoading(true);
    webRef.current?.reload();
  }, []);

  const openInBrowser = useCallback(() => {
    Linking.openURL(SITE_URL).catch(() => {});
  }, []);

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <View
        style={[
          styles.header,
          {
            paddingTop: Math.max(insets.top, 8),
            paddingBottom: 10,
          },
        ]}
      >
        <View style={styles.headerRow}>
          <Text style={styles.brand}>TTPSSWA</Text>
          <View style={styles.headerActions}>
            <Pressable onPress={reload} style={styles.headerBtn} hitSlop={8}>
              <Text style={styles.headerBtnText}>Reload</Text>
            </Pressable>
            <Pressable onPress={openInBrowser} style={styles.headerBtn} hitSlop={8}>
              <Text style={styles.headerBtnText}>Browser</Text>
            </Pressable>
          </View>
        </View>
        <Text style={styles.subline} numberOfLines={1}>
          {SITE_URL}
        </Text>
      </View>

      {error ? (
        <View style={styles.errorScreen}>
          <Text style={styles.errorTitle}>Could not load the site</Text>
          <Text style={styles.errorMsg}>{error}</Text>
          <Text style={styles.errorHint}>
            Set EXPO_PUBLIC_SITE_URL in .env to your production URL, or use Reload
            after you start the dev server.
          </Text>
          <Pressable style={styles.retryBtn} onPress={reload}>
            <Text style={styles.retryText}>Try again</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.webWrap}>
          <WebView
            ref={webRef}
            source={{ uri: SITE_URL }}
            style={styles.webview}
            onLoadStart={() => {
              setLoading(true);
              setError(null);
            }}
            onLoadEnd={() => setLoading(false)}
            onError={(e) => {
              setLoading(false);
              setError(
                e.nativeEvent.description ||
                  "Check your connection and EXPO_PUBLIC_SITE_URL in .env",
              );
            }}
            onHttpError={(e) => {
              if (e.nativeEvent.statusCode >= 400) {
                setLoading(false);
                setError(`HTTP ${e.nativeEvent.statusCode}`);
              }
            }}
            javaScriptEnabled
            domStorageEnabled
            allowsBackForwardNavigationGestures
            setSupportMultipleWindows={false}
            originWhitelist={["*"]}
            sharedCookiesEnabled
          />
          {loading ? (
            <View style={styles.loadingOverlay} pointerEvents="none">
              <ActivityIndicator size="large" color={ACCENT} />
            </View>
          ) : null}
        </View>
      )}
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppBody />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: NAVY,
  },
  header: {
    backgroundColor: NAVY,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.12)",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brand: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  headerActions: {
    flexDirection: "row",
    gap: 16,
  },
  headerBtn: {
    paddingVertical: 4,
  },
  headerBtnText: {
    color: ACCENT,
    fontSize: 15,
    fontWeight: "600",
  },
  subline: {
    marginTop: 6,
    color: "rgba(255,255,255,0.45)",
    fontSize: 11,
  },
  webWrap: {
    flex: 1,
    position: "relative",
  },
  webview: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(12,25,41,0.2)",
  },
  errorScreen: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    backgroundColor: NAVY,
  },
  errorTitle: {
    color: "#fecaca",
    fontWeight: "700",
    fontSize: 18,
  },
  errorMsg: {
    color: "rgba(255,255,255,0.85)",
    marginTop: 10,
    fontSize: 14,
    lineHeight: 20,
  },
  errorHint: {
    color: "rgba(255,255,255,0.5)",
    marginTop: 16,
    fontSize: 13,
    lineHeight: 18,
  },
  retryBtn: {
    marginTop: 24,
    alignSelf: "flex-start",
    backgroundColor: ACCENT,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: NAVY,
    fontWeight: "700",
    fontSize: 16,
  },
});
