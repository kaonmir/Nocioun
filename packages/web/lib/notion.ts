import { Client } from "@notionhq/client";
import { NotionDatabase, NotionProperty } from "@/types/notion";
import { PlaceData } from "@/core/map/properties/columns";
import {
  generateColumnProperties,
  validateColumnTypes as validateColumns,
  findMissingColumns,
} from "@/core/map/properties/columns";
import {
  convertPlaceDataToNotionProperties,
  createNotionBlocks,
} from "@/core/map/properties/place-converter";

export class NotionService {
  private client: Client;

  constructor(accessToken: string) {
    this.client = new Client({
      auth: accessToken,
    });
  }

  async getDatabases(): Promise<NotionDatabase[]> {
    try {
      const response = await this.client.search({
        filter: {
          property: "object",
          value: "database",
        },
        page_size: 20,
      });

      return response.results.map((db: any) => ({
        id: db.id,
        title: db.title?.[0]?.plain_text || "Untitled Database",
        description: db.description?.[0]?.plain_text || "",
        properties: this.parseProperties(db.properties),
        icon: db.icon,
      }));
    } catch (error) {
      console.error("Error fetching databases:", error);
      throw new Error("Failed to fetch databases");
    }
  }

  async getDatabase(databaseId: string): Promise<NotionDatabase> {
    try {
      const response = await this.client.databases.retrieve({
        database_id: databaseId,
      });

      return {
        id: response.id,
        title: (response as any).title?.[0]?.plain_text || "Untitled Database",
        description: (response as any).description?.[0]?.plain_text || "",
        icon: (response as any).icon,
        properties: this.parseProperties((response as any).properties),
      };
    } catch (error) {
      console.error("Error fetching database:", error);
      throw new Error("Failed to fetch database");
    }
  }

  async getDatabaseInfo(databaseId: string) {
    try {
      const database = await this.getDatabase(databaseId);
      const existingColumns = Object.keys(database.properties);
      const missingColumns = findMissingColumns(existingColumns);
      const columnTypeValidation = validateColumns(database.properties);

      return {
        database,
        missingColumns,
        hasAllRequiredColumns: missingColumns.length === 0,
        columnTypeValidation,
      };
    } catch (error) {
      console.error("Error fetching database info:", error);
      throw new Error("Failed to fetch database info");
    }
  }

  // 데이터베이스의 title property 이름을 찾는 헬퍼 메서드
  private async getTitlePropertyName(databaseId: string): Promise<string> {
    try {
      const response = await this.client.databases.retrieve({
        database_id: databaseId,
      });

      const properties = (response as any).properties;
      for (const [propertyName, property] of Object.entries(properties)) {
        if ((property as any).type === "title") {
          return propertyName;
        }
      }

      throw new Error("No title property found in database");
    } catch (error) {
      console.error("Error finding title property:", error);
      throw new Error("Failed to find title property");
    }
  }

  async addColumnsToDatabase(
    databaseId: string,
    columnsToAdd: string[]
  ): Promise<void> {
    try {
      const properties = generateColumnProperties(columnsToAdd);

      await this.client.databases.update({
        database_id: databaseId,
        properties,
      });
    } catch (error) {
      console.error("Error adding columns:", error);
      throw new Error("Failed to add columns to database");
    }
  }

  async addPlaceToDatabase(
    databaseId: string,
    placeData: PlaceData
  ): Promise<void> {
    try {
      const titlePropertyName = await this.getTitlePropertyName(databaseId);
      const properties = convertPlaceDataToNotionProperties(
        placeData,
        titlePropertyName
      );
      const blocks = createNotionBlocks(placeData);

      await this.client.pages.create({
        parent: {
          database_id: databaseId,
        },
        properties,
        children: blocks,
        cover: {
          type: "external",
          external: {
            url: placeData.photo_url,
          },
        },
      });
    } catch (error) {
      console.error("Error adding place to database:", error);
      throw new Error("Failed to add place to database");
    }
  }

  private parseProperties(properties: any): Record<string, NotionProperty> {
    const parsed: Record<string, NotionProperty> = {};

    Object.entries(properties).forEach(([key, value]: [string, any]) => {
      parsed[key] = {
        id: value.id,
        name: key,
        type: value.type,
      };
    });

    return parsed;
  }

  // 필요한 컬럼들의 타입이 올바른지 검증하는 메서드 (deprecated: columns 모듈의 validateColumnTypes 사용)
  async validateColumnTypes(databaseId: string): Promise<{
    isValid: boolean;
    invalidColumns: Array<{
      name: string;
      currentType: string;
      expectedType: string;
    }>;
  }> {
    try {
      const database = await this.getDatabase(databaseId);
      return validateColumns(database.properties);
    } catch (error) {
      console.error("Error validating column types:", error);
      throw new Error("Failed to validate column types");
    }
  }
}
