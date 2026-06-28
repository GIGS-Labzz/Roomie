import { Injectable } from '@nestjs/common';

@Injectable()
export class StorageService {
  async upload(_bucket: string, _key: string, _buffer: Buffer) {
    return { url: 'http://localhost:9000/receipts/placeholder' };
  }
}
