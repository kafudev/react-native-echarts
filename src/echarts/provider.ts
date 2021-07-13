// 读取echart框架文件内容
const TAG = 'echarts ';
// @ts-ignore
import echartStr from './echarts.min';
export function loadEchartsFramework() {
  // 读取echart的lib文件
  try {
    const data = echartStr + '';
    // 等待操作结果返回，然后打印结果
    console.log(TAG + 'echartjs的lib文件');
    return data;
  } catch (e) {
    console.log(TAG + '读取echarts文件发生错误', e);
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

export const convertToPostMessageString = (obj: object) => {
  return JSON.stringify(obj, (_key, val) => {
    if (typeof val === 'function') {
      console.log(val);
      // eslint-disable-next-line no-new-func
      console.log('function', new Function('return ' + val.toString()));
      console.log('function', val.toString());
      console.log('function', val.constructor.toString());
      // eslint-disable-next-line no-new-func
      return val.toString() + '';
    }
    return val;
  });
};

export const toString = (obj: object) => {
  if (obj === undefined) return JSON.stringify({});
  return JSON.stringify(obj, (_key, val) => {
    if (typeof val === 'function') {
      console.log('function ', val.toString());
      return val.toString() + '';
    }
    return val;
  });
};
