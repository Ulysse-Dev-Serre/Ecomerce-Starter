-- Custom SQL constraints not natively supported by Prisma

-- Ensure only one ACTIVE cart per user
CREATE UNIQUE INDEX "unique_active_cart_per_user" 
ON "carts" ("userId") 
WHERE "status" = 'ACTIVE';

-- Ensure only one primary media per variant
CREATE UNIQUE INDEX "unique_primary_media_per_variant" 
ON "product_media" ("variantId") 
WHERE "isPrimary" = true;
