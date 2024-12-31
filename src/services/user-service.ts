import { UserRepository } from '../data/repositories/user-repository';
import { UserModel } from '../types/models';
import { SignupData } from '../types/auth';
import { hashPassword } from '../utils/auth';

export class UserService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async createUser(data: SignupData): Promise<UserModel> {
    // Check if email already exists
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new Error('Email already registered');
    }

    // Create new user
    const user = await this.userRepository.create({
      email: data.email,
      username: data.username,
      passwordHash: await hashPassword(data.password),
      role: 'user',
      status: 'active', // Set status as active by default
    });

    return user;
  }

  async verifyEmail(token: string): Promise<UserModel> {
    const user = await this.userRepository.findByVerificationToken(token);
    if (!user) {
      throw new Error('Invalid verification token');
    }

    return this.userRepository.verifyUser(user.id);
  }

  async findByEmail(email: string): Promise<UserModel | null> {
    return this.userRepository.findByEmail(email);
  }

  private generateVerificationToken(): string {
    return `verify_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }
}