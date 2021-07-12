import { AppRegistry } from 'react-native';
import RNBootSplash from 'react-native-bootsplash';
import App from './src/App';
import { name as appName } from './app.json';

setTimeout(() => {
  RNBootSplash.hide({ duration: 550 }); // 隐藏启动屏
}, 2500);

AppRegistry.registerComponent(appName, () => App);
