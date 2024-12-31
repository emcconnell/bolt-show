import { BaseModel } from '../../types/models';
import { Repository } from '../interfaces/repository';

export class MemoryRepository<T extends BaseModel> implements Repository<T> {
  protected items: Map<string, T>;

  constructor() {
    this.items = new Map<string, T>();
  }

  async create(data: Omit<T, keyof BaseModel>): Promise<T> {
    const now = new Date();
    const id = `${this.constructor.name.toLowerCase()}_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    const item = {
      ...data,
      id,
      createdAt: now,
      updatedAt: now,
    } as T;

    this.items.set(id, item);
    return item;
  }

  async findById(id: string): Promise<T | null> {
    return this.items.get(id) || null;
  }

  async findOne(filter: Partial<T>): Promise<T | null> {
    for (const item of this.items.values()) {
      if (this.matchesFilter(item, filter)) {
        return item;
      }
    }
    return null;
  }

  async findMany(filter: Partial<T>): Promise<T[]> {
    return Array.from(this.items.values()).filter(item => 
      this.matchesFilter(item, filter)
    );
  }

  async update(id: string, data: Partial<T>): Promise<T> {
    const item = await this.findById(id);
    if (!item) {
      throw new Error('Item not found');
    }

    const updatedItem = {
      ...item,
      ...data,
      updatedAt: new Date(),
    };

    this.items.set(id, updatedItem);
    return updatedItem;
  }

  async delete(id: string): Promise<boolean> {
    return this.items.delete(id);
  }

  private matchesFilter(item: T, filter: Partial<T>): boolean {
    return Object.entries(filter).every(([key, value]) => 
      item[key as keyof T] === value
    );
  }
}