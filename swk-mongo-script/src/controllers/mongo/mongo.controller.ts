import { Body, Controller, Logger, Param, Post } from '@nestjs/common';
import { EventsGateway } from 'src/events/events.gateway';
import { VmService } from 'src/services/vm/vm.service';

interface RunDto {
  uri: string;
  data: any;
  script: string;
}

@Controller()
export class MongoController {
  constructor(private readonly vm: VmService, private ws: EventsGateway) {}
  private logger: Logger = new Logger('MongoController');

  @Post('/run/:uid')
  run(@Body() body: RunDto, @Param('uid') uid: string) {
    console.log(body);
    console.log(uid);

    // 生成脚本
    const script = this.vm.buildScript({ uri: body.uri, script: body.script });
    // 生成通信使用ws
    const client = this.ws.getClient(uid);
    // 生成vm虚拟环境
    const vm = this.vm.createVm({ data: body.data, client: client });

    process.on('uncaughtException', function (err) {
      //打印出错误
      console.log(err);
      // 异常退出情况返回
      client.emit('err', err.stack);
    });

    try {
      // 执行脚本
      vm.run(script);
      // 正常情况返回
      return { status: 10000, message: 'run success' };
    } catch (error) {
      // 异常情况返回
      client.emit('err', error.stack);
      this.logger.error('Run mongodb script has error', error.stack);
      return { status: 20000, message: 'run fail' };
    }
  }
}
