import 'package:json_annotation/json_annotation.dart';

part 'file.g.dart';

List<FileData> getFileList(List<dynamic> list) {
  List<FileData> result = [];
  list.forEach((item) {
    result.add(FileData.fromJson(item));
  });
  return result;
}

@JsonSerializable()
class FileData extends Object {
  @JsonKey(name: 'url')
  String url;

  FileData(this.url);

  factory FileData.fromJson(Map<String, dynamic> srcJson) =>
      _$FileDataFromJson(srcJson);

  Map<String, dynamic> toJson() => _$FileDataToJson(this);
}
