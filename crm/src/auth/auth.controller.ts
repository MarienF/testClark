import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RetrieveTokenDto } from './dto/retrieve-token.dto';
import { UsersService } from '../users/users.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService
  ) {}

  @Post('token')
  @HttpCode(200)
  async getAccessToken(@Body() retrieveTokenDto: RetrieveTokenDto) {
    try {
      const user = await this.usersService.login(retrieveTokenDto.email, retrieveTokenDto.password)
      if (!user || !retrieveTokenDto.password) throw new Error('Bad email/password.')
      return this.authService.login(user);
    } catch(error: any) {
      throw new UnauthorizedException();
    }
  }

}
