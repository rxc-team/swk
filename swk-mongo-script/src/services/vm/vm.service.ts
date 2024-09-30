import { Injectable } from '@nestjs/common';
import { MongoClient } from 'mongodb';
import { Socket } from 'socket.io';
import { VM } from 'vm2';

@Injectable()
export class VmService {
  /**
   * 创建一个vm
   * @param param data和client
   * @returns VM
   */
  createVm(param: { data: any; client: Socket }): VM {
    const sandBoxdependencies = {
      // script data dependency
      data: param.data,
      // script dependency
      console: console,
      ws: param.client,
      MongoClient: MongoClient,
    };

    const vm = new VM({
      timeout: 100,
      sandbox: sandBoxdependencies,
    });

    return vm;
  }

  buildScript(param: { uri: string; script: string }): string {
    const script = `
        // Connection URL
        const url = '${param.uri}';
        const client = new MongoClient(url);
    
        function print(v) {
          if(ws){
            ws.emit('log', v);
          }
        }
    
        function printjson(v) {
          const vs = JSON.stringify(v);
          if(ws){
            ws.emit('log', vs);
          }
        }
    
        function printStackTrace(e) {
          if(ws){
            ws.emit('err', stack);
          }
        }
    
        async function main() {
            return run();
        }
    
        // start
            ${param.script}
        // end
    
        main()
        .then((v)=>{
          console.log(v);
          printjson(v);
        })
        .catch((e)=>{
          console.error(e.stack);
          printStackTrace(e);
        })
        .finally(() => client.close());
        `;

    return script;
  }
}
