/*
  # Add atomic increment function for confession support_count

  1. New Function
    - `increment_support_count`
      - Atomically increments the `support_count` for a given confession ID.
*/

CREATE OR REPLACE FUNCTION increment_support_count(confession_id_param uuid)
RETURNS void AS $$
BEGIN
  UPDATE confessions
  SET support_count = support_count + 1
  WHERE id = confession_id_param;
END;
$$ LANGUAGE plpgsql;

