import {
  NotionConvertor,
  ContactProperties,
  ContactFieldType,
} from "../contacts/NotionConvertor";
import {
  Client,
  CreatePageResponse,
  UpdatePageResponse,
  PageObjectResponse,
} from "@notionhq/client";

jest.mock("@notionhq/client");

const defaultContactProps: ContactProperties = {
  properties: {
    display_name: { name: "Name", value: "홍길동" },
    first_name: { name: "First Name", value: "길동" },
    last_name: { name: "Last Name", value: "홍" },
    email: { name: "Email", value: null },
    phone: { name: "Phone", value: null },
    address: { name: "Address", value: null },
    company: { name: "Company", value: null },
    department: { name: "Department", value: null },
    job_title: { name: "Job Title", value: null },
    notes: { name: "Notes", value: null },
    birthday: { name: "Birthday", value: null },
  },
  iconUrl: null,
  resourceName: "people/12345",
};

describe("NotionConvertor", () => {
  let mockClient: jest.Mocked<Client>;
  let notionConvertor: NotionConvertor;
  const testDatabaseId = "test-database-id-123";

  beforeEach(() => {
    mockClient = {
      pages: {
        create: jest.fn(),
        update: jest.fn(),
      },
    } as any;

    notionConvertor = new NotionConvertor(mockClient, testDatabaseId);
    jest.clearAllMocks();
  });

  describe("convertContact", () => {
    it("연락처 속성을 올바른 Notion 속성으로 변환해야 합니다", () => {
      // Given
      const contactProps: ContactProperties = {
        properties: {
          display_name: { name: "Name", value: "홍길동" },
          first_name: { name: "First Name", value: "길동" },
          last_name: { name: "Last Name", value: "홍" },
          email: { name: "Email", value: "hong@example.com" },
          phone: { name: "Phone", value: "+82-10-1234-5678" },
          address: { name: "Address", value: "서울시 강남구" },
          company: { name: "Company", value: "테스트 회사" },
          department: { name: "Department", value: "개발팀" },
          job_title: { name: "Job Title", value: "시니어 개발자" },
          notes: { name: "Notes", value: "중요한 연락처" },
          birthday: { name: "Birthday", value: "1990-01-01" },
        },
        iconUrl: "https://example.com/avatar.png",
        resourceName: "people/12345",
      };

      // When
      const result = notionConvertor.convertContact(contactProps);

      // Then
      expect(result).toEqual({
        parent: { database_id: testDatabaseId },
        properties: {
          Name: { title: [{ text: { content: "홍길동" } }] },
          "First Name": { rich_text: [{ text: { content: "길동" } }] },
          "Last Name": { rich_text: [{ text: { content: "홍" } }] },
          Email: { email: "hong@example.com" },
          Phone: { phone_number: "+82-10-1234-5678" },
          Address: { rich_text: [{ text: { content: "서울시 강남구" } }] },
          Company: { rich_text: [{ text: { content: "테스트 회사" } }] },
          Department: { rich_text: [{ text: { content: "개발팀" } }] },
          "Job Title": { rich_text: [{ text: { content: "시니어 개발자" } }] },
          Notes: { rich_text: [{ text: { content: "중요한 연락처" } }] },
          Birthday: { date: { start: "1990-01-01" } },
          "Resource Name": {
            rich_text: [{ text: { content: "people/12345" } }],
          },
        },
        icon: {
          type: "external",
          external: { url: "https://example.com/avatar.png" },
        },
      });
    });

    it("빈 first_name을 가진 필드는 제외해야 합니다", () => {
      // Given
      const contactProps: ContactProperties = {
        ...defaultContactProps,
        properties: {
          ...defaultContactProps.properties,
          first_name: { name: "", value: "길동" },
        },
      };

      // When
      const result = notionConvertor.convertContact(contactProps);

      // Then
      expect(result.properties).toEqual({
        Name: { title: [{ text: { content: "홍길동" } }] },
        "Last Name": { rich_text: [{ text: { content: "홍" } }] },
        "Resource Name": { rich_text: [{ text: { content: "people/12345" } }] },
      });
    });

    it("display_name에 값이 없으면 에러를 발생시켜야 합니다", () => {
      // Given
      const contactProps: ContactProperties = {
        ...defaultContactProps,
        properties: {
          ...defaultContactProps.properties,
          display_name: { name: "", value: null },
        },
      };

      // When
      const result = () => notionConvertor.convertContact(contactProps);

      // Then
      expect(result).toThrow("display_name is required");
    });
  });
});
