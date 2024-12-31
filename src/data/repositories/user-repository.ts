import { UserModel } from '../../types/models';
import { MemoryRepository } from './memory-repository';

export class UserRepository extends MemoryRepository<UserModel> {
  async findByEmail(email: string): Promise<UserModel | null> {
    return this.findOne({ email });
  }

  async findByVerificationToken(token: string): Promise<UserModel | null> {
    return this.findOne({ verificationToken: token });
  }

  async verifyUser(id: string): Promise<UserModel> {
    return this.update(id, {
      status: 'active',
      verificationToken: undefined,
    });
  }

  async updateLastLogin(id: string): Promise<UserModel> {
    return this.update(id, {
      lastLoginAt: new Date(),
    });
  }
}