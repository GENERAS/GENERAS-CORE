-- AI STRATEGIST SYSTEM
-- Tables for leads, conversations, and bookings

-- =============================================
-- AI LEADS
-- =============================================
CREATE TABLE IF NOT EXISTS ai_leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT,
  email TEXT,
  phone TEXT,
  country TEXT,
  project_type TEXT,
  budget_range TEXT,
  deadline TEXT,
  description TEXT,
  budget_score INTEGER DEFAULT 0,
  intent_score INTEGER DEFAULT 0,
  clarity_score INTEGER DEFAULT 0,
  business_value_score INTEGER DEFAULT 0,
  lead_label TEXT DEFAULT 'cold' CHECK (lead_label IN ('cold', 'warm', 'hot')),
  source TEXT DEFAULT 'ai_chat',
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE ai_leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can insert leads" ON ai_leads;
DROP POLICY IF EXISTS "Only admin can view leads" ON ai_leads;
DROP POLICY IF EXISTS "Only admin can update leads" ON ai_leads;

CREATE POLICY "Anyone can insert leads" ON ai_leads
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Only admin can view leads" ON ai_leads
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

CREATE POLICY "Only admin can update leads" ON ai_leads
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

CREATE INDEX IF NOT EXISTS idx_ai_leads_label ON ai_leads(lead_label);
CREATE INDEX IF NOT EXISTS idx_ai_leads_created ON ai_leads(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_leads_status ON ai_leads(status);

-- =============================================
-- AI CONVERSATIONS
-- =============================================
CREATE TABLE IF NOT EXISTS ai_conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  mode TEXT,
  lead_id UUID REFERENCES ai_leads(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can insert conversations" ON ai_conversations;
DROP POLICY IF EXISTS "Only admin can view conversations" ON ai_conversations;

CREATE POLICY "Anyone can insert conversations" ON ai_conversations
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Only admin can view conversations" ON ai_conversations
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

CREATE INDEX IF NOT EXISTS idx_ai_conversations_session ON ai_conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_created ON ai_conversations(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_lead ON ai_conversations(lead_id);

-- =============================================
-- AI BOOKINGS
-- =============================================
CREATE TABLE IF NOT EXISTS ai_bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  country TEXT,
  project_type TEXT,
  budget_range TEXT,
  deadline TEXT,
  description TEXT,
  preferred_date TEXT,
  preferred_time TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  lead_id UUID REFERENCES ai_leads(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE ai_bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can insert bookings" ON ai_bookings;
DROP POLICY IF EXISTS "Only admin can view bookings" ON ai_bookings;
DROP POLICY IF EXISTS "Only admin can update bookings" ON ai_bookings;

CREATE POLICY "Anyone can insert bookings" ON ai_bookings
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Only admin can view bookings" ON ai_bookings
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

CREATE POLICY "Only admin can update bookings" ON ai_bookings
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

CREATE INDEX IF NOT EXISTS idx_ai_bookings_status ON ai_bookings(status);
CREATE INDEX IF NOT EXISTS idx_ai_bookings_created ON ai_bookings(created_at);

-- Add realtime (skip drop, only add)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE ai_leads;
    ALTER PUBLICATION supabase_realtime ADD TABLE ai_bookings;
  END IF;
END;
$$;

-- =============================================
-- VERIFICATION
-- =============================================
SELECT
  'ai_leads' as table_name,
  EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ai_leads') as exists
UNION ALL
SELECT
  'ai_conversations',
  EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ai_conversations')
UNION ALL
SELECT
  'ai_bookings',
  EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ai_bookings');
