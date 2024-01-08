import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { RegisterDto } from './dto/register.dto';

import { JwtService } from '@nestjs/jwt';
import * as bcryptjs from 'bcryptjs';
import { LoginDto } from './dto/login.dto';

const EXPIRE_TIME = 20 * 1000;

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register({ name, email, password }: RegisterDto) {
    const user = await this.usersService.findOneByEmail(email);

    if (user) {
      throw new BadRequestException('User already exists');
    }

    await this.usersService.create({
      name,
      email,
      password: await bcryptjs.hash(password, 10),
    });

    return {
      name,
      email,
    };
  }

  async login({ email, password }: LoginDto) {
    const user = await this.usersService.findByEmailWithPassword(email);
    if (!user) {
      throw new UnauthorizedException('email is wrong');
    }

    const isPasswordValid = await bcryptjs.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('password is wrong');
    }

    const payload = { email: user.email, role: user.role };

    return {
      user: {
        email: user.email,
        role: user.role
      },
      backendTokens: {
        accessToken: await this.jwtService.signAsync(payload, {
          expiresIn: '20s',
          secret: process.env.SECRET_TOKEN_KEY,
        }),
        refreshToken: await this.jwtService.signAsync(payload, {
          expiresIn: '1h',
          secret: process.env.REFRESH_TOKEN_KEY,
        }),
        expiresIn: new Date().setTime(new Date().getTime() + EXPIRE_TIME),
      },
    };
  }

  
  async refreshToken(email: any){

    const user = await this.usersService.findByEmailWithPassword(email);

    const payload = { email: user.email, role: user.role };

    return {
      accessToken: await this.jwtService.signAsync(payload, {
        expiresIn: '20s',
        secret: process.env.SECRET_TOKEN_KEY,
      }),

      refreshToken: await this.jwtService.signAsync(payload, {
        expiresIn: '1h',
        secret: process.env.REFRESH_TOKEN_KEY,
      }),

      expiresIn: new Date().setTime(new Date().getTime() + EXPIRE_TIME)
    }
  }

  async profile({ email, role }: { email: string; role: string }) {
    return await this.usersService.findOneByEmail(email);
  }
}
