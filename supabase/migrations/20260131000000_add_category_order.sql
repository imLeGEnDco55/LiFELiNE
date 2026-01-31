-- Add order_index to categories for reordering support
ALTER TABLE public.categories 
ADD COLUMN IF NOT EXISTS order_index INTEGER NOT NULL DEFAULT 0;
