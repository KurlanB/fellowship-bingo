-- Create the players table to store bingo game states
CREATE TABLE players (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id TEXT NOT NULL,
  player_name TEXT NOT NULL,
  year INTEGER NOT NULL,
  cohort TEXT NOT NULL,
  cells JSONB NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries by cohort and year
CREATE INDEX idx_players_cohort_year ON players(year, cohort);
CREATE INDEX idx_players_device ON players(device_id);
CREATE INDEX idx_players_completed ON players(completed) WHERE completed = TRUE;

-- Enable Row Level Security (RLS)
ALTER TABLE players ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations (simple anonymous access)
CREATE POLICY "Allow all select" ON players FOR SELECT USING (true);
CREATE POLICY "Allow all insert" ON players FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update" ON players FOR UPDATE USING (true);

-- Enable realtime for this table
ALTER PUBLICATION supabase_realtime ADD TABLE players;
