import { Injectable, NotFoundException } from '@nestjs/common';
import { IUser } from './interface/user.interface';

import { users } from '../db'

@Injectable()
export class UsersService {
  async findOneByEmail(email: string): Promise<IUser> {
    const existingUser = await users.find((user: IUser) => user.email === email);
    if (!existingUser) {
      throw new NotFoundException(`User with email #${email} not found`);
    }
    return existingUser;
  }

  async login (email: string, password: string) {
    return this.findOneByEmail(email)
  }
}
