import 'package:json_annotation/json_annotation.dart';

part 'user.g.dart';

List<User> getUserList(List<dynamic> list) {
  List<User> result = [];
  list.forEach((item) {
    result.add(User.fromJson(item));
  });
  return result;
}

@JsonSerializable()
class User extends Object {
  @JsonKey(name: 'user_id')
  String userId;

  @JsonKey(name: 'user_name')
  String userName;

  @JsonKey(name: 'email')
  String email;

  @JsonKey(name: 'notice_email')
  String noticeEmail;

  @JsonKey(name: 'signature')
  String signature;

  @JsonKey(name: 'current_app')
  String currentApp;

  @JsonKey(name: 'group')
  String group;

  @JsonKey(name: 'language')
  String language;

  @JsonKey(name: 'roles')
  List<String> roles;

  @JsonKey(name: 'apps')
  List<String> apps;

  @JsonKey(name: 'domain')
  String domain;

  @JsonKey(name: 'customer_id')
  String customerId;

  @JsonKey(name: 'timezone')
  String timezone;

  @JsonKey(name: 'user_type')
  int userType;

  @JsonKey(name: 'notice_email_status')
  String noticeEmailStatus;

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

  @JsonKey(name: 'avatar')
  String avatar;

  @JsonKey(name: 'customer_name')
  String customerName;

  User(
    this.userId,
    this.userName,
    this.email,
    this.noticeEmail,
    this.signature,
    this.currentApp,
    this.group,
    this.language,
    this.roles,
    this.apps,
    this.domain,
    this.customerId,
    this.timezone,
    this.userType,
    this.noticeEmailStatus,
    this.createdAt,
    this.createdBy,
    this.updatedAt,
    this.updatedBy,
    this.deletedAt,
    this.avatar,
    this.customerName,
  );

  factory User.fromJson(Map<String, dynamic> srcJson) =>
      _$UserFromJson(srcJson);

  Map<String, dynamic> toJson() => _$UserToJson(this);
}
