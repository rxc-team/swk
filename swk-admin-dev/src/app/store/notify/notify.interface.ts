/*
 * @Description: 设置信息接口
 * @Author: RXC 廖欣星
 * @Date: 2019-04-15 11:51:28
 * @LastEditors: RXC 陈辉宇
 * @LastEditTime: 2020-07-02 09:43:39
 */
export interface Message {
  message_id: string;
  domain: string;
  sender: string;
  recipient: string;
  code: string;
  content: string;
  send_time: string;
  status: string;
  link: string;
  object: string;
}
