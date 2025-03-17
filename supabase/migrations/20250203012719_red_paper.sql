-- Add last analyzed fields to user_profiles table
DO $$ 
BEGIN
    -- Add columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'user_profiles' 
                  AND column_name = 'last_analyzed_journal_id') THEN
        ALTER TABLE user_profiles
        ADD COLUMN last_analyzed_journal_id uuid;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'user_profiles' 
                  AND column_name = 'last_analyzed_collect_id') THEN
        ALTER TABLE user_profiles
        ADD COLUMN last_analyzed_collect_id uuid;
    END IF;

    -- Add foreign key constraints if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                  WHERE constraint_name = 'fk_last_analyzed_journal') THEN
        ALTER TABLE user_profiles
        ADD CONSTRAINT fk_last_analyzed_journal
        FOREIGN KEY (last_analyzed_journal_id)
        REFERENCES journal_entries(id)
        ON DELETE SET NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                  WHERE constraint_name = 'fk_last_analyzed_collect') THEN
        ALTER TABLE user_profiles
        ADD CONSTRAINT fk_last_analyzed_collect
        FOREIGN KEY (last_analyzed_collect_id)
        REFERENCES collects(id)
        ON DELETE SET NULL;
    END IF;
END $$;

-- Add comments for documentation
COMMENT ON COLUMN user_profiles.last_analyzed_journal_id IS 'ID of the last analyzed journal entry';
COMMENT ON COLUMN user_profiles.last_analyzed_collect_id IS 'ID of the last analyzed collect';