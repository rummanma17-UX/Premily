ALTER TABLE "categories"
ADD COLUMN "icon" TEXT NOT NULL DEFAULT 'Shapes';

UPDATE "categories"
SET "icon" = CASE "slug"
  WHEN 'furniture' THEN 'Sofa'
  WHEN 'lighting' THEN 'Lamp'
  WHEN 'living' THEN 'Armchair'
  WHEN 'decor' THEN 'Flower2'
  WHEN 'kitchen' THEN 'Utensils'
  WHEN 'textiles' THEN 'LayoutGrid'
  ELSE 'Shapes'
END;

ALTER TABLE "categories"
ALTER COLUMN "icon" DROP DEFAULT;
