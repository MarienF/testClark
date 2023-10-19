import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should be insensitive case', async () => {
    const user = await service.findOneByEmail('Demo@klark.ai')
    expect(user).toBeDefined()
  });

  it('succes login', async () => {
    const user = await service.login('demo@klark.ai', "123456")
    expect(user).toBeDefined()
  });

  it('unauthorized login', async () => {
    const user = await service.login('demo@klark.ai', '123465')
    expect(user).toBeDefined()
  });
});
