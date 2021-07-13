import * as React from 'react';

import {
  StyleSheet,
  View,
  Text,
  Button,
  Dimensions,
  TouchableOpacityBase,
  TouchableOpacity,
} from 'react-native';
import Echarts from '@kafudev/react-native-echarts';
const { height, width } = Dimensions.get('window');
export default function App() {
  let [count, setCount] = React.useState(0);
  let [option, setOption] = React.useState(null);
  let [theme, setTheme] = React.useState(null);
  let [opts, setOpts] = React.useState({
    renderer: 'svg'
  });
  const [result, setResult] = React.useState<number | undefined>(0);
  let _option: object = {
    title: {
      text: 'ECharts 示例',
    },
    tooltip: {
      trigger: 'item',
    },
    legend: {
      top: '5%',
      left: 'center',
    },
    series: [
      {
        name: '访问来源',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: {
          show: false,
          position: 'center',
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '40',
            fontWeight: 'bold',
          },
        },
        labelLine: {
          show: false,
        },
        data: [
          { value: 1048, name: '搜索引擎' },
          { value: 735, name: '直接访问' },
          { value: 580, name: '邮件营销' },
          { value: 484, name: '联盟广告' },
          { value: 300, name: '视频广告' },
        ],
      },
    ],
  };

  _option = require('./options').default

  React.useEffect(() => {
    setOption(_option);
  }, []);

  return (
    <View style={styles.container}>
      <Text>Result: {result + '' + count}</Text>
      <Text>Result: {result + '' + count}</Text>
      <Text>Result: {result + '' + count}</Text>
      <Echarts
        option={option}
        theme={theme}
        opts={opts}
        width={width - 20}
        height={height / 2}
        style={styles.echarts}
      />
      <View
        style={{
          width: '100%',
          marginTop: 20,
          justifyContent: 'space-around',
          flexDirection: 'row',
        }}
      >
        <Button
          title="设置option"
          onPress={() => {
            setOption({
              title: {
                text: 'ECharts 示例' + count,
              },
            });
            setCount(count + 1);
          }}
        ></Button>
        <Button
          title="无障碍"
          onPress={() => {
            setOption({
              aria: {
                enabled: true,
                decal: {
                  show: true,
                },
                cccccc: function () {
                  console.log('xxxx')
                }
              },
            });
            setCount(count + 1);
          }}
        ></Button>
        <Button
          title="亮色主题"
          onPress={() => {
            setOption(_option);
            setTheme('light');
          }}
        ></Button>
        <Button
          title="深色主题"
          onPress={() => {
            setOption(_option);
            setTheme('dark');
          }}
        ></Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
  echarts: {
    // width: 200,
    // height: 120,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
});
