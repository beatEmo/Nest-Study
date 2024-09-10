import OSS from 'ali-oss';

const client = new OSS({
  region: 'oss-cn-beijing',
  bucket: 'nest-test12',
  accessKeyId: '',
  accessKeySecret: '',
});

async function put() {
  try {
    const result = await client.put('abc.jpg', './1.jpg');
    console.log(result);
  } catch (e) {
    console.log(e);
  }
}

put();
