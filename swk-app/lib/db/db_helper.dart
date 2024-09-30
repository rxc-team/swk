import 'dart:io';
import 'dart:async';

import 'package:path_provider/path_provider.dart';
import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart';

class DBHelper {
  static final DBHelper _instance = DBHelper.internal();
  factory DBHelper() => _instance;
  static Database _db;

  Future<Database> get db async {
    if (_db != null) {
      return _db;
    }
    _db = await initDb();
    return _db;
  }

  DBHelper.internal();

  initDb() async {
    Directory documentDirectory = await getApplicationDocumentsDirectory();
    String path = join(documentDirectory.path, "pit2_20220215.db");
    var ourDb = await openDatabase(path, version: 1, onCreate: _onCreate);
    return ourDb;
  }

//创建数据库表
  void _onCreate(Database db, int version) async {
    await db.execute('''
        create table table_search_condition(
          id integer primary key,
          field_id text not null,
          field_name text not null, 
          field_type text not null,
          operator text not null , 
          search_value text not null, 
          condition_type text not null,
          is_dynamic number not null)
        ''');
    print("table_search_condition Table is created");
    await db.execute('''
        create table table_update_condition(
          id integer primary key,
          datastore_id text not null,
          field_id text not null,
          field_name text not null, 
          field_type text not null,
          lookup_datastore_id text,
          lookup_field_id text,
          option_id text,
          update_value text not null)
        ''');
    print("table_update_condition Table is created");
    await db.execute('''
        create table table_dispaly_field(
          id integer primary key,
          datastore_id text not null,
          field_id text not null,
          field_name text not null,
          field_type text not null,
          display_order integer not null)
        ''');
    print("table_dispaly_field Table is created");
  }
}
