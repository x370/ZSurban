import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByEmail(email);
    if (user && user.passwordHash === pass) {
      // In production, use bcrypt comparison and sign JWT
      const { passwordHash, ...result } = user.toObject();
      return result;
    }
    return null;
  }

  async login(loginDto: any) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return {
      message: 'Login successful (mock token)',
      access_token: 'mock-jwt-token-for-user',
      user,
    };
  }

  async register(registerDto: any) {
    const existingUser = await this.usersService.findOneByEmail(registerDto.email);
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    const newUser = await this.usersService.create({
      email: registerDto.email,
      name: registerDto.name,
      passwordHash: registerDto.password,
      role: 'user', // default customer
    });

    const { passwordHash, ...result } = newUser.toObject();
    return result;
  }
}
