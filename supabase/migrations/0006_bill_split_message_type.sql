-- Add bill_split message type so split events appear as a distinct card in chat
ALTER TYPE message_type ADD VALUE IF NOT EXISTS 'bill_split';
