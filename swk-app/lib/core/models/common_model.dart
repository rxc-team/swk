import 'package:pit3_app/core/models/items.dart';

class SystemInfo {
  // 创建者
  String createUser;
  // 创建时间
  String createTime;
  // 更新者
  String updateUser;
  // 更新时间
  String updateTime;
  // 数据所有者
  List<String> owners;
  // 盘点信息
  CheckInfo checkInfo;
  // 数据状态
  String status;

  SystemInfo(
    this.createUser,
    this.createTime,
    this.updateUser,
    this.updateTime,
    this.owners,
    this.checkInfo,
    this.status,
  );
}

class CheckStatus {
  // 值
  String value;
  // 状态
  String status;
  // 错误消息
  String errorMsg;
  CheckStatus({this.value, this.status, this.errorMsg});
}

class CheckInfo {
  // 最终检查者
  String lastCheckUser;
  // 最终检查时间
  String lastCheckTime;
  // 最终检查类型
  String lastCheckType;
  // 本次盘点计划的状态
  String checkStatus;

  CheckInfo(this.lastCheckUser, this.lastCheckTime, this.lastCheckType, this.checkStatus);
}

class CheckedItem {
  // 选择的ID
  String itemId;
  // 是否选择
  bool checked;
  CheckedItem({
    this.itemId,
    this.checked,
  });
}

class Operator {
  // 名称
  String label;
  // 值
  String value;

  Operator({this.label, this.value});
}

class FileItem {
  // 文件路径
  String url;
  // 名称
  String name;

  FileItem(this.url, this.name);

  Map<String, dynamic> toJson(FileItem instance) => <String, dynamic>{
        'url': instance.url,
        'name': instance.name,
      };
}

class ValueItem {
  // 字段ID
  String fieldId;
  // 台账ID
  String datastoreId;
  // 类型
  String fieldType;
  // 名称
  String fieldName;
  // 必须
  bool isRequired;
  // 最小位数
  int minLength;
  // 最大位数
  int maxLength;
  // 最小值
  double minValue;
  // 最大值
  double maxValue;
  // 小数位数
  int precision;
  // 值
  dynamic value;
  // 错误
  String error;

  ValueItem(
    this.fieldId,
    this.datastoreId,
    this.fieldType,
    this.fieldName,
    this.isRequired,
    this.value, {
    this.minLength,
    this.maxLength,
    this.minValue,
    this.maxValue,
    this.precision,
    this.error,
  });
}

class DynamicItem {
  // 字段ID
  String fieldID;
  // appID
  String appID;
  // 台账ID
  String datastoreID;
  // 关联台账ID
  String lookupDatastoreID;
  // 关联字段ID
  String lookupFieldID;
  // 字段的类型
  String fieldType;
  // 是否是图片
  bool isImage;
  // 名称
  String fieldName;
  // 表示顺
  int displayOrder;
  // 前缀
  String prefix;
  // 返回值
  String returnType;
  // 显示位数
  int displayDigits;
  // 精度
  int precision;
  // 值
  Value value;

  DynamicItem({
    this.fieldID,
    this.appID,
    this.datastoreID,
    this.lookupDatastoreID,
    this.lookupFieldID,
    this.fieldType,
    this.isImage,
    this.fieldName,
    this.displayOrder,
    this.prefix,
    this.returnType,
    this.displayDigits,
    this.precision,
    this.value,
  });
}
