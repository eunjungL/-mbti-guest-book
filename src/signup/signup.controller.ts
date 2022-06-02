import { Controller, Get, Query } from "@nestjs/common";
import { SignupService } from './signup.service';

@Controller('/api/signup')
export class SignupController {
  constructor(private signupService: SignupService) {}

  @Get('/naver/callback')
  naverLogin(@Query('state') state: string, @Query('code') code: string) {
    return this.signupService.naverLogin(state, code);
  }
}
