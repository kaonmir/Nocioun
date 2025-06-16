import { Person } from "types/person";

export interface PropertyMapping {
  key: string;

  label: string;
  notionType:
    | "checkbox"
    | "created_by"
    | "created_time"
    | "date"
    | "email"
    | "files"
    | "formula"
    | "last_edited_by"
    | "last_edited_time"
    | "multi_select"
    | "number"
    | "people"
    | "phone_number"
    | "relation"
    | "rich_text"
    | "rollup"
    | "select"
    | "status"
    | "title"
    | "url"

    // Special
    | "background"
    | "icon";
}

export interface PropertyGroup {
  id: string;
  title: string;
  color: string;
  bgColor: string;
  codeColor: string;
  focusColor: string;
  properties: PropertyMapping[];
}

function findPrimary(array: any[] | undefined) {
  if (!array) return undefined;
  return array?.find((item) => item.metadata.primary);
}
const googleMapper = (person: Person) => {
  const birthday = findPrimary(person.birthdays)?.date;

  return {
    name: {
      ...findPrimary(person.names),
      nickname: findPrimary(person.nicknames)?.value,
    },
    organization: {
      ...findPrimary(person.organizations),
    },
    email: {
      email: findPrimary(person.emailAddresses)?.value,
    },
    phone: {
      phone: findPrimary(person.phoneNumbers)?.value,
    },
    other: {
      photo: findPrimary(person.photos)?.url,
      birthday: `${birthday?.year}-${birthday?.month}-${birthday?.day}`,
      biography: findPrimary(person.biographies)?.value,
    },
  };
};

export const propertyMappings: PropertyGroup[] = [
  {
    id: "name",
    title: "이름 정보",
    color: "blue-500",
    bgColor: "blue-50 dark:bg-blue-900/20",
    codeColor:
      "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300",
    focusColor: "focus:ring-blue-500",
    properties: [
      {
        key: "displayName",
        label: "연락처의 표시 이름",
        notionType: "rich_text",
      },
      {
        key: "familyName",
        label: "성",
        notionType: "rich_text",
      },
      {
        key: "givenName",
        label: "이름",
        notionType: "rich_text",
      },
      {
        key: "middleName",
        label: "중간 이름",
        notionType: "rich_text",
      },
      {
        key: "honorificPrefix",
        label: "경칭 접두사",
        notionType: "rich_text",
      },
      {
        key: "honorificSuffix",
        label: "경칭 접미사",
        notionType: "rich_text",
      },
      {
        key: "phoneticFamilyName",
        label: "성의 발음 표기",
        notionType: "rich_text",
      },
      {
        key: "phoneticGivenName",
        label: "이름의 발음 표기",
        notionType: "rich_text",
      },
      {
        key: "phoneticMiddleName",
        label: "중간 이름의 발음 표기",
        notionType: "rich_text",
      },
      {
        key: "displayNameLastFirst",
        label: "성-이름 순서로 표시",
        notionType: "rich_text",
      },
      {
        key: "nickname",
        label: "별명 또는 애칭",
        notionType: "rich_text",
      },
    ],
  },
  {
    id: "organization",
    title: "조직 정보",
    color: "green-500",
    bgColor: "green-50 dark:bg-green-900/20",
    codeColor:
      "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300",
    focusColor: "focus:ring-green-500",
    properties: [
      {
        key: "name",
        label: "회사명 또는 조직명",
        notionType: "rich_text",
      },
      {
        key: "department",
        label: "부서명",
        notionType: "rich_text",
      },
      {
        key: "title",
        label: "직책 또는 직위",
        notionType: "rich_text",
      },
    ],
  },
  {
    id: "email",
    title: "이메일 정보",
    color: "indigo-500",
    bgColor: "indigo-50 dark:bg-indigo-900/20",
    codeColor:
      "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300",
    focusColor: "focus:ring-indigo-500",
    properties: [
      {
        key: "emailAddresses.value",
        label: "이메일 주소",
        notionType: "email",
      },
    ],
  },
  {
    id: "phone",
    title: "전화번호 정보",
    color: "purple-500",
    bgColor: "purple-50 dark:bg-purple-900/20",
    codeColor:
      "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300",
    focusColor: "focus:ring-purple-500",
    properties: [
      {
        key: "value",
        label: "전화번호 (원본 형식)",
        notionType: "phone_number",
      },
    ],
  },
  {
    id: "other",
    title: "기타 정보",
    color: "orange-500",
    bgColor: "orange-50 dark:bg-orange-900/20",
    codeColor:
      "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300",
    focusColor: "focus:ring-orange-500",
    properties: [
      {
        key: "photo",
        label: "프로필 사진",
        notionType: "files",
      },
      {
        key: "birthday",
        label: "생년월일",
        notionType: "date",
      },
      {
        key: "biography",
        label: "자기소개 또는 메모",
        notionType: "rich_text",
      },
    ],
  },
];
