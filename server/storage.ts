import { type User, type InsertUser, type Activity, type InsertActivity, type PDF } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  getActivity(id: string): Promise<Activity | undefined>;
  storePDF(filename: string, content: string, size: number): Promise<PDF>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private activities: Map<string, Activity>;
  private pdfs: Map<string, PDF>;

  constructor() {
    this.users = new Map();
    this.activities = new Map();
    this.pdfs = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const id = randomUUID();
    const activity: Activity = {
      ...insertActivity,
      id,
      createdAt: new Date(),
      isPediatric: insertActivity.isPediatric ?? null,
      customContext: insertActivity.customContext ?? null,
    };
    this.activities.set(id, activity);
    return activity;
  }

  async getActivity(id: string): Promise<Activity | undefined> {
    return this.activities.get(id);
  }

  async storePDF(filename: string, content: string, size: number): Promise<PDF> {
    const id = randomUUID();
    const pdf: PDF = {
      id,
      filename,
      content,
      size,
      uploadedAt: new Date(),
    };
    this.pdfs.set(id, pdf);
    return pdf;
  }
}

export const storage = new MemStorage();
