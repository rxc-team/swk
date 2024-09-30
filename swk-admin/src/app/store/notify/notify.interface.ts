/*
 * @Description: 设置信息接口
 * @Author: RXC 廖欣星
 * @Date: 2019-04-15 11:51:28
 * @LastEditors: RXC 陈辉宇
 * @LastEditTime: 2020-07-03 10:11:42
 */

export interface Message {
  message_id: string;
  domain: string;
  sender: string;
  recipient: string;
  msg_type: string;
  code: string;
  link: string;
  content: string;
  status: string;
  object: string;
  send_time: string;
  end_time: string;
}
