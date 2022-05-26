import { Controller, Get } from '@nestjs/common';
import { SignupService } from './signup.service';

@Controller('/api/signup')
export class SignupController {
  constructor(private signupService: SignupService) {}

  @Get()
  test() {
    return this.signupService.findUsers();
  }
}
