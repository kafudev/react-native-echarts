import * as React from 'react';

import {
  StyleSheet,
  View,
  Text,
  Button,
  Dimensions,
  ScrollView,
  Image,
} from 'react-native';
import Echarts from '@kafudev/react-native-echarts';
const { height, width } = Dimensions.get('window');
export default function App() {
  let [count, setCount] = React.useState(0);
  let [option, setOption] = React.useState(null);
  let [theme, setTheme] = React.useState(null);
  let [opts, setOpts] = React.useState({});
  let [notMerge] = React.useState(false);
  let [lazyUpdate] = React.useState(false);
  let [imageSource, setImageSource] = React.useState({});
  let chartRef = React.useRef(null);
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

  _option = require('./options').default;

  React.useEffect(() => {
    setOption(_option);
  }, []);


  return (
    <ScrollView style={styles.container}>
      <Text>Result: {result + '' + count}</Text>
      <Text>Result: {result + '' + count}</Text>
      <Text>Result: {result + '' + count}</Text>
      <Echarts
        ref={chartRef}
        option={option}
        theme={theme}
        opts={opts}
        notMerge={notMerge}
        lazyUpdate={lazyUpdate}
        width={width}
        height={height / 2}
        style={styles.echarts}
        onEvent={(event) => {
          // console.log('App Echarts onEvent', event);
        }}
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
              ..._option,
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
      <View
        style={{
          width: '80%',
          marginTop: 20,
          justifyContent: 'space-evenly',
        }}
      >
        <Button
          title="ref设置option"
          onPress={() => {
            chartRef.current.setOption({
              ..._option,
              title: {
                text: 'ECharts 示例' + count,
              },
            });
            setCount(count + 1);
          }}
        ></Button>
        <Button
          title="ref获取option"
          onPress={() => {
            chartRef.current.getOption().then((res) => {
              console.log('chartRef.current.getOption() ', res);
            });
          }}
        ></Button>
        <Button
          title="ref获取height"
          onPress={() => {
            chartRef.current.getHeight().then((res) => {
              console.log('chartRef.current.getHeight() ', res);
            });
          }}
        ></Button>
        <Button
          title="ref获取width"
          onPress={() => {
            chartRef.current.getWidth().then((res) => {
              console.log('chartRef.current.getWidth() ', res);
            });
          }}
        ></Button>
        <Button
          title="ref获取dom"
          onPress={() => {
            chartRef.current.getDom().then((res) => {
              console.log('chartRef.current.getDom() ', res);
            });
          }}
        ></Button>
        <Button
          title="ref-dispatchAction"
          onPress={() => {
            chartRef.current
              .dispatchAction({
                type: 'dataZoom',
                start: 20,
                end: 30,
              })
              .then((res) => {
                console.log('chartRef.current.dispatchAction() ', res);
              });
          }}
        ></Button>
        <Button
          title="ref-on"
          onPress={() => {
            chartRef.current
              .on('click', 'series', function (event) {
                alert('xx' + event.type + event.name);
              })
              .then((res) => {
                console.log('chartRef.current.on() ', res);
              });
          }}
        ></Button>
        <Button
          title="ref-off"
          onPress={() => {
            chartRef.current.off('click').then((res) => {
              console.log('chartRef.current.off() ', res);
            });
          }}
        ></Button>
        <Button
          title="ref-resize"
          onPress={() => {
            chartRef.current.resize().then((res) => {
              console.log('chartRef.current.resize() ', res);
            });
          }}
        ></Button>
        <Button
          title="ref-clear"
          onPress={() => {
            chartRef.current.clear().then((res) => {
              console.log('chartRef.current.clear() ', res);
            });
          }}
        ></Button>
        <Button
          title="ref-showLoading"
          onPress={() => {
            chartRef.current.showLoading().then((res) => {
              console.log('chartRef.current.showLoading() ', res);
            });
          }}
        ></Button>
        <Button
          title="ref-hideLoading"
          onPress={() => {
            chartRef.current.hideLoading().then((res) => {
              console.log('chartRef.current.hideLoading() ', res);
            });
          }}
        ></Button>
        <Button
          title="ref-getDataURL"
          onPress={() => {
            chartRef.current.getDataURL().then((res) => {
              setImageSource({ uri: res.data });
              console.log('chartRef.current.getDataURL() ');
            });
          }}
        ></Button>
        <Button
          title="ref-getConnectedDataURL"
          onPress={() => {
            chartRef.current.getConnectedDataURL().then((res) => {
              setImageSource({ uri: res.data });
              console.log('chartRef.current.getConnectedDataURL() ');
            });
          }}
        ></Button>

        <Image source={imageSource} style={{ width: 200, height: 200 }}></Image>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // alignItems: 'center',
    // justifyContent: 'center',
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
