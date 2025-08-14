import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button, Image, TouchableOpacity } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useState } from 'react';
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
  const [cameraRef, setCameraRef] = useState<CameraView | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isSwapped, setIsSwapped] = useState(false);
  const [showingOnlyMainPhoto, setShowingOnlyMainPhoto] = useState(false);
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const tapSmallPhoto = Gesture.Tap()
    .onEnd(() => {
      runOnJS(setIsSwapped)(!isSwapped);
    });

  const longPressPhoto = Gesture.LongPress()
    .minDuration(500)
    .onEnd(() => {
      runOnJS(setShowingOnlyMainPhoto)(true);
    });

  const pinchGesture = Gesture.Pinch()
    .onUpdate((event) => {
      scale.value = Math.max(1, Math.min(event.scale, 3));
    })
    .onEnd(() => {
      scale.value = withSpring(1);
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
      const backPhotoResult = await cameraRef.takePictureAsync();
      setBackPhoto(backPhotoResult.uri);
      console.log('Back photo captured:', backPhotoResult.uri);
      
      setCurrentCamera('front');
      console.log('Switching to front camera...');
      
      await new Promise<void>(resolve => setTimeout(() => resolve(), 1500));
      
      console.log('Taking front camera photo...');
      const frontPhotoResult = await cameraRef.takePictureAsync();
      setFrontPhoto(frontPhotoResult.uri);
      console.log('Front photo captured:', frontPhotoResult.uri);
      
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
          {!showingOnlyMainPhoto ? (
            // Normal photo display with both photos
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
                
                {/* Small photo with tap to swap */}
                <GestureDetector gesture={tapSmallPhoto}>
                  <View style={styles.frontPhotoContainer}>
                    <Image 
                      source={{ uri: (isSwapped ? backPhoto : frontPhoto) || '' }} 
                      style={styles.frontPhoto} 
                    />
                  </View>
                </GestureDetector>
                
              </View>
              
              <View style={styles.buttonRow}>
                <Button 
                  title="Retake" 
                  onPress={() => {
                    setFrontPhoto(null);
                    setBackPhoto(null);
                    setCameraVisible(true);
                    setIsSwapped(false);
                    setShowingOnlyMainPhoto(false);
                    scale.value = 1;
                    translateX.value = 0;
                    translateY.value = 0;
                  }} 
                />
                <Button title="Done" onPress={onClose} />
              </View>
            </View>
          ) : (
            // Full screen main photo only
            <View style={styles.fullScreenContainer}>
              <Image 
                source={{ uri: (isSwapped ? frontPhoto : backPhoto) || '' }} 
                style={styles.fullScreenPhoto} 
              />
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowingOnlyMainPhoto(false)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
          )}
        </GestureHandlerRootView>
      ) : (
        <View style={styles.cameraContainer}>
          <Text style={styles.cameraTitle}>Goalsy</Text>
          <CameraView 
            style={styles.camera} 
            facing={currentCamera}
            ref={setCameraRef}
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
  backgroundColor: '#fff',
  alignItems: 'center',
  justifyContent: 'flex-start',
  paddingTop: 50,
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
  goalText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  photoContainer: {
    position: 'relative',
    width: 300,
    height: 400,
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 15,
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
    borderWidth: 3,
    borderColor: 'white',
  },
  frontPhoto: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
});