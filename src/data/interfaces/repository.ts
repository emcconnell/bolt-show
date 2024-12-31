import { BaseModel } from '../../types/models';

export interface Repository<T extends BaseModel> {
  create(data: Omit<T, keyof BaseModel>): Promise<T>;
  findById(id: string): Promise<T | null>;
  findOne(filter: Partial<T>): Promise<T | null>;
  findMany(filter: Partial<T>): Promise<T[]>;
  update(id: string, data: Partial<T>): Promise<T>;
  delete(id: string): Promise<boolean>;
}