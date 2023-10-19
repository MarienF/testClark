import { Injectable } from "@nestjs/common";
import { TokensService } from "./tokens.service";
import { IUser } from "src/users/interface/user.interface";

const oneYear = 60*60*24*365

@Injectable()
export class AuthService {
  constructor(
    private tokensService: TokensService
  ) {}

  async login(user: IUser) {
    return {
      access_token: await this.tokensService.generateAccessToken(user),
    };
  }
}