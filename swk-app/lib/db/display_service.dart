import 'package:pit3_app/db/db_helper.dart';
import 'package:pit3_app/core/models/display_field.dart';
import 'package:sqflite/sqflite.dart';
import 'dart:async';

class DisplayService {
  static final DisplayService _instance = DisplayService.internal();
  factory DisplayService() => _instance;

  final String tableName = "table_dispaly_field";

  static Database _db;

  Future<Database> get db async {
    if (_db != null) {
      return _db;
    }
    _db = await DBHelper.internal().db;
    return _db;
  }

  DisplayService.internal();

  //插入
  Future<int> saveItem(DisplayField item) async {
    var dbClient = await db;
    int res = await dbClient.insert("$tableName", item.toJson());
    print(res.toString());
    return res;
  }

  //查询
  Future<List> getConditionList(String ds) async {
    var dbClient = await db;
    var result = await dbClient.rawQuery(
      "SELECT * FROM $tableName where datastore_id=?",
      [ds],
    );
    return result;
  }

  //查询
  Future<int> remove(String ds) async {
    var dbClient = await db;
    var result = await dbClient.rawDelete(
      "DELETE FROM $tableName where datastore_id=?",
      [ds],
    );
    return result;
  }

  //关闭
  Future close() async {
    var dbClient = await db;
    return dbClient.close();
  }
}
