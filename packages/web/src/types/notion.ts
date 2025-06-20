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

export interface NotionOAuthTokens {
  access_token: string;
  token_type: string;
  bot_id: string;
  workspace_name: string;
  workspace_icon: string;
  workspace_id: string;
  owner: {
    type: string;
    user?: {
      id: string;
      name: string;
      avatar_url: string;
      type: string;
      person: {
        email: string;
      };
    };
  };
}
