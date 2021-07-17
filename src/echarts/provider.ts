// 读取echart框架文件内容
const TAG = 'echarts ';
// @ts-ignore
import echartStr from './echarts.min';
export function loadEchartsFramework() {
  // 读取echart的lib文件
  try {
    const data = echartStr + '';
    // 等待操作结果返回，然后打印结果
    console.log(TAG + '读取echartjs的lib文件');
    return data;
  } catch (e) {
    console.log(TAG + '读取echartjs的lib文件发生错误', e);
    return '';
  }
}

// 读取echart框架事件行为监听内容
export function loadEchartsEventAction() {
  let str = `
    echart.on('click', funtion (event) {

    })
  `;
  return str;
}

// 解析对象成string
export const toString = (obj: object) => {
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

// 解析string成对象
export const parseString = (str: string | object) => {
  let cc =
    typeof str === 'string'
      ? JSON.parse(str, function (key, value) {
          // 去掉function前后空格
          if (
            value &&
            typeof value === 'string' &&
            value.indexOf('function') >= 0
          ) {
            value = value.replace(/^\s/, '');
          }
          console.log('value ', value);
          if (
            value &&
            typeof value === 'string' &&
            value.substr(0, 8) === 'function'
          ) {
            value = value.replace(/\n/g, '');
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
};
