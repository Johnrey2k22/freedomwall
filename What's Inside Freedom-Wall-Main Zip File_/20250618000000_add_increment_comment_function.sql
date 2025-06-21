/*
  # Add atomic increment function for comment support_count

  1. New Function
    - `increment_comment_support_count`
      - Atomically increments the `support_count` for a given comment ID.
*/

CREATE OR REPLACE FUNCTION increment_comment_support_count(comment_id_param uuid)
RETURNS void AS $$
BEGIN
  UPDATE comments
  SET support_count = support_count + 1
  WHERE id = comment_id_param;
END;
$$ LANGUAGE plpgsql;

