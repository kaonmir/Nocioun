import { CreatePageParameters, PageObjectResponse } from "@notionhq/client";
import { UpdateDatabaseParameters } from "@notionhq/client/build/src/api-endpoints";

type NotionPropertyType = PageObjectResponse["properties"][string]["type"];

export interface CreateFieldMap {
  key: string;
  name: string;
  description: string;
  propertyType: NotionPropertyType;
  defaultPropertyName: string;
}

export interface FieldMap {
  field_key: string;
  notion_key: string;
}

export abstract class Mapper {
  constructor(protected readonly mappingFields: CreateFieldMap[]) {}

  abstract getData(): Promise<
    Record<
      (typeof this.mappingFields)[number]["key"],
      string | number | null | undefined
    >
  >;

  async getPageParameters(
    databaseId: string,
    propertyMap: FieldMap[]
  ): Promise<CreatePageParameters> {
    const data = await this.getData();
    const properties: any = {};

    for (const property of propertyMap) {
      const value = data[property.field_key as keyof typeof data];
      const notionProperty = this.getNotionPropertyByType(
        this.mappingFields.find((field) => field.key === property.field_key)!
          .propertyType,
        value
      );

      if (notionProperty !== null) {
        properties[property.notion_key] = notionProperty;
      }
    }

    return {
      parent: { type: "database_id", database_id: databaseId },
      properties,
    };
  }

  private getNotionPropertyByType(
    propertyType: NotionPropertyType,
    value: string | number | null | undefined
  ) {
    if (value === null || value === undefined) {
      return null;
    }

    switch (propertyType) {
      case "title":
        return {
          title: [{ text: { content: String(value) } }],
        };
      case "rich_text":
        return {
          rich_text: [{ text: { content: String(value) } }],
        };
      case "phone_number":
        return {
          phone_number: String(value),
        };
      case "select":
        return {
          select: {
            name: String(value),
          },
        };
      case "multi_select":
        // 값이 배열이거나 쉼표로 구분된 문자열인 경우를 처리
        const selectValues = Array.isArray(value)
          ? value
          : String(value)
              .split(",")
              .map((v) => v.trim())
              .filter((v) => v);
        return {
          multi_select: selectValues.map((name) => ({ name: String(name) })),
        };
      case "url":
        return {
          url: String(value),
        };
      case "email":
        return {
          email: String(value),
        };
      case "number":
        return {
          number: Number(value),
        };
      case "checkbox":
        // boolean 값이거나 문자열 'true'/'false'를 처리
        const boolValue =
          typeof value === "boolean"
            ? value
            : String(value).toLowerCase() === "true";
        return {
          checkbox: boolValue,
        };
      case "date":
        // Date 객체, ISO 문자열, 또는 YYYY-MM-DD 형식을 처리
        return {
          date: {
            start: String(value),
            // TODO: end time까지 처리하도록
          },
        };
      case "people":
        // 사용자 ID 배열이거나 쉼표로 구분된 문자열을 처리
        const peopleIds = Array.isArray(value)
          ? value
          : String(value)
              .split(",")
              .map((id) => id.trim())
              .filter((id) => id);
        return {
          people: peopleIds.map((id) => ({ id: String(id) })),
        };
      case "files":
        // 파일 URL 배열이거나 쉼표로 구분된 문자열을 처리
        const fileUrls = Array.isArray(value)
          ? value
          : String(value)
              .split(",")
              .map((url) => url.trim())
              .filter((url) => url);
        return {
          files: fileUrls.map((url) => ({
            type: "external" as const,
            name: url.split("/").pop() || "file",
            external: { url: String(url) },
          })),
        };
      case "status":
        return {
          status: {
            name: String(value),
          },
        };
      default:
        console.error(`Unsupported property type: ${propertyType}`);
        return null;
    }
  }

  // TODO:
  async updateDatabaseProperties(
    databaseId: string,
    targetKeys: (typeof this.mappingFields)[number]["key"][]
  ): Promise<UpdateDatabaseParameters> {
    const properties: Record<string, any> = {};

    for (const key of targetKeys) {
      properties[key] = this.getNotionPropertyByType(
        this.mappingFields.find((field) => field.key === key)!.propertyType,
        null
      );
    }

    return {
      database_id: databaseId,
      properties,
    };
  }
}
