declare module "react-native-voip-push-notification" {
  type Handler = (...args: never[]) => void;
  const VoipPushNotification: {
    addEventListener: (type: string, handler: Handler) => void;
    removeEventListener: (type: string) => void;
    registerVoipToken: () => void;
    onVoipNotificationCompleted: (uuid: string) => void;
  };
  export default VoipPushNotification;
}
