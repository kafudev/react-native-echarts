import React, {
  useState,
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
} from 'react';
import { View, StyleSheet, StyleProp, DeviceEventEmitter } from 'react-native';
import WebView, {
  WebViewMessageEvent,
  WebViewProps,
} from 'react-native-webview';
import 'react-native-get-random-values';
import { nanoid } from 'nanoid/non-secure';
import * as provider from './provider';

interface EchartsProps {
  option: Object | undefined;
  theme?: Object | String | undefined;
  opts?: Object | undefined;
  notMerge?: boolean;
  lazyUpdate?: boolean;
  style: StyleProp<any> | undefined;
  width: String | number;
  height: String | number;
  source: WebViewProps['source'];
  onEvent: Function;
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
function Echarts(props: EchartsProps, ref: any) {
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
        let _option = props.option;
        // @ts-ignore
        _option.notMerge = props.notMerge;
        // @ts-ignore
        _option.lazyUpdate = props.lazyUpdate;
        let ostr = provider.toString(_option);
        // ostr = JSON.stringify(_option);
        console.log(TAG + 'useEffect postMessage');
        // @ts-ignore
        chartRef.current.postMessage(ostr);
      } catch (error) {
        console.log(TAG + 'useEffect option error', error);
      }
    }
  }, [props.option, props.notMerge, props.lazyUpdate]);

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
        } else if (
          obj &&
          inArray(obj.type, [
            'getOption',
            'getDom',
            'getHeight',
            'getWidth',
            'getDataURL',
            'isDisposed',
          ])
        ) {
          // 内部事件
          // 广播事件
          DeviceEventEmitter.emit(TAG + obj.type, obj);
          console.log('web inmessage:', obj?.type, obj);
        } else {
          // console.log(TAG + 'useEffect event', obj);
          // !事件events
          console.log(TAG + 'events type', obj.type, obj.name || '');
          props.onEvent && props.onEvent(obj);
        }
      } catch (error) {}
    }
  }, [props, event]);

  useImperativeHandle(ref, () => ({
    setOption: async (
      _option: Object,
      notMerge?: boolean,
      lazyUpdate?: boolean
    ) => {
      if (_option) {
        setOption(_option);
        // @ts-ignore
        _option.notMerge = notMerge;
        // @ts-ignore
        _option.lazyUpdate = lazyUpdate;
        postMessage(_option);
      }
      console.log('ref setOption', _option, notMerge, lazyUpdate);
      return true;
    },
    getOption: async () => {
      let uuid = nanoid();
      let str = `
        (()=>{
          try {
            let cc = window.chart.getOption()
            let mm = {
              'type': 'getOption',
              'uuid': '${uuid}',
              'data': cc
            }
            window.ReactNativeWebView.postMessage(JSON.stringify(mm))
          } catch (error) {
            console.log('getOption error'+ error)
          }
        })()
      `;
      // 执行脚本
      injectJavaScript(str);
      // 获取消息值
      let obj = await getMessageByUuid('getOption', uuid);
      return obj;
    },
    getWidth: async () => {
      let uuid = nanoid();
      let str = `
        (()=>{
          try {
            let cc = window.chart.getWidth()
            let mm = {
              'type': 'getWidth',
              'uuid': '${uuid}',
              'data': cc
            }
            window.ReactNativeWebView.postMessage(JSON.stringify(mm))
          } catch (error) {
            console.log('getWidth error'+ error)
          }
        })()
      `;
      // 执行脚本
      injectJavaScript(str);
      // 获取消息值
      let obj = await getMessageByUuid('getWidth', uuid);
      return obj;
    },
    getHeight: async () => {
      let uuid = nanoid();
      let str = `
        (()=>{
          try {
            let cc = window.chart.getHeight()
            let mm = {
              'type': 'getHeight',
              'uuid': '${uuid}',
              'data': cc
            }
            window.ReactNativeWebView.postMessage(JSON.stringify(mm))
          } catch (error) {
            console.log('getHeight error'+ error)
          }
        })()
      `;
      // 执行脚本
      injectJavaScript(str);
      // 获取消息值
      let obj = await getMessageByUuid('getHeight', uuid);
      return obj;
    },
    getDom: async () => {
      let uuid = nanoid();
      let str = `
        (()=>{
          try {
            let cc = window.chart.getDom()
            let mm = {
              'type': 'getDom',
              'uuid': '${uuid}',
              'data': cc.innerHTML.toString()
            }
            window.ReactNativeWebView.postMessage(JSON.stringify(mm))
          } catch (error) {
            console.log('getDom error'+ error)
          }
        })()
      `;
      // 执行脚本
      injectJavaScript(str);
      // 获取消息值
      let obj = await getMessageByUuid('getDom', uuid);
      return obj;
    },
    resize: async (
      _opts: {
        width?: number | string;
        height?: number | string;
        silent?: boolean;
        animation?: {
          duration?: number;
          easing?: string;
        };
      } = {}
    ) => {
      let str = `
        (()=>{
          try {
            window.chart.resize(${JSON.stringify(_opts)})
          } catch (error) {
            console.log('resize error'+ error)
          }
        })()
      `;
      // 执行脚本
      injectJavaScript(str);
      console.log('ref resize', _opts);
      return true;
    },
    dispatchAction: async (payload: object = {}) => {
      let str = `
        (()=>{
          try {
            window.chart.dispatchAction(${JSON.stringify(payload)})
          } catch (error) {
            console.log('dispatchAction error'+ error)
          }
        })()
      `;
      // 执行脚本
      injectJavaScript(str);
      console.log('ref dispatchAction', payload);
      return true;
    },
    on: async (
      eventName: string = '',
      query: string | Object,
      handler: Function,
      _context?: Object
    ) => {
      let str = `
        (()=>{
          try {
            let eventName = ${JSON.stringify(eventName)}
            let query = ${JSON.stringify(query)}
            let ff = ${handler.toString() || JSON.stringify('')}
            let context = ${JSON.stringify(_context)}
            if(ff){
              if(context){
                window.chart.on(eventName, query, ff,context)
              }else{
                window.chart.on(eventName, query, ff)
              }
            } else{
              if(context){
                window.chart.on(eventName, query, context)
              }else{
                window.chart.on(eventName, query)
              }
            }
          } catch (error) {
            console.log('on error'+ error)
          }
        })()
      `;
      // 执行脚本
      injectJavaScript(str);
      console.log('ref on', eventName, query, handler);
      return true;
    },
    off: async (eventName: string, handler?: Function) => {
      let str = `
        (()=>{
          try {
            let eventName = ${JSON.stringify(eventName)}
            let ff = ${(handler && handler.toString()) || JSON.stringify('')}
            if(ff){
              window.chart.off(eventName, ff)
            } else {
              window.chart.off(eventName)
            }
          } catch (error) {
            console.log('off error'+ error)
          }
        })()
      `;
      // 执行脚本
      injectJavaScript(str);
      console.log('ref off', eventName, handler);
      return true;
    },
    showLoading: async (type: string = 'default', _opts: Object = {}) => {
      let str = `
        (()=>{
          try {
            window.chart.showLoading('${type}', ${JSON.stringify(_opts)})
          } catch (error) {
            console.log('showLoading error'+ error)
          }
        })()
      `;
      // 执行脚本
      injectJavaScript(str);
      console.log('ref showLoading', type, _opts);
      return true;
    },
    hideLoading: async () => {
      let str = `
        (()=>{
          try {
            window.chart.hideLoading()
          } catch (error) {
            console.log('showLoading error'+ error)
          }
        })()
      `;
      // 执行脚本
      injectJavaScript(str);
      console.log('ref hideLoading');
      return true;
    },
    getDataURL: async (
      _opts: {
        // 导出的格式，可选 png, jpeg
        type?: string;
        // 导出的图片分辨率比例，默认为 1。
        pixelRatio?: number;
        // 导出的图片背景色，默认使用 option 里的 backgroundColor
        backgroundColor?: string;
        // 忽略组件的列表，例如要忽略 toolbox 就是 ['toolbox']
        excludeComponents?: Array<string>;
      } = {}
    ) => {
      let uuid = nanoid();
      let str = `
        (()=>{
          try {
            let cc = window.chart.getDataURL(${JSON.stringify(_opts)})
            let mm = {
              'type': 'getDataURL',
              'uuid': '${uuid}',
              'data': cc
            }
            window.ReactNativeWebView.postMessage(JSON.stringify(mm))
          } catch (error) {
            console.log('getDataURL error'+ error)
          }
        })()
      `;
      // 执行脚本
      injectJavaScript(str);
      // 获取消息值
      let obj = await getMessageByUuid('getDataURL', uuid);
      return obj;
    },
    getConnectedDataURL: async (
      _opts: {
        // 导出的格式，可选 png, jpeg
        type?: string;
        // 导出的图片分辨率比例，默认为 1。
        pixelRatio?: number;
        // 导出的图片背景色，默认使用 option 里的 backgroundColor
        backgroundColor?: string;
        // 忽略组件的列表，例如要忽略 toolbox 就是 ['toolbox']
        excludeComponents?: Array<string>;
      } = {}
    ) => {
      let uuid = nanoid();
      let str = `
        (()=>{
          try {
            let cc = window.chart.getConnectedDataURL(${JSON.stringify(_opts)})
            let mm = {
              'type': 'getConnectedDataURL',
              'uuid': '${uuid}',
              'data': cc
            }
            window.ReactNativeWebView.postMessage(JSON.stringify(mm))
          } catch (error) {
            console.log('getConnectedDataURL error'+ error)
          }
        })()
      `;
      // 执行脚本
      injectJavaScript(str);
      // 获取消息值
      let obj = await getMessageByUuid('getConnectedDataURL', uuid);
      return obj;
    },
    appendData: async (
      _opts: {
        // 要增加数据的系列序号。
        seriesIndex?: string;
        // 增加的数据。
        data?: Array<any>;
      } = {}
    ) => {
      let str = `
        (()=>{
          try {
            window.chart.appendData(${JSON.stringify(_opts)})
          } catch (error) {
            console.log('appendData error'+ error)
          }
        })()
      `;
      // 执行脚本
      injectJavaScript(str);
      console.log('ref appendData');
      return true;
    },
    clear: async () => {
      let str = `
        (()=>{
          try {
            window.chart.clear()
          } catch (error) {
            console.log('clear error'+ error)
          }
        })()
      `;
      // 执行脚本
      injectJavaScript(str);
      console.log('ref clear');
      return true;
    },
    isDisposed: async () => {
      let uuid = nanoid();
      let str = `
        (()=>{
          try {
            let cc = window.chart.isDisposed()
            let mm = {
              'type': 'isDisposed',
              'uuid': '${uuid}',
              'data': cc
            }
            window.ReactNativeWebView.postMessage(JSON.stringify(mm))
          } catch (error) {
            console.log('isDisposed error'+ error)
          }
        })()
      `;
      // 执行脚本
      injectJavaScript(str);
      // 获取消息值
      let obj = await getMessageByUuid('isDisposed', uuid);
      return obj;
    },
    dispose: async () => {
      let str = `
        (()=>{
          try {
            window.chart.dispose()
          } catch (error) {
            console.log('dispose error'+ error)
          }
        })()
      `;
      // 执行脚本
      injectJavaScript(str);
      console.log('ref dispose');
      return true;
    },
  }));

  //检测某个字符是否在此数组中
  const inArray = (val: string, arr: Array<any>): boolean => {
    let testStr = ',' + arr.join(',') + ',';
    return testStr.indexOf(',' + val + ',') !== -1; //true 在，不可以/false 不在，可
  };
  // 通过uuid获取事件消息
  const getMessageByUuid = async (type: string, uuid: string): Promise<any> => {
    return new Promise(function (resolve, reject) {
      try {
        // 获取消息值
        DeviceEventEmitter.addListener(TAG + type, (res) => {
          if (res && res.uuid === uuid) {
            console.log('ref ' + type, res);
            resolve(res);
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  };
  // 给webview发送消息
  const postMessage = (_message: object) => {
    // console.log(TAG + 'postMessage ', _message);
    // @ts-ignore
    chartRef.current.postMessage(provider.toString(_message));
  };
  // 给webview写入script
  const injectJavaScript = (script: string) => {
    // console.log(TAG + 'injectJavaScript ', script);
    // @ts-ignore
    chartRef.current.injectJavaScript(script);
  };
  // 加载echart初始化
  const loadScript = () => {
    console.log(TAG + 'loadScript');
    let str = `
      let TAG = 'web echarts '
      var chart = null
      var options = {}
      // alert(TAG)
      // 初始化echarts
      if(echarts){
        console.log(TAG+'echarts ' + JSON.stringify(echarts))
        chart = echarts.init(document.getElementById('main'), ${JSON.stringify(
          theme || {}
        )}, ${JSON.stringify(opts || {})});
        options = parseString(toString(${provider.toString(option)}))
        // console.log(TAG+'echarts options' + JSON.stringify(options))
        chart.setOption(options);
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
              // console.log(TAG+'chart getZr click ' + paramsString)
              postMessage(paramsString);
          }
        });
        window.chart = chart
      }

      // 处理webview接收的消息
      function handleMessage (e) {
        // 消息解析成json
        let xx = {}
        let data = e.data
        let option = parseString(data)
        let notMerge = option.notMerge
        let lazyUpdate = option.lazyUpdate
        chart && chart.setOption(option, notMerge, lazyUpdate);
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
                // 去掉function前后空格
                if (value && typeof value === 'string' && value.indexOf('function')>=0) {value = value.replace(/^\\s/, '');}
                if (
                  value &&
                  typeof value === 'string' &&
                  value.substr(0, 8) === 'function'
                ) {
                  // console.log(TAG + 'function ' + key + ' ' + value);
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
      window.parseString = parseString

      // 解析对象成string
      function toString (obj) {
        if (obj === undefined) return JSON.stringify({});
        return JSON.stringify(obj, (_key, val) => {
          if (typeof val === 'function') {
            console.log(val);
            // eslint-disable-next-line no-new-func
            console.log('function', new Function('return ' + val.toString()));
            console.log('function', String(val));
            console.log('function', val.toString());
            console.log('function', val.constructor.toString());
            // eslint-disable-next-line no-new-func
            return new Function('return ' + val.toString());
          }
          return val;
        });
      };
      window.toString = toString

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
        style={{
          ...styles.webview,
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
        // onLoadEnd={(syntheticEvent) => {
        //   const { nativeEvent } = syntheticEvent;
        //   console.log(TAG + 'webview onLoadEnd', nativeEvent);
        // }}
        // onError={(error) => {
        //   console.log(TAG + 'webview onError', error);
        // }}
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
  webview: {
    flex: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
  },
});

export default forwardRef(Echarts);
