import 'package:json_annotation/json_annotation.dart';

part 'app.g.dart';

List<AppData> getAppList(List<dynamic> list) {
  List<AppData> result = [];
  list.forEach((item) {
    result.add(AppData.fromJson(item));
  });
  return result;
}

@JsonSerializable()
class AppData extends Object {
  @JsonKey(name: 'app_id')
  String appId;

  @JsonKey(name: 'app_name')
  String appName;

  @JsonKey(name: 'display_order')
  int displayOrder;

  @JsonKey(name: 'domain')
  String domain;

  @JsonKey(name: 'created_at')
  String createdAt;

  @JsonKey(name: 'created_by')
  String createdBy;

  @JsonKey(name: 'updated_at')
  String updatedAt;

  @JsonKey(name: 'updated_by')
  String updatedBy;

  @JsonKey(name: 'deleted_at')
  String deletedAt;

  @JsonKey(name: 'start_time')
  String startTime;

  @JsonKey(name: 'end_time')
  String endTime;

  AppData(
    this.appId,
    this.appName,
    this.displayOrder,
    this.domain,
    this.createdAt,
    this.createdBy,
    this.updatedAt,
    this.updatedBy,
    this.deletedAt,
    this.startTime,
    this.endTime,
  );

  factory AppData.fromJson(Map<String, dynamic> srcJson) =>
      _$AppDataFromJson(srcJson);

  Map<String, dynamic> toJson() => _$AppDataToJson(this);
}
