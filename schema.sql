-- Actions 테이블
CREATE TABLE actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name VARCHAR(255),
  description TEXT,
  action_type VARCHAR(100),
  target_type VARCHAR(20),
  target_id VARCHAR(255),
  status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'error')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Field Mappings 테이블
CREATE TABLE field_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action_id UUID NOT NULL REFERENCES actions(id) ON DELETE CASCADE,
  action_field_key VARCHAR(255) NOT NULL,
  notion_property_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 유니크 제약조건 생성 (user_id, target_id 조합이 유니크해야 함)
ALTER TABLE actions ADD CONSTRAINT unique_user_target UNIQUE (user_id, target_id);

-- 인덱스 생성
CREATE INDEX idx_actions_user_id ON actions(user_id);
CREATE INDEX idx_actions_status ON actions(status);
CREATE INDEX idx_actions_action_type ON actions(action_type);
CREATE INDEX idx_field_mappings_action_id ON field_mappings(action_id);

-- RLS (Row Level Security) 정책 활성화
ALTER TABLE actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE field_mappings ENABLE ROW LEVEL SECURITY;

-- RLS 정책 생성 (사용자는 자신의 action만 볼 수 있음)
CREATE POLICY "Users can view their own actions" ON actions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view field mappings for their actions" ON field_mappings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM actions 
      WHERE actions.id = field_mappings.action_id 
      AND actions.user_id = auth.uid()
    )
  );

-- updated_at 자동 업데이트를 위한 트리거 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- updated_at 트리거 생성
CREATE TRIGGER update_actions_updated_at 
  BEFORE UPDATE ON actions 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_field_mappings_updated_at 
  BEFORE UPDATE ON field_mappings 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column(); 