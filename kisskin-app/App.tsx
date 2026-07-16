import { useRef, useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  SafeAreaView,
  StyleSheet,
  Platform,
  BackHandler,
  ActivityIndicator,
  View,
  Alert,
} from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import * as ImagePicker from 'expo-image-picker';
import * as Notifications from 'expo-notifications';
import { getLocales } from 'expo-localization';
// SDK 54: 기본 export 는 신형 API — 구형(writeAsStringAsync 등)은 /legacy 로 이동됨
import * as FileSystem from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';

const SITE_URL = 'https://kissinskin.net';

// 웹뷰 기본 UA 에는 "; wv)" 토큰이 들어가 Google OAuth 가 403(disallowed_useragent)으로
// 차단되고, 사이트의 인앱브라우저 판정에도 걸린다. → 일반 크롬 UA 로 교체해
// 구글 로그인이 앱 안에서 그대로 되게 한다. (앱 식별은 UA 가 아니라
// window.ReactNativeWebView 존재 여부로 한다 — 웹 쪽 isNativeApp())
const CHROME_UA =
  'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36';

// EAS project id — expo-notifications 토큰 발급에 필수 (app.json extra.eas.projectId 와 동일해야 함)
const PROJECT_ID = 'dbe9cc76-db58-41e5-8aaf-0532309e1198';

// 발급받은 Expo 푸시 토큰을 저장할 우리 서버 엔드포인트
const PUSH_REGISTER_URL = `${SITE_URL}/api/register-push-token`;

// 재방문 유도용 로컬 알림 — 마지막 앱 실행 시점 기준 N일 뒤 1회 예약
const REENGAGE_DAYS = 3;
const REENGAGE_ID = 'reengage-reminder'; // 중복 예약 방지용 식별자

// 포그라운드(앱이 열려 있을 때)에도 알림 배너를 띄운다
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// 기기 언어 감지 — 실패 시 영어로 폴백.
// ⚠️ NativeModules.I18nManager 방식은 newArchEnabled 에서 undefined 라
//    한국어 폰이 en 으로 오분류됐음(실기기 실측) → expo-localization 으로 교체.
function getDeviceLang(): 'ko' | 'en' {
  try {
    const code = getLocales()[0]?.languageCode;
    if (typeof code === 'string' && code.toLowerCase().startsWith('ko')) return 'ko';
  } catch {
    // ignore — fall through to default
  }
  return 'en';
}

// 재방문 유도 로컬 알림 문구 (기기 언어 기준)
const REENGAGE_COPY = {
  ko: {
    title: '오늘의 뷰티 픽 💄',
    body: '새로운 메이크업 룩과 인기 제품이 올라왔어요. 다시 확인해볼까요?',
  },
  en: {
    title: 'Your daily beauty pick 💄',
    body: 'Fresh makeup looks and trending products are waiting. Take a look?',
  },
} as const;

// 웹 → 네이티브 브릿지 메시지 (웹 쪽 대응: src/lib/nativePicker.ts)
type BridgeMessage =
  | { type: 'pickGallery' | 'pickCamera' }
  | { type: 'saveImage'; dataUrl: string }    // 결과 이미지를 갤러리에 저장
  | { type: 'shareImage'; dataUrl: string };  // 결과 이미지를 시스템 공유 시트로

// dataURL 의 base64 본문을 캐시 파일로 내려 파일 URI 를 돌려준다.
// (MediaLibrary/Sharing 은 dataURL 을 못 받고 파일 URI 만 받는다)
async function dataUrlToCacheFile(dataUrl: string, name: string): Promise<string | null> {
  const base64 = dataUrl.split(',')[1];
  if (!base64) return null;
  const fileUri = `${FileSystem.cacheDirectory}${name}`;
  await FileSystem.writeAsStringAsync(fileUri, base64, {
    encoding: FileSystem.EncodingType.Base64,
  });
  return fileUri;
}

// 갤러리 저장. 성공 여부를 돌려준다(실패해도 앱은 안 죽는다).
async function saveImageToGallery(dataUrl: string): Promise<boolean> {
  try {
    // writeOnly=true: 저장만 할 거라 사진 읽기 권한까지 요구하지 않는다
    const perm = await MediaLibrary.requestPermissionsAsync(true);
    if (!perm.granted) return false;
    const fileUri = await dataUrlToCacheFile(dataUrl, `kisskin-makeup-${Date.now()}.jpg`);
    if (!fileUri) return false;
    await MediaLibrary.saveToLibraryAsync(fileUri);
    return true;
  } catch (err) {
    console.warn('[bridge] save failed:', err);
    return false;
  }
}

// 시스템 공유 시트로 이미지 공유. 시트가 닫힌 뒤 resolve 된다.
async function shareImageFile(dataUrl: string): Promise<boolean> {
  try {
    if (!(await Sharing.isAvailableAsync())) return false;
    const fileUri = await dataUrlToCacheFile(dataUrl, `kisskin-share-${Date.now()}.jpg`);
    if (!fileUri) return false;
    await Sharing.shareAsync(fileUri, { mimeType: 'image/jpeg', dialogTitle: 'kissinskin' });
    return true;
  } catch (err) {
    console.warn('[bridge] share failed:', err);
    return false;
  }
}

// 알림 권한 요청 + Expo 푸시 토큰 발급. 실패해도 절대 앱을 죽이지 않는다.
async function registerForPushAsync(): Promise<string | null> {
  try {
    // 안드로이드는 채널이 있어야 알림이 뜬다
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.DEFAULT,
        lightColor: '#eb4763',
      });
    }

    const existing = await Notifications.getPermissionsAsync();
    let status = existing.status;
    if (status !== 'granted') {
      const req = await Notifications.requestPermissionsAsync();
      status = req.status;
    }
    if (status !== 'granted') return null;

    const tokenResult = await Notifications.getExpoPushTokenAsync({
      projectId: PROJECT_ID,
    });
    return tokenResult.data; // "ExponentPushToken[...]"
  } catch (err) {
    console.warn('[push] register failed:', err);
    return null;
  }
}

// 토큰을 우리 서버(KV)에 저장. 실패는 조용히 무시(다음 실행 때 재시도됨).
async function sendTokenToServer(token: string) {
  try {
    await fetch(PUSH_REGISTER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token,
        platform: Platform.OS,
        lang: getDeviceLang(),
      }),
    });
  } catch (err) {
    console.warn('[push] token upload failed:', err);
  }
}

// 재방문 유도 로컬 알림을 (매 실행마다) 다시 예약. 항상 1개만 유지.
async function scheduleReengagement() {
  try {
    // 기존 예약 취소 후 재예약 → "마지막 실행 + N일" 시점으로 갱신
    await Notifications.cancelScheduledNotificationAsync(REENGAGE_ID).catch(() => {});
    const copy = REENGAGE_COPY[getDeviceLang()];
    await Notifications.scheduleNotificationAsync({
      identifier: REENGAGE_ID,
      content: {
        title: copy.title,
        body: copy.body,
        data: { url: `${SITE_URL}/` },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 60 * 60 * 24 * REENGAGE_DAYS,
      },
    });
  } catch (err) {
    console.warn('[push] schedule failed:', err);
  }
}

export default function App() {
  const webViewRef = useRef<WebView>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  // 알림 탭으로 앱이 열렸을 때 이동할 URL (웹뷰 준비 전이면 여기 담아뒀다가 로드 후 이동)
  const pendingUrlRef = useRef<string | null>(null);

  // 알림 data.url 로 웹뷰를 이동시킨다
  const navigateTo = (url: string) => {
    const ref = webViewRef.current;
    if (!ref) {
      pendingUrlRef.current = url;
      return;
    }
    ref.injectJavaScript(`window.location.href = ${JSON.stringify(url)}; true;`);
  };

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

  // 푸시 알림 부트스트랩: 권한/토큰/로컬알림/탭 리스너
  useEffect(() => {
    let mounted = true;

    (async () => {
      const token = await registerForPushAsync();
      if (mounted && token) await sendTokenToServer(token);
      await scheduleReengagement();
    })();

    // 앱이 종료된 상태에서 알림 탭으로 열린 경우 처리
    Notifications.getLastNotificationResponseAsync().then((response) => {
      const url = response?.notification.request.content.data?.url;
      if (typeof url === 'string' && url) navigateTo(url);
    });

    // 앱 실행 중/백그라운드에서 알림 탭 시 처리
    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      const url = response.notification.request.content.data?.url;
      if (typeof url === 'string' && url) navigateTo(url);
    });

    return () => {
      mounted = false;
      sub.remove();
    };
  }, []);

  const sendResult = (dataUrl: string | null) => {
    const ref = webViewRef.current;
    if (!ref) return;
    const payload = JSON.stringify({ canceled: dataUrl === null, dataUrl });
    ref.injectJavaScript(
      `window.dispatchEvent(new CustomEvent('nativePickResult', { detail: ${payload} })); true;`
    );
  };

  // 저장/공유 결과를 웹으로 돌려준다 (웹 쪽: nativeSaveResult/nativeShareResult 리스너)
  const sendBridgeResult = (eventName: string, ok: boolean) => {
    const ref = webViewRef.current;
    if (!ref) return;
    ref.injectJavaScript(
      `window.dispatchEvent(new CustomEvent(${JSON.stringify(eventName)}, { detail: { ok: ${ok} } })); true;`
    );
  };

  const handleMessage = async (event: WebViewMessageEvent) => {
    let msg: BridgeMessage | null = null;
    try {
      msg = JSON.parse(event.nativeEvent.data);
    } catch {
      return;
    }
    if (!msg) return;

    if (msg.type === 'saveImage') {
      const ok = await saveImageToGallery(msg.dataUrl);
      sendBridgeResult('nativeSaveResult', ok);
      return;
    }
    if (msg.type === 'shareImage') {
      const ok = await shareImageFile(msg.dataUrl);
      sendBridgeResult('nativeShareResult', ok);
      return;
    }
    if (msg.type !== 'pickGallery' && msg.type !== 'pickCamera') return;

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
        onLoadEnd={() => {
          setIsLoading(false);
          // 알림 탭으로 대기 중이던 이동이 있으면 로드 완료 후 실행
          if (pendingUrlRef.current) {
            navigateTo(pendingUrlRef.current);
            pendingUrlRef.current = null;
          }
        }}
        onMessage={handleMessage}
        userAgent={CHROME_UA}
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
