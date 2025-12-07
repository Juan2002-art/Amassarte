import { type User, type InsertUser } from "@shared/schema";
import { randomUUID } from "crypto";
import fs from "fs/promises";
import path from "path";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getConfig(): Promise<any>;
  updateConfig(config: any): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private dataFile: string;
  private config: any;

  constructor() {
    this.users = new Map();
    this.dataFile = path.join(process.cwd(), "server", "data", "store.json");
    console.log("[Storage] Using data file:", this.dataFile);
    this.config = null;
    this.loadConfig(); // Start loading
  }

  private async loadConfig() {
    try {
      const data = await fs.readFile(this.dataFile, "utf-8");
      this.config = JSON.parse(data);
    } catch (e) {
      console.error("[Storage] Failed to load config from:", this.dataFile, e);
      this.config = {};
    }
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

  async getConfig(): Promise<any> {
    if (!this.config) {
      await this.loadConfig();
    }
    return this.config;
  }

  async updateConfig(newConfig: any): Promise<void> {
    this.config = newConfig;
    await fs.writeFile(this.dataFile, JSON.stringify(newConfig, null, 2));
  }
}

export const storage = new MemStorage();
