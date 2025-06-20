export interface NotionDatabase {
  id: string;
  title: string;
  description: string;
  properties: Record<string, NotionProperty>;
  icon: any;
}

export interface NotionProperty {
  id: string;
  name: string;
  type: string;
}
