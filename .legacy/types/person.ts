// Google People API Person 타입 정의

interface Source {
  type: string;
  id: string;
  etag?: string;
  updateTime?: string;
}

interface Metadata {
  primary?: boolean;
  source: Source;
  sourcePrimary?: boolean;
}

interface PersonMetadata {
  sources: Source[];
  objectType: string;
}

interface Name {
  metadata: Metadata;
  displayName?: string;
  familyName?: string;
  givenName?: string;
  middleName?: string;
  honorificPrefix?: string;
  honorificSuffix?: string;
  phoneticFamilyName?: string;
  phoneticGivenName?: string;
  phoneticMiddleName?: string;
  displayNameLastFirst?: string;
  unstructuredName?: string;
}

interface Nickname {
  metadata: Metadata;
  value: string;
}

interface Photo {
  metadata: Metadata;
  url: string;
  default?: boolean;
}

interface DateValue {
  year?: number;
  month?: number;
  day?: number;
}

interface Birthday {
  metadata: Metadata;
  date: DateValue;
}

interface Address {
  metadata: Metadata;
  formattedValue?: string;
  type?: string;
  formattedType?: string;
  poBox?: string;
  streetAddress?: string;
  extendedAddress?: string;
  postalCode?: string;
  country?: string;
  countryCode?: string;
}

interface EmailAddress {
  metadata: Metadata;
  value: string;
  type?: string;
  formattedType?: string;
}

interface PhoneNumber {
  metadata: Metadata;
  value: string;
  canonicalForm?: string;
  type?: string;
  formattedType?: string;
}

interface Biography {
  metadata: Metadata;
  value: string;
  contentType: string;
}

interface Url {
  metadata: Metadata;
  value: string;
  type?: string;
  formattedType?: string;
}

interface Organization {
  metadata: Metadata;
  name?: string;
  department?: string;
  title?: string;
}

interface ContactGroupMembership {
  contactGroupId: string;
  contactGroupResourceName: string;
}

interface Membership {
  metadata: Metadata;
  contactGroupMembership: ContactGroupMembership;
}

interface Event {
  metadata: Metadata;
  date: DateValue;
  type?: string;
  formattedType?: string;
}

interface Relation {
  metadata: Metadata;
  person: string;
  type?: string;
  formattedType?: string;
}

export interface Person {
  resourceName: string;
  etag: string;
  metadata: PersonMetadata;
  names?: Name[];
  nicknames?: Nickname[];
  photos?: Photo[];
  birthdays?: Birthday[];
  addresses?: Address[];
  emailAddresses?: EmailAddress[];
  phoneNumbers?: PhoneNumber[];
  biographies?: Biography[];
  urls?: Url[];
  organizations?: Organization[];
  memberships?: Membership[];
  events?: Event[];
  relations?: Relation[];
}

// 편의를 위한 유틸리티 타입들
export type PersonField = keyof Person;

export interface PersonSummary {
  resourceName: string;
  displayName?: string;
  primaryEmail?: string;
  primaryPhone?: string;
}
