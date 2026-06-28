import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  async validateUser(_token: string) {
    // placeholder validation
    return null;
  }
}
