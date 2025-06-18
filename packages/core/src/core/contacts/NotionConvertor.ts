import {
  notionPropertyConverters,
  NotionPropertyConverter,
  NotionPropertyType,
} from "./notion";
import {
  CreatePageParameters,
  Client,
  CreatePageResponse,
  UpdatePageResponse,
  PageObjectResponse,
} from "@notionhq/client";

// Contact 필드 타입 (오타 수정: Covert -> Contact)
export type ContactFieldType =
  | "display_name"
  | "first_name"
  | "last_name"
  | "email"
  | "phone"
  | "address"
  | "company"
  | "department"
  | "job_title"
  | "notes"
  | "birthday";

// 연락처 속성을 나타내는 타입
export type ContactProperties = {
  properties: {
    [key in ContactFieldType]: {
      name: string; // Notion Field
      value: string | null; // Actual Value
    };
  };
  iconUrl: string | null;
  resourceName: string;
};

// 연락처 필드와 Notion 속성 타입 간의 기본 매핑
export const contactFieldToNotionTypeMap: {
  [key in ContactFieldType]: NotionPropertyConverter;
} = {
  display_name: notionPropertyConverters.title,
  first_name: notionPropertyConverters.rich_text,
  last_name: notionPropertyConverters.rich_text,
  email: notionPropertyConverters.email,
  phone: notionPropertyConverters.phone_number,
  address: notionPropertyConverters.rich_text,
  company: notionPropertyConverters.rich_text,
  department: notionPropertyConverters.rich_text,
  job_title: notionPropertyConverters.rich_text,
  notes: notionPropertyConverters.rich_text,
  birthday: notionPropertyConverters.date,
};

export class NotionConvertor {
  constructor(
    private readonly client: Client,
    private readonly databaseId: string
  ) {}

  async createPage(props: ContactProperties): Promise<CreatePageResponse> {
    const parameters = this.convertContact(props);
    return await this.client.pages.create(parameters);
  }

  async updatePage(
    page: PageObjectResponse,
    props: ContactProperties
  ): Promise<UpdatePageResponse> {
    const parameters = this.convertContact(props);
    return await this.client.pages.update({
      page_id: page.id,
      properties: parameters.properties,
      // @ts-ignore
      icon: parameters.icon ?? page.icon,
      // @ts-ignore
      cover: parameters.cover ?? page.cover,
    });
  }

  async deletePageByResourceName(resourceName: string): Promise<void> {
    const page = await this.findPageByResourceName(resourceName);
    if (!page) {
      throw new Error(`Page not found: ${resourceName}`);
    }
    await this.client.pages.update({
      page_id: page.id,
      archived: true,
    });
  }

  async findPageByResourceName(
    resourceName: string
  ): Promise<PageObjectResponse | null> {
    const response = await this.client.databases.query({
      database_id: this.databaseId,
      filter: {
        property: "Resource Name",
        rich_text: {
          equals: resourceName,
        },
      },
    });
    return response.results[0] as PageObjectResponse;
  }

  // 연락처 속성을 Notion 속성으로 변환
  convertContact(props: ContactProperties): CreatePageParameters {
    const parameters: CreatePageParameters = {
      parent: { database_id: this.databaseId },
      properties: {},
    };

    // Properties 필드 처리
    for (const entry of Object.entries(props.properties)) {
      const [contactField, { name: notionField, value: fieldValue }] = entry;
      if (contactField === "display_name" && !fieldValue) {
        throw new Error("display_name is required");
      }

      if (!notionField) {
        continue;
      }

      if (fieldValue !== null) {
        const propertyConverter =
          contactFieldToNotionTypeMap[contactField as ContactFieldType];
        parameters.properties[notionField] =
          propertyConverter.toProperty(fieldValue);
      }
    }

    // 추가 필드 처리 (resource_name, iconUrl)
    parameters.properties["Resource Name"] =
      notionPropertyConverters.rich_text.toProperty(props.resourceName);

    if (props.iconUrl) {
      parameters.icon = {
        type: "external",
        external: { url: props.iconUrl },
      };
    }
    return parameters;
  }
}
