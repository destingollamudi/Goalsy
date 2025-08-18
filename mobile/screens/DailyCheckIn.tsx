import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button, Image, TouchableOpacity } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useState, useRef } from 'react';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  runOnJS 
} from 'react-native-reanimated';

interface DailyCheckInProps {
  onClose: () => void;
}

export default function DailyCheckIn({ onClose }: DailyCheckInProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraVisible, setCameraVisible] = useState(true);
  const [frontPhoto, setFrontPhoto] = useState<string | null>(null);
  const [backPhoto, setBackPhoto] = useState<string | null>(null);
  const [retries, setRetries] = useState(0);
  const [currentCamera, setCurrentCamera] = useState<'back' | 'front'>('back');
  const cameraRef = useRef<CameraView>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isSwapped, setIsSwapped] = useState(false);
  const [hideSmallPhoto, setHideSmallPhoto] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const tapSmallPhoto = Gesture.Tap()
    .onEnd(() => {
      runOnJS(setIsSwapped)(!isSwapped);
    });

  const longPressPhoto = Gesture.LongPress()
    .minDuration(500)
    .onStart(() => {
      console.log('Long press started - hiding small photo');
      runOnJS(setHideSmallPhoto)(true); 
    })
    .onEnd(() => {
      console.log('Long press ended - showing small photo');
      runOnJS(setHideSmallPhoto)(false);
    });

  const pinchGesture = Gesture.Pinch()
    .onUpdate((event) => {
      scale.value = Math.max(1, Math.min(event.scale, 3));
      // Set isZoomed when scale > 1
      if (scale.value > 1) {
        runOnJS(setIsZoomed)(true);
      }
    })
    .onEnd(() => {
      scale.value = withSpring(1);
      // Reset isZoomed when pinch ends
      runOnJS(setIsZoomed)(false);
    });

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      if (scale.value > 1) {
        translateX.value = event.translationX;
        translateY.value = event.translationY;
      }
    })
    .onEnd(() => {
      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
    });

  const mainPhotoGesture = Gesture.Simultaneous(
    longPressPhoto,
    pinchGesture,
    panGesture
  );

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value },
        { translateX: translateX.value },
        { translateY: translateY.value },
      ],
    };
  });

  const takeBeRealPhoto = async () => {
    if (!cameraRef || isCapturing) return;
    
    setIsCapturing(true);
    
    try {
      console.log('Taking back camera photo...');
      const backPhotoResult = await cameraRef.current?.takePictureAsync();
      if (backPhotoResult?.uri) {
        setBackPhoto(backPhotoResult.uri);
      }
      console.log('Back photo captured:', backPhotoResult?.uri || 'No photo captured');
      
      setCurrentCamera('front');
      console.log('Switching to front camera...');
      
      await new Promise<void>(resolve => setTimeout(() => resolve(), 1500));
      
      console.log('Taking front camera photo...');
      const frontPhotoResult = await cameraRef.current?.takePictureAsync();
      if (frontPhotoResult?.uri) {
        setFrontPhoto(frontPhotoResult.uri);
      }
      console.log('Front photo captured:', frontPhotoResult?.uri || 'No photo captured');
      
      setCurrentCamera('back');
      setCameraVisible(false);
      
    } catch (error) {
      console.log('Error taking BeReal photo:', error);
    } finally {
      setRetries(retries + 1);
      setIsCapturing(false);
    }
  };

  if (!permission) {
    return <View style={styles.container}><Text>Loading...</Text></View>;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }

return (
    <>
      {!cameraVisible ? (
        <GestureHandlerRootView style={{ flex: 1 }}>
          <View style={styles.photoDisplayContainer}>
            <Text style={styles.goalText}>Your Goal Check-in!</Text>
            
            <View style={styles.photoContainer}>
              
              {/* Main photo with zoom and long press */}
              <GestureDetector gesture={mainPhotoGesture}>
                <Animated.View style={[styles.mainPhotoContainer, animatedStyle]}>
                  <Image 
                    source={{ uri: (isSwapped ? frontPhoto : backPhoto) || '' }} 
                    style={styles.backPhoto} 
                  />
                </Animated.View>
              </GestureDetector>
              
              {/* Small photo with tap to swap - conditionally rendered */}
              { (!hideSmallPhoto && !isZoomed) && (
                <GestureDetector gesture={tapSmallPhoto}>
                  <View style={styles.frontPhotoContainer}>
                    <Image 
                      source={{ uri: (isSwapped ? backPhoto : frontPhoto) || '' }} 
                      style={styles.frontPhoto} 
                    />
                  </View>
                </GestureDetector>
              )}
              
            </View>
            
            <View style={styles.buttonRow}>
              <Button 
                title="Retake" 
                onPress={() => {
                  setFrontPhoto(null);
                  setBackPhoto(null);
                  setCameraVisible(true);
                  setIsSwapped(false);
                  setHideSmallPhoto(false); // Reset small photo visibility
                  scale.value = 1;
                  translateX.value = 0;
                  translateY.value = 0;
                }} 
              />
              <Button title="Done" onPress={onClose} />
            </View>
          </View>
        </GestureHandlerRootView>
      ) : (
        <View style={styles.cameraContainer}>
          <Text style={styles.cameraTitle}>Goalsy</Text>
          <CameraView 
            style={styles.camera} 
            facing={currentCamera}
            ref={cameraRef}
          />
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onClose}
          >
            <Text style={styles.cancelText}>←</Text>
          </TouchableOpacity>

          <View style={styles.cameraButtonsContainer}>
            <TouchableOpacity
              style={styles.captureButton}
              onPress={takeBeRealPhoto}
              disabled={isCapturing}
            >
              <View style={styles.captureButtonInner} />
            </TouchableOpacity>
          </View>
        </View>
      )}
      <StatusBar style="auto" />
    </>
  );
}

const styles = StyleSheet.create({
  photoDisplayContainer: {
  flex: 1,
  backgroundColor: 'black',
  alignItems: 'center',
  justifyContent: 'flex-start',
  paddingTop: 150,
  },
  mainPhotoContainer: {
    width: '100%',
    height: '100%',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 15,
    marginTop: 20,
  },
  fullScreenContainer: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenPhoto: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    padding: 15,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 25,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraTitle: {
    position: 'absolute',
    top: 50,
    color: 'white',
    fontSize: 50,
    fontWeight: 'bold',
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 15
  },
  camera: {
    width: '100%',
    height: '75%',
    borderRadius: 20,
    overflow: 'hidden',
  },
  cameraButtonsContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  captureButton: {
    width: 80, 
    height: 80, 
    borderRadius: 40, 
    backgroundColor: 'white',
    borderWidth: 10, 
    borderColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 65, 
    height: 65, 
    borderRadius: 32.5,
    backgroundColor: 'white',
    borderColor: 'black',
    borderWidth: 2,
  },
  cancelButton: {
    position: 'absolute',
    top: 60, 
    left: 30, 
    padding: 0, 
  },
  cancelText: {
    color: 'white',
    fontSize: 50,
    fontWeight: 'bold',
  },
  previewContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  goalText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: 'white',
  },
  photoContainer: {
    position: 'relative',
    width: 350,
    height: 500,
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'white'
  },
  backPhoto: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  frontPhotoContainer: {
    position: 'absolute',
    top: 15,
    left: 15,
    width: 120,
    height: 160,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'white',
  },
  frontPhoto: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
});