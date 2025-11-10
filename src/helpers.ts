type Obj = Record<string, any>;

export function mergeObjects<T extends Obj = Obj>(...objects: (T | undefined)[]): T {
  const validObjects = objects.filter((obj): obj is T => obj !== undefined);

  if (validObjects.length === 0) return {} as T;

  // 递归合并函数
  function deepMerge(target: any, source: any): any {
    for (const key in source) {
      if (source.hasOwnProperty(key)) {
        const sourceValue = source[key];
        const targetValue = target[key];

        // 如果是普通对象 {}，递归合并
        if (
          sourceValue !== null &&
          typeof sourceValue === "object" &&
          sourceValue.constructor === Object &&
          targetValue !== null &&
          typeof targetValue === "object" &&
          targetValue.constructor === Object
        ) {
          target[key] = deepMerge({ ...targetValue }, sourceValue);
        } else {
          // 否则直接覆盖
          target[key] = sourceValue;
        }
      }
    }
    return target;
  }

  // 默认赋值第一个
  let result = { ...validObjects[0] };

  // 从第二个开始循环合并
  for (let i = 1; i < validObjects.length; i++) {
    result = deepMerge(result, validObjects[i]);
  }

  return result;
}
