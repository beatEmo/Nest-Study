import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { AppService } from './app.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import * as fs from 'fs';
import * as OSS from 'ali-oss';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('oss')
  async oss() {
    const config = {
      region: 'oss-cn-beijing',
      bucket: 'nest-test12',
      accessKeyId: '',
      accessKeySecret: '',
    };
    const client = new OSS(config);
    const date = new Date();
    date.setDate(date.getDate() + 1);
    const res = client.calculatePostSignature({
      expiration: date.toISOString(),
      conditions: [
        ['content-length-range', 0, 1048576000], //设置上传文件的大小限制。
      ],
    });
    console.log(res);
    const location = await client.getBucketLocation();
    const host = `http://${config.bucket}.${location.location}.aliyuncs.com`;
    console.log(host);
    return {
      ...res,
      host,
    };
  }

  @Post('upload')
  @UseInterceptors(
    FilesInterceptor('files', 20, {
      dest: 'uploads',
    }),
  )
  uploadFiles(
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Body() body,
  ) {
    console.log('body', body);
    console.log('files', files);

    // 匹配出文件名
    const fileName = body.name.match(/(.+)\-\d+$/)[1];
    const chunkDir = 'uploads/chunks_' + fileName;
    // 查看有无存在的分片目录，没有就创建一个
    if (!fs.existsSync(chunkDir)) {
      fs.mkdirSync(chunkDir);
    }
    // 将上传的分片文件移动到分片目录
    fs.cpSync(files[0].path, chunkDir + '/' + body.name);
    // 删除掉分片文件的原始文件
    fs.rmSync(files[0].path);
  }

  @Get('merge')
  merge(@Query('name') name: string) {
    const chunkDir = 'uploads/chunks_' + name;
    const files = fs.readdirSync(chunkDir);

    let count = 0;
    let startPos = 0;
    files.map((file) => {
      const filePath = chunkDir + '/' + file;
      const stream = fs.createReadStream(filePath);
      stream
        .pipe(
          fs.createWriteStream('uploads/' + name, {
            start: startPos,
          }),
        )
        .on('finish', () => {
          count++;
          if (count === files.length) {
            fs.rm(
              chunkDir,
              {
                recursive: true,
              },
              () => {},
            );
          }
        });
      startPos += fs.statSync(filePath).size;
    });
  }
}
