import { Module } from '@nestjs/common';
import { MongoController } from './controllers/mongo/mongo.controller';
import { EventsModule } from './events/events.module';
import { VmService } from './services/vm/vm.service';

@Module({
  imports: [EventsModule],
  controllers: [MongoController],
  providers: [VmService],
})
export class AppModule {}
