-- Mark emails verified for accounts created through the invite flow.
-- The create-password link is emailed to the requested address, so completing
-- it proves ownership. better-auth's change-email flow only emails an approval
-- to the current address when email_verified is true; otherwise it skips
-- straight to a verification link at the new address.
UPDATE user
SET email_verified = 1
WHERE lower(email) IN (
  SELECT lower(email) FROM account_requests WHERE status = 'completed'
);
