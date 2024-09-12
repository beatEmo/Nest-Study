import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Inject,
  Param,
  ParseBoolPipe,
  ParseIntPipe,
  Query,
  UseFilters,
} from '@nestjs/common';
import { AppService } from './app.service';
import { AaaService } from './aaa/aaa.service';
import { AaaFilter } from './aaa/aaa.filter';
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Inject(AaaService)
  aaaService: AaaService;

  @Get()
  @UseFilters(AaaFilter)
  getHello(): any {
    throw new HttpException('Error', HttpStatus.BAD_REQUEST);
    return this.appService.getHello();
    // return this.aaaService.create(null);
  }

  @Get('test/:id')
  getHello2(
    @Param('id', ParseIntPipe) id: number,
    @Query('bbb', ParseBoolPipe) bbb: boolean,
  ) {
    console.log(typeof id, typeof bbb);
    console.log('param:', id);
    console.log('query:', bbb);
    return 'Hello World';
  }
}
