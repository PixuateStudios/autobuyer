import React, { useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withRepeat, 
  withSequence,
  interpolate,
  Easing,
  withDelay
} from 'react-native-reanimated';
import { Image } from 'expo-image';

export function InnerCircleAnimation() {
  const transition = useSharedValue(0);

  // Timing Configuration (ms)
  const displayTime = 2000; // How long to show the Icon/Text
  const switchSpeed = 600;  // Transition duration

  useEffect(() => {
    // Reset and start sequence
    transition.value = 0;

    transition.value = withRepeat(
      withSequence(
        // 1. Hold on Icon (State 0)
        withTiming(0, { duration: displayTime }), 
        // 2. Animate to Text (State 1)
        withTiming(1, { duration: switchSpeed, easing: Easing.bezier(0.4, 0, 0.2, 1) }),
        // 3. Hold on Text (State 1)
        withTiming(1, { duration: displayTime }),
        // 4. Animate back to Icon (State 0)
        withTiming(0, { duration: switchSpeed, easing: Easing.bezier(0.4, 0, 0.2, 1) })
      ),
      -1, // Loop forever
      false
    );
  }, []);

  // Icon: Fades out and shrinks as value approaches 1
  const iconStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(transition.value, [0, 0.3], [1, 0]),
      transform: [
        { scale: interpolate(transition.value, [0, 0.3], [1, 0.5]) },
        { rotate: `${interpolate(transition.value, [0, 0.3], [0, -15])}deg` }
      ],
      position: 'absolute',
    };
  });

  // Text: Fades in and grows as value approaches 1
  const textStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(transition.value, [0.7, 1], [0, 1]),
      transform: [
        { scale: interpolate(transition.value, [0.7, 1], [0.7, 1]) },
        { translateX: interpolate(transition.value, [0.7, 1], [10, 0]) }
      ],
    };
  });
  
  const logoBStyle = useAnimatedStyle(() => {
      return {
        // It stays invisible until the sequence starts moving toward 1
        opacity: interpolate(transition.value, [0.7, 1], [0, 1]),
        transform: [
          // It starts smaller (0.5) and grows to full size (1)
          { scale: interpolate(transition.value, [0.7, 1], [0.5, 1]) },
          // Optional: give it a slight rotation as it enters for flair
          { rotate: `${interpolate(transition.value, [0.7, 1], [15, 0])}deg` }
        ],
        position: 'absolute', // Keep it centered on top of Logo A
      };
    });

  return (
    <View style={styles.container}>
      <Animated.View style={iconStyle}>
        <Image
          tintColor={"#00E567"}
          source={require("@/assets/icons/company/tire.svg")}
          placeholder={"tire"}
          style={{ width: 58, height: 67}}
          contentFit="contain"
        />
      </Animated.View>

      <Animated.View style={logoBStyle}>
        {/*<Text style={[globalStyles.h2, {textAlign:"center", fontSize:30}]}>Safest way to buy a car</Text>*/}
        <Image
          tintColor={"#0C6DFE"}
          source={require("@/assets/icons/company/tire.svg")}
          placeholder={"tire"}
          style={{ width: 58, height: 67}}
          contentFit="contain"
        />
      </Animated.View>
    </View>
  );
}

export function SpinningTextCircle()
{
  //Circle Degs 
  const rotation = useSharedValue(0);
  const duration = 40000; // ms
  
  useEffect(() => {
      rotation.value = withRepeat(
        withTiming(1, { 
          duration, 
          easing: Easing.linear // Linear is key for smooth constant speed
        }),
        -1, // -1 means infinite loop
        false // do not reverse the animation
      );
    }, []);
  
  const animatedStyle = useAnimatedStyle(() => {
      // Map the 0-1 value to a rotation degree
      const rotate = interpolate(
        rotation.value,
        [0, 1],
        [0, 360]
      );
  
      return {
        transform: [{ rotate: `${rotate}deg` }],
      };
    });
  
  return (
    <Animated.View style={[{position:"absolute"}, animatedStyle]}>
      <Image
        source={require("@/assets/icons/company/autoquestloop.svg")}
        placeholder={"o"}
        style={{ width: "100%", aspectRatio:"1/1", maxWidth:400}}
        contentFit="contain"
      />
    </Animated.View>

  )
}

/**
 * @param {React.ReactNode} children - The content to animate (your image or card)
 * @param {number} delay - Optional delay before the animation starts
 */
export function AnimatedEntryCard({ children, delay = 200 }) {
  const transition = useSharedValue(0);

  useEffect(() => {
    // Adding withDelay allows you to stagger multiple cards
    transition.value = 0;
    transition.value = withDelay(delay, withTiming(1, { 
      duration: 3000, 
      easing: Easing.bezier(0.2, 0.9, 0.4, 1), // Smooth "snap-in" feel
    }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { perspective: 1000 },
        // Moves from 60px down to 0
        { translateY: interpolate(transition.value, [0, 1], [500, 140]) },
        // Slight Z rotation for that "thrown on the table" look
        { rotateZ: `${interpolate(transition.value, [0, 1], [-10, 0])}deg` },
        // Subtle Y tilt to add 3D depth
        // { rotateY: `${interpolate(transition.value, [0, 1], [8, 0])}deg` },
        // Scale up from 90% to 100%
        { scale: interpolate(transition.value, [0, 1], [0.9, 1]) }
      ],
    };
  });

  return (
    <Animated.View style={animatedStyle}>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 100, // Fixed height prevents layout jumps
  },
  text: {
    fontSize: 22,
    fontWeight: '600',
    color: '#333',
  }
});