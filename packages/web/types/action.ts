// Temporarily define ActionField locally until core package export is fixed
export interface ActionField {
  key: string;
  name: string;
  description: string;
  notionPropertyType: string;
  defaultNotionPropertyName: string;
}

export interface FieldMapping {
  id?: string;
  action_id: string;
  action_field_key: string;
  notion_property_id?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface CreateFieldMappingRequest {
  action_field_key: string;
  notion_property_id?: string;
}

export interface Action {
  id: string;
  user_id: string;
  name?: string;
  description?: string;
  action_type: string;
  target_type?: "database" | "page";
  target_id?: string;
  status: "draft" | "active" | "paused" | "error";
  created_at: string;
  updated_at: string;
  field_mappings?: FieldMapping[];
}

export interface CreateActionRequest {
  name?: string;
  description?: string;
  action_type: string;
  target_type?: "database" | "page";
  target_id?: string;
}

export interface LocalFieldMapping {
  actionFieldKey: string;
  notionPropertyId?: string;
  notionPropertyName?: string;
  isNewProperty?: boolean;
  status?: "existing" | "new" | "auto_title";
}

export interface CompletedFieldMapping {
  actionFieldKey: string;
  actionFieldName: string;
  actionFieldDescription: string;
  notionPropertyId?: string;
  notionPropertyName?: string;
  notionPropertyType: string;
  isNewProperty?: boolean;
  status?: "existing" | "new" | "auto_title";
}

// ActionField is now defined locally above
