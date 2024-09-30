---
title: 表单校验
type: Type
---

# NgFast 通用表单验证

## ANGULAR 自带

| 方法名            | 说明              | 参数           |
|----------------|-----------------|--------------|
| `min`          | 数值最小值验证         | 最小的数：number  |
| `max`          | 数值最大值验证         | 最大的数：number  |
| `required`     | 是否必须            | 无            |
| `requiredTrue` | 字段值是否为ture      | 无            |
| `email`        | 是否为邮箱           | 无            |
| `minLength`    | 字符串最小长度         | 最小长度：number  |
| `maxLength`    | 字符串最大长度         | 最大长度：number  |
| `pattern`      | 正则表达式验证（html可用） | 正则表达式：string |

## API

| 方法名                 | 说明                           |
|---------------------|------------------------------|
| `isNumber`          | 是否为数字                        |
| `isInt`             | 是否为整数                        |
| `isDecimal`         | 是否为小数                        |
| `isIDCard`          | 是否为身份证                       |
| `isMobile`          | 是否为手机号                       |
| `isURL`             | 是否为合法的url                    |
| `isHalfAlpha`       | 是否半角英字                       |
| `isHalfNumber`      | 是否半角英数字                      |
| `isHalfAlphaNumber` | 是否半角英数字                      |
| `isFullAlpha`       | 是否全角英字                       |
| `isFullNumber`      | 是否全角数字                       |
| `isFullAlphaNumber` | 是否全角英数字                      |
| `isDate`            | 是否合法日期                       |
| `isFutureDate`      | 是否是属于将来的日期                   |
| `isEmpty`           | 是否为空字符串（空指的是trim掉空格）         |
| `isBlank`           | 是否为空白字符串（空白字符串指代空格键按下形成的字符串） |
| `validateNumber`    | 是否结束数字大于等于开始数字               |
| `validateDate`      | 是否结束日期大于等于开始日期               |
| `domain`            | 是否合法的域名（不包含http://或https://）               |
| `password`          | 验证密码（密码至少8位，且必须包含数字大小写字母以及特殊字符(如%￥#&等)） */               |
| `specialChar`       | 是否包含特殊字符（`~!@#$%^&*()+=|\等）               |

每一个验证型都包括着用于表单验证器：

```ts
this.valForm = fb.group({
  // 手机号
  mobile: [null, Validators.compose([Validators.required, NfValidators.mobile])]
});
```
