import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SignOptions } from 'jsonwebtoken';
import { IUser } from 'src/users/interface/user.interface';

const BASE_OPTIONS: SignOptions = {
  issuer: 'http://localhost:3000',
  audience: 'http://localhost:3000',
};

export interface RefreshTokenPayload {
  jti: number;
  sub: string;
}

@Injectable()
export class TokensService {
  private readonly jwt: JwtService;

  constructor(
    jwt: JwtService,
  ) {
    this.jwt = jwt;
  }

  public async generateAccessToken(user: IUser): Promise<string> {
    const opts: SignOptions = {
      ...BASE_OPTIONS,
      subject: String(user._id),
    };

    return this.jwt.signAsync(
      { },
      opts,
    );
  }
}
