import { AppRegistry, NativeModules } from 'react-native';
import App from './src/App';
import { name as appName } from './app.json';

setTimeout(() => {
  NativeModules.RNBootSplash.hide(true); // 隐藏启动屏
}, 1500);

AppRegistry.registerComponent(appName, () => App);
