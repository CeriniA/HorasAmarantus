-- Add the 'code' column to the organizational_units table
ALTER TABLE public.organizational_units
ADD COLUMN code TEXT;
