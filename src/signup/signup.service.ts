import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './user.entity';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class SignupService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    private config: ConfigService,
    private axios: HttpService,
  ) {}

  findUsers() {
    return this.userRepository.find();
  }

  findUserById(id: string) {
    return this.userRepository.findOne({
      where: {
        user_id: id,
      },
    });
  }

  async signupProcess(user_id: string) {
    const user = await this.findUserById(user_id);
    if (!user) {
      const new_user: UserEntity = new UserEntity();
      new_user.user_id = user_id;
      new_user.user_nickname = '아무개';

      return await this.userRepository.save(new_user);
    } else {
      // 이미 존재하는 회원
      return null;
    }
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

    const new_user = await this.signupProcess(user_id);
    if (new_user) return new_user;
    else {
      // pass
      return 'pass';
    }
  }

  async kakaoLogin(code: string) {
    const kakao_api_url = `https://kauth.kakao.com/oauth/token?grant_type=authorization_code&client_id=${this.config.get(
      'KAKAO_CLIENT_ID',
    )}&redirect_url=${this.config.get('KAKAO_REDIRECT_URL')}&code=${code}`;

    try {
      const token_res = await firstValueFrom(this.axios.post(kakao_api_url));
      const access_token: string = token_res.data.access_token;

      const user_ifo = await firstValueFrom(
        this.axios.get('https://kapi.kakao.com/v2/user/me', {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }),
      );
      const user_id: string = user_ifo.data.id;

      // 회원가입 진행
      const new_user = await this.signupProcess(user_id);
      if (new_user) return new_user;
      else {
        // pass
        return 'pass';
      }
    } catch (e) {
      console.log(e);
    }
  }

  async googleLogin(code: string) {
    const google_api_url = `https://oauth2.googleapis.com/token?client_id=${this.config.get(
      'GOOGLE_CLIENT_ID',
    )}&client_secret=${this.config.get(
      'GOOGLE_CLIENT_SECRET',
    )}&code=${code}&grant_type=authorization_code&redirect_uri=${this.config.get(
      'GOOGLE_REDIRECT_URL',
    )}`;

    try {
      const token_res = await firstValueFrom(this.axios.post(google_api_url));
      const access_token: string = token_res.data.access_token;

      const user_info = await firstValueFrom(
        this.axios.get(
          'https://www.googleapis.com/oauth2/v2/userinfo?access_token=' +
            access_token,
          {
            headers: {
              Authorization: `Bearer ${access_token}`,
            },
          },
        ),
      );
      const user_id = user_info.data.id;

      // 회원가입 진행
      const new_user = await this.signupProcess(user_id);
      if (new_user) return new_user;
      else {
        // pass
        return 'pass';
      }
    } catch (e) {
      console.log(e);
    }
  }
}
