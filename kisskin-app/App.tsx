import { useRef, useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet, Platform, BackHandler, ActivityIndicator, View, Alert } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import * as ImagePicker from 'expo-image-picker';

const SITE_URL = 'https://kissinskin.net';

type PickMessage = { type: 'pickGallery' | 'pickCamera' };

export default function App() {
  const webViewRef = useRef<WebView>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (Platform.OS !== 'android') return;

    const handler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (canGoBack && webViewRef.current) {
        webViewRef.current.goBack();
        return true;
      }
      return false;
    });

    return () => handler.remove();
  }, [canGoBack]);

  const sendResult = (dataUrl: string | null) => {
    const ref = webViewRef.current;
    if (!ref) return;
    const payload = JSON.stringify({ canceled: dataUrl === null, dataUrl });
    ref.injectJavaScript(
      `window.dispatchEvent(new CustomEvent('nativePickResult', { detail: ${payload} })); true;`
    );
  };

  const handleMessage = async (event: WebViewMessageEvent) => {
    let msg: PickMessage | null = null;
    try {
      msg = JSON.parse(event.nativeEvent.data);
    } catch {
      return;
    }
    if (!msg || (msg.type !== 'pickGallery' && msg.type !== 'pickCamera')) return;

    const isCamera = msg.type === 'pickCamera';
    try {
      const perm = isCamera
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!perm.granted) {
        Alert.alert(
          '권한 필요',
          isCamera ? '카메라 권한을 허용해 주세요.' : '갤러리 접근 권한을 허용해 주세요.'
        );
        sendResult(null);
        return;
      }

      const options: ImagePicker.ImagePickerOptions = {
        mediaTypes: ['images'],
        quality: 0.9,
        base64: true,
        allowsEditing: false,
      };

      const result = isCamera
        ? await ImagePicker.launchCameraAsync(options)
        : await ImagePicker.launchImageLibraryAsync(options);

      if (result.canceled || !result.assets?.[0]) {
        sendResult(null);
        return;
      }

      const asset = result.assets[0];
      if (!asset.base64) {
        sendResult(null);
        return;
      }
      const mime = asset.mimeType || 'image/jpeg';
      sendResult(`data:${mime};base64,${asset.base64}`);
    } catch (err) {
      Alert.alert('오류', '사진을 불러오지 못했습니다. 다시 시도해 주세요.');
      sendResult(null);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" backgroundColor="#ffffff" />
      {isLoading && (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#eb4763" />
        </View>
      )}
      <WebView
        ref={webViewRef}
        source={{ uri: SITE_URL }}
        style={styles.webview}
        onNavigationStateChange={(navState) => setCanGoBack(navState.canGoBack)}
        onLoadEnd={() => setIsLoading(false)}
        onMessage={handleMessage}
        javaScriptEnabled
        domStorageEnabled
        allowsBackForwardNavigationGestures
        mediaPlaybackRequiresUserAction={false}
        allowsInlineMediaPlayback
        startInLoadingState={false}
        cacheEnabled
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  webview: {
    flex: 1,
  },
  loader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    zIndex: 10,
  },
});
