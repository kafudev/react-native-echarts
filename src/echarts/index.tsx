import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, StyleProp } from 'react-native';
import WebView, {
  WebViewMessageEvent,
  WebViewProps,
} from 'react-native-webview';
import * as provider from './provider';

interface EchartsProps {
  option: Object | undefined;
  theme: Object | String | undefined;
  opts: Object | undefined;
  style: StyleProp<any> | undefined;
  width: String | number;
  height: String | number;
  source: WebViewProps['source'];
  onEvent: Function;
  onAction: Function;
}

let tplHtml = `
    <!DOCTYPE html>
    <html lang="zh">
      <head>
          <meta http-equiv="content-type" content="text/html; charset=utf-8">
          <meta name="viewport" content="initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no">
          <style type="text/css">
            html,body {
              height: 100%;
              width: 100%;
              margin: 0;
              padding: 0;
              background-color:rgba(0, 0, 0, 0);
            }
            #main {
              height: 100%;
              width: 100%;
              background-color:rgba(0, 0, 0, 0);
            }
          </style>
          <script src="https://cdn.jsdelivr.net/npm/echarts@5.1.2/dist/echarts.min.js" integrity="sha256-TI0rIaxop+pDlHNVI6kDCFvmpxNYUnVH/SMjknZ/W0Y=" crossorigin="anonymous"></script>
          <script>
            // 加载echart框架
            {provider.loadEchartsFramework()}
          </script>
      </head>
      <body>
          <div id="main">
          </div>
      </body>
      <script>
        let TAG = 'web echarts '
        const consoleLog = (type, log) => window.ReactNativeWebView.postMessage(JSON.stringify({'type': 'Console', 'data': {'type': type, 'log': log}}));
        console = {
          log: (log) => consoleLog('log', log),
          debug: (log) => consoleLog('debug', log),
          info: (log) => consoleLog('info', log),
          warn: (log) => consoleLog('warn', log),
          error: (log) => consoleLog('error', log),
        };
        console.log(TAG+'init ')
      </script>
    </html>`;
const TAG = 'echarts ';
export default function Echarts(props: EchartsProps) {
  let [source, setSource] = useState<WebViewProps['source'] | undefined>({
    html: tplHtml,
  });
  let [option, setOption] = React.useState({});
  let [theme, setTheme] = React.useState<Object | String | undefined>();
  let [opts, setOpts] = React.useState<Object | undefined>({});
  let [event, setEvent] = useState<WebViewMessageEvent | undefined>(undefined);

  let chartRef = useRef(null);
  useEffect(() => {
    if (props.option) {
      // console.log(TAG + 'useEffect option', props.option);
      setOption(props.option);
      try {
        let ostr = provider.toString(props.option);
        // @ts-ignore
        // ostr = JSON.stringify(props.option);
        console.log(TAG + 'useEffect postMessage');
        // @ts-ignore
        chartRef.current.postMessage(ostr);
      } catch (error) {
        console.log(TAG + 'useEffect option error', error);
      }
    }
  }, [props.option]);

  useEffect(() => {
    if (props.theme) {
      // 改变init的theme重新初始化
      setTheme(props.theme);
      // @ts-ignore
      chartRef.current.reload();
    }
  }, [props.theme]);

  useEffect(() => {
    if (props.opts) {
      // 改变init的opts重新初始化
      setOpts(props.opts);
      // @ts-ignore
      chartRef.current.reload();
    }
  }, [props.opts]);

  useEffect(() => {
    if (props.source) {
      console.log(TAG + 'useEffect source', props.source);
      setSource(props.source);
    }
  }, [props.source]);

  useEffect(() => {
    if (event) {
      // console.log(TAG + 'useEffect event', event);
      try {
        let obj = JSON.parse(event.nativeEvent.data);
        if (obj && obj.type === 'Console') {
          console.log('web log:', obj?.data?.log);
        } else {
          console.log(TAG + 'useEffect event', obj);
          // 解析
          // !事件events
          console.log(TAG + 'events type', obj.type, obj.name);
        }
        props.onEvent && props.onEvent(event);
      } catch (error) {}
    }
  }, [props, event]);

  const loadScript = () => {
    console.log(TAG + 'loadScript');
    let str = `
      let TAG = 'web echarts '
      var chart = null
      // alert(TAG)
      // 初始化echarts
      if(echarts){
        console.log(TAG+'echarts ' + JSON.stringify(echarts))
        chart = echarts.init(document.getElementById('main'), ${JSON.stringify(
          theme || {}
        )}, ${JSON.stringify(opts || {})});
        chart.setOption(parseString(${provider.toString(option)}));
        // 监听echart事件和行为
        let mouseEventArr = ['click','dblclick','mousedown','mousemove','mouseup','mouseover','mouseout','globalout','contextmenu', 'highlight', 'downplay', 'selectchanged', 'dataZoom']
        mouseEventArr.map(ee=>{
          chart.on(ee, function(params) {
            // console.log(TAG+'chart ' + ee)
            let seen = [];
            let paramsString = JSON.stringify(params, function(key, val) {
              if (val != null && typeof val == "object") {
                if (seen.indexOf(val) >= 0) {
                  return;
                }
                seen.push(val);
              }
              return val;
            });
            postMessage(paramsString);
          });
        })
        // 空白监听
        chart.getZr().on('click', function (event) {
          // 没有 target 意味着鼠标/指针不在任何一个图形元素上，它是从“空白处”触发的。
          if (!event.target) {
              // 点击在了空白处，做些什么。
              console.log(TAG+'chart getZr click' + event)
              let seen = [];
              let paramsString = JSON.stringify(event, function(key, val) {
                if (val != null && typeof val == "object") {
                  if (seen.indexOf(val) >= 0) {
                    return;
                  }
                  seen.push(val);
                }
                return val;
              });
              postMessage(paramsString);
          }
        });
      }

      // 处理webview接收的消息
      function handleMessage (e) {
        // 消息解析成json
        let xx = {}
        let data = e.data
        let option = parseString(data)
        chart && chart.setOption(option);
        // let optionStr = JSON.stringify(option, (_key, val) => {
        //   if (typeof val === 'function') {
        //     return val.toString();
        //   }
        //   return val;
        // });
        // console.log(TAG+'handelMessage option ' + optionStr)
        // option && option.aria && option.aria.cccccc()
        // console.log(TAG+'handelMessage setOption ' + optionStr)
      }

      // 解析string成对象
      function parseString (str) {
        let cc =
          typeof str === 'string'
            ? JSON.parse(str, function (key, value) {
                // 去掉前后空格
                // if (value) value = value.replace( /^\s/, '');
                if (
                  value &&
                  typeof value === 'string' &&
                  value.substr(0, 8) === 'function'
                ) {
                  console.log(TAG + 'function ' + key + ' ' + value);
                  let startBody = value.indexOf('{') + 1;
                  let endBody = value.lastIndexOf('}');
                  let startArgs = value.indexOf('(') + 1;
                  let endArgs = value.indexOf(')');
                  // console.log(TAG+'function ' + value.substring(startArgs, endArgs) + value.substring(startBody, endBody))
                  let ff = null;
                  if (!value.substring(startArgs, endArgs)) {
                    // eslint-disable-next-line no-new-func
                    ff = new Function('return ', value.substring(startBody, endBody));
                  } else {
                    // eslint-disable-next-line no-new-func
                    ff = new Function(
                      value.substring(startArgs, endArgs),
                      value.substring(startBody, endBody)
                    );
                  }
                  // console.log(TAG+'Function '+ff.toString())
                  return ff;
                }
                return value;
              })
            : str;
        return cc;
      }

      // 给webview发送消息
      function postMessage (data) {
        // 消息转换成string
        data = typeof data === 'string'?data:JSON.parse(data);
        console.log(TAG+'postMessage', data)
        window.ReactNativeWebView.postMessage(data);
      };

      // window监听webview消息
      window.document.addEventListener('message', function(e) {
        // console.log(TAG+'window.addEventListener message', e)
        handleMessage(e);
      });
      window.addEventListener('message', function(e) {
        // console.log(TAG+'window.addEventListener message', e)
        handleMessage(e);
      });
      // window窗口大小调整
      window.onresize = function() {
        console.log(TAG+'window.onresize')
        chart && chart.resize();
      };

      // 触摸事件
      // window.document.addEventListener("touchstart",(e)=>{
      //   console.log(TAG+'touchstart：手指按下时触发',e);
      //   postMessage(e);
      // })
      // window.addEventListener("touchstart",(e)=>{
      //   console.log(TAG+'touchstart：手指按下时触发',e);
      //   postMessage(e);
      // })
      true;
      `;
    return str;
  };

  return (
    <View
      style={{
        ...styles.container,
        width: props.width || props.style?.width || '100%',
        height: props.height || props.style?.height || 120,
      }}
    >
      <WebView
        ref={chartRef}
        source={source}
        injectedJavaScript={loadScript()}
        // eslint-disable-next-line react-native/no-inline-styles
        style={{
          flex: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'transparent',
          ...props.style,
        }}
        originWhitelist={['*']}
        allowFileAccess
        javaScriptEnabled
        domStorageEnabled
        allowsLinkPreview
        useWebKit
        cacheEnabled
        allowUniversalAccessFromFileURLs
        mixedContentMode="always"
        overScrollMode="never"
        bounces={false}
        geolocationEnabled={false}
        scrollEnabled={false}
        scalesPageToFit={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        automaticallyAdjustContentInsets={false}
        onMessage={(eevent: WebViewMessageEvent) => {
          // console.log(TAG + 'onMessage event', eevent);
          // eevent.nativeEvent.data
          setEvent(eevent);
        }}
        onLoadEnd={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.log(TAG + 'webview onLoadEnd', nativeEvent);
        }}
        onError={(error) => {
          console.log(TAG + 'webview onError', error);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    textAlign: 'center',
    height: '100%',
    width: '100%',
  },
});
