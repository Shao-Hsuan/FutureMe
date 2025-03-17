-- Create a function to call the scheduled-letters edge function
CREATE OR REPLACE FUNCTION call_scheduled_letters(type text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- This function will be called by a cron job
  -- The actual implementation will be in the Edge Function
  PERFORM
    net.http_post(
      url := current_setting('app.settings.edge_function_url') || '/scheduled-letters',
      body := json_build_object('type', type)::text,
      headers := json_build_object('Content-Type', 'application/json')
    );
END;
$$;

-- Add comment for documentation
COMMENT ON FUNCTION call_scheduled_letters(text) IS 'Calls the scheduled-letters edge function to generate daily or weekly letters';