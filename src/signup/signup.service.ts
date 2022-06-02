import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserEntity } from "./user.entity";
import { Repository } from "typeorm";
import { ConfigService } from "@nestjs/config";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";

@Injectable()
export class SignupService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    private config: ConfigService,
    private axios: HttpService,
  ) {
  }

  findUsers() {
    return this.userRepository.find();
  }

  async naverLogin(state: string, code: string) {
    const naver_api_url = `https://nid.naver.com/oauth2.0/token?grant_type=authorization_code&response_type=code&client_id=${this.config.get(
      'NAVER_CLIENT_ID',
    )}&client_secret=${this.config.get(
      'NAVER_CLIENT_SECRET',
    )}&redirect_uri=${this.config.get(
      'NAVER_REDIRECT_URL',
    )}&code=${code}&state=${state}`;

    // access_token 얻기 위한 첫 번째 요청
    const res = await firstValueFrom(
      this.axios.get(naver_api_url, {
        headers: {
          'X-Naver-Client-Id': this.config.get('NAVER_CLIENT_ID'),
          'X-Naver-Client-Secret': this.config.get('NAVER_CLIENT_SECRET'),
        },
      }),
    );
    const access_token = res.data.access_token;

    // access_token 사용해서 사용자 정보 가져오기 위한 두 번째 요청
    const user_info = await firstValueFrom(
      this.axios.get('https://openapi.naver.com/v1/nid/me', {
        headers: {
          Authorization: 'Bearer ' + access_token,
        },
      }),
    );
    const user_id = user_info.data.response.id;

    // 회원가입 진행
    const user = new UserEntity();
    user.user_id = user_id;
    user.user_nickname = '아무개';
    return await this.userRepository.save(user);
  }
}
