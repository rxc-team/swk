---
title: 字符串格式化
type: Type
---

# 字符串格式化。

```ts
objFormat('this is ${name}', { name: 'nf' });
// output: this is nf
strFormat('this is {0}', 'nf');
// output: this is nf
```

**参数**

- `str: string` 模板
- `obj: {}` 数据对象
