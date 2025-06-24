export interface FieldMapping {
  actionFieldKey: string;
  actionFieldName: string;
  actionFieldDescription: string;
  notionPropertyId?: string;
  notionPropertyName?: string;
  notionPropertyType: string;
  isNewProperty?: boolean;
  status?: "existing" | "new" | "auto_title";
}

export interface ActionField {
  key: string;
  name: string;
  description: string;
  notionPropertyType: string;
  defaultNotionPropertyName: string;
}

export interface ActionConfig {
  database: any; // DatabaseObjectResponse type
  fieldMappings: FieldMapping[];
  actionType: string;
  databaseId?: string;
}

export interface Action {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  type: string;
  status: "draft" | "active" | "paused" | "error";
  properties: {
    databaseId: string;
    database: any;
    fieldMappings: FieldMapping[];
    actionType: string;
  };
  created_at: string;
  updated_at: string;
}

export interface CreateActionRequest {
  type: string;
  name: string;
  databaseId: string;
  config: ActionConfig;
}
