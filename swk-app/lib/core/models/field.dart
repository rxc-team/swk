import 'package:json_annotation/json_annotation.dart';

part 'field.g.dart';

List<Field> getFieldList(List<dynamic> list) {
  List<Field> result = [];
  list.forEach((item) {
    result.add(Field.fromJson(item));
  });
  return result;
}

@JsonSerializable()
class Field extends Object {
  @JsonKey(name: 'field_id')
  String fieldId;

  @JsonKey(name: 'app_id')
  String appId;

  @JsonKey(name: 'datastore_id')
  String datastoreId;

  @JsonKey(name: 'field_name')
  String fieldName;

  @JsonKey(name: 'field_type')
  String fieldType;

  @JsonKey(name: 'is_required')
  bool isRequired;

  @JsonKey(name: 'as_title')
  bool asTitle;

  @JsonKey(name: 'is_image')
  bool isImage;

  @JsonKey(name: 'is_check_image')
  bool isCheckImage;

  @JsonKey(name: 'option_id')
  String optionId;

  @JsonKey(name: 'user_group_id')
  String userGroupId;

  @JsonKey(name: 'lookup_datastore_id')
  String lookupDatastoreId;

  @JsonKey(name: 'lookup_field_id')
  String lookupFieldId;

  @JsonKey(name: 'min_length')
  int minLength;

  @JsonKey(name: 'max_length')
  int maxLength;

  @JsonKey(name: 'min_value')
  double minValue;

  @JsonKey(name: 'max_value')
  double maxValue;

  @JsonKey(name: 'prefix')
  String prefix;

  @JsonKey(name: 'precision')
  int precision;

  @JsonKey(name: 'display_digits')
  int displayDigits;

  @JsonKey(name: 'display_order')
  int displayOrder;

  @JsonKey(name: 'return_type')
  String returnType;

  @JsonKey(name: 'created_at')
  String createdAt;

  @JsonKey(name: 'created_by')
  String createdBy;

  @JsonKey(name: 'updated_at')
  String updatedAt;

  @JsonKey(name: 'updated_by')
  String updatedBy;

  @JsonKey(name: 'is_dynamic')
  bool isDynamic;

  Field(
    this.fieldId,
    this.fieldName,
    this.fieldType, {
    this.appId,
    this.datastoreId,
    this.isRequired,
    this.asTitle,
    this.isImage,
    this.isCheckImage,
    this.optionId,
    this.userGroupId,
    this.lookupDatastoreId,
    this.lookupFieldId,
    this.minLength,
    this.maxLength,
    this.minValue,
    this.maxValue,
    this.displayDigits,
    this.prefix,
    this.precision,
    this.displayOrder,
    this.returnType,
    this.createdAt,
    this.createdBy,
    this.updatedAt,
    this.updatedBy,
    this.isDynamic,
  });

  factory Field.fromJson(Map<String, dynamic> srcJson) => _$FieldFromJson(srcJson);

  Map<String, dynamic> toJson() => _$FieldToJson(this);
}
