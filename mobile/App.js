import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button, Image } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useState } from 'react';

export default function App() {
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraVisible, setCameraVisible] = useState(false);
  const [frontPhoto, setFrontPhoto] = useState(null);
  const [backPhoto, setBackPhoto] = useState(null);
  const [currentCamera, setCurrentCamera] = useState('back');
  const [cameraRef, setCameraRef] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const takeBeRealPhoto = async () => {
    if (!cameraRef || isCapturing) return;
    
    setIsCapturing(true);
    
    try {
      console.log('Taking back camera photo...');
      // Take back camera photo first (camera should already be on back)
      const backPhotoResult = await cameraRef.takePictureAsync();
      setBackPhoto(backPhotoResult.uri);
      console.log('Back photo captured:', backPhotoResult.uri);
      
      // Switch to front camera
      console.log('Switching to front camera...');
      setCurrentCamera('front');
      
      // Wait for camera to switch (important!)
      await new Promise(resolve => setTimeout(resolve, 800));
      
      console.log('Taking front camera photo...');
      const frontPhotoResult = await cameraRef.takePictureAsync();
      setFrontPhoto(frontPhotoResult.uri);
      console.log('Front photo captured:', frontPhotoResult.uri);
      
      // Done! Close camera
      setCameraVisible(false);
      setCurrentCamera('back'); // Reset for next time
      
    } catch (error) {
      console.log('Error taking BeReal photo:', error);
    } finally {
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
    <View style={styles.container}>
      {!cameraVisible ? (
        <>
          <Text>Ready to track your goal!</Text>
          <Button title="Take BeReal Photo for Goal" onPress={() => setCameraVisible(true)} />
          {(frontPhoto && backPhoto) && (
            <View style={styles.beRealContainer}>
              <Text style={styles.goalText}>Your Goal Check-in!</Text>
              
              {/* Main back camera photo */}
              <View style={styles.photoContainer}>
                <Image source={{ uri: backPhoto }} style={styles.backPhoto} />
                
                {/* Front camera photo overlay */}
                <View style={styles.frontPhotoContainer}>
                  <Image source={{ uri: frontPhoto }} style={styles.frontPhoto} />
                </View>
              </View>
              
              <Button 
                title="Take Another" 
                onPress={() => {
                  setFrontPhoto(null);
                  setBackPhoto(null);
                }} 
              />
            </View>
          )}
        </>
      ) : (
        <View style={styles.cameraContainer}>
          <CameraView 
            style={styles.camera} 
            facing={currentCamera}
            ref={setCameraRef}
          />
          <View style={styles.cameraButtons}>
            <Button 
              title={isCapturing ? "Capturing..." : "Take BeReal Photo"} 
              onPress={takeBeRealPhoto}
              disabled={isCapturing}
            />
            <Button title="Cancel" onPress={() => setCameraVisible(false)} />
          </View>
        </View>
      )}
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraContainer: {
    flex: 1,
    width: '100%',
  },
  camera: {
    flex: 1,
  },
  cameraButtons: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingVertical: 20,
  },
  previewContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  beRealContainer: {
    marginTop: 20,
    alignItems: 'center',
    width: '90%',
  },
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