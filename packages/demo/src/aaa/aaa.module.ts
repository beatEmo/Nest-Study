import { Global, Module } from '@nestjs/common';
import { AaaService } from './aaa.service';
import { AaaController } from './aaa.controller';

@Global()
@Module({
  controllers: [AaaController],
  providers: [
    AaaService,
    {
      provide: 'myProvider',
      useValue: 'myProviderValue',
    },
    {
      provide: 'myProvider1',
      useFactory: () => ({ name: 'John' }),
    },
  ],
  exports: [AaaService],
})
export class AaaModule {}
