import 'package:json_annotation/json_annotation.dart';
import 'package:pit3_app/core/models/user.dart';

part 'login.g.dart';

@JsonSerializable()
class Login extends Object {
  @JsonKey(name: 'access_token')
  String accessToken;

  @JsonKey(name: 'is_valid_app')
  bool isValidApp;

  @JsonKey(name: 'refresh_token')
  String refreshToken;

  @JsonKey(name: 'user')
  User user;

  @JsonKey(name: 'user_flg')
  int userFlg;

  Login(
    this.accessToken,
    this.isValidApp,
    this.refreshToken,
    this.user,
    this.userFlg,
  );

  factory Login.fromJson(Map<String, dynamic> srcJson) =>
      _$LoginFromJson(srcJson);

  Map<String, dynamic> toJson() => _$LoginToJson(this);
}
