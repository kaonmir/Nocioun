import * as fs from "fs";
import * as path from "path";

export class LocalRepository<T> {
  constructor(private readonly path: string) {}

  async save(value: T) {
    const tokenDir = path.dirname(this.path);

    if (!fs.existsSync(tokenDir)) {
      await fs.promises.mkdir(tokenDir, { recursive: true });
    }

    await fs.promises.writeFile(this.path, JSON.stringify(value, null, 2));
  }

  async load(): Promise<T | null> {
    if (!fs.existsSync(this.path)) {
      return null;
    }

    const value = await fs.promises.readFile(this.path, "utf8");
    return JSON.parse(value);
  }

  async clear() {
    if (fs.existsSync(this.path)) {
      await fs.promises.unlink(this.path);
    }
  }

  async exists(): Promise<boolean> {
    return fs.existsSync(this.path);
  }
}
