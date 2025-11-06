-- Add unique constraint on product_stock to ensure one stock entry per product per site
ALTER TABLE public.product_stock
ADD CONSTRAINT product_stock_product_site_unique UNIQUE (product_id, site_id);