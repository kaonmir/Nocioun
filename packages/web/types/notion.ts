export interface NotionDatabase {
  id: string;
  title: string;
  description: string;
  properties: Record<string, NotionProperty>;
  icon: any;
  url?: string;
}

export interface NotionProperty {
  id: string;
  name: string;
  type: string;
}
