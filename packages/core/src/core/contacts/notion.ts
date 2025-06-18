export type NotionPropertyType =
  | "title"
  | "rich_text"
  | "number"
  | "url"
  | "select"
  | "multi_select"
  | "people"
  | "email"
  | "phone_number"
  | "date"
  | "checkbox"
  | "relation"
  | "files"
  | "status";

// Notion 속성 변환기 인터페이스
export interface NotionPropertyConverter {
  toProperty: (value: any) => any;
  toDefinition: () => any;
}

// 각 Notion 속성 타입별 변환기 구현체
export const notionPropertyConverters: Record<
  NotionPropertyType,
  NotionPropertyConverter
> = {
  title: {
    toProperty: (value: string) => ({
      title: [{ text: { content: value } }],
    }),
    toDefinition: () => ({ title: {} }),
  },
  rich_text: {
    toProperty: (value: string) => ({
      rich_text: [{ text: { content: value } }],
    }),
    toDefinition: () => ({ rich_text: {} }),
  },
  number: {
    toProperty: (value: number) => ({
      number: value,
    }),
    toDefinition: () => ({ number: {} }),
  },
  email: {
    toProperty: (value: string) => ({
      email: value,
    }),
    toDefinition: () => ({ email: {} }),
  },
  phone_number: {
    toProperty: (value: string) => ({
      phone_number: value,
    }),
    toDefinition: () => ({ phone_number: {} }),
  },
  url: {
    toProperty: (value: string) => ({
      url: value,
    }),
    toDefinition: () => ({ url: {} }),
  },
  select: {
    toProperty: (value: string) => ({
      select: {
        name: value,
      },
    }),
    toDefinition: () => ({ select: { options: [] } }),
  },
  multi_select: {
    toProperty: (value: string) => ({
      multi_select: value.split(",").map((v: string) => ({ name: v.trim() })),
    }),
    toDefinition: () => ({ multi_select: { options: [] } }),
  },
  people: {
    toProperty: (value: string) => ({
      people: [{ object: "user", id: value }],
    }),
    toDefinition: () => ({ people: {} }),
  },
  date: {
    toProperty: (value: string) => ({
      date: {
        start: value,
      },
    }),
    toDefinition: () => ({ date: {} }),
  },
  checkbox: {
    toProperty: (value: boolean) => ({
      checkbox: value,
    }),
    toDefinition: () => ({ checkbox: {} }),
  },
  relation: {
    toProperty: (value: string) => ({
      relation: [{ id: value }],
    }),
    toDefinition: () => ({ relation: {} }),
  },
  files: {
    toProperty: (value: string) => ({
      files: [{ name: "파일", external: { url: value } }],
    }),
    toDefinition: () => ({ files: {} }),
  },
  status: {
    toProperty: (value: string) => ({
      status: {
        name: value,
      },
    }),
    toDefinition: () => ({ status: { options: [] } }),
  },
};
