-- Seed Categories
INSERT INTO public.categories (name, slug, description, type, icon) VALUES
-- Product categories
('Cement & Concrete', 'cement-concrete', 'Cement, concrete, and binding materials', 'product', 'package'),
('Bricks & Blocks', 'bricks-blocks', 'Building bricks, blocks, and masonry', 'product', 'brick-wall'),
('Steel & Iron', 'steel-iron', 'Steel bars, iron rods, and metal products', 'product', 'hammer'),
('Sand & Aggregates', 'sand-aggregates', 'Sand, gravel, and construction aggregates', 'product', 'mountain'),
('Plumbing', 'plumbing', 'Pipes, fittings, and plumbing materials', 'product', 'droplet'),
('Electrical', 'electrical', 'Wires, cables, and electrical supplies', 'product', 'zap'),
('Paints & Finishes', 'paints-finishes', 'Paints, primers, and finishing materials', 'product', 'palette'),
('Wood & Timber', 'wood-timber', 'Lumber, plywood, and wood products', 'product', 'tree-pine'),
('Tiles & Flooring', 'tiles-flooring', 'Floor tiles, wall tiles, and flooring materials', 'product', 'grid-3x3'),
('Hardware & Tools', 'hardware-tools', 'Construction hardware and tools', 'product', 'wrench'),
-- Rental categories
('Apartment', 'apartment', 'Apartment rentals', 'rental', 'building'),
('House', 'house', 'Independent house rentals', 'rental', 'home'),
('Villa', 'villa', 'Villa and luxury home rentals', 'rental', 'castle'),
('Commercial', 'commercial', 'Commercial property rentals', 'rental', 'store'),
-- Service categories
('Architecture', 'architecture', 'Architectural design services', 'service', 'ruler'),
('Structural Engineering', 'structural-engineering', 'Structural engineering services', 'service', 'columns'),
('Interior Design', 'interior-design', 'Interior design and decoration', 'service', 'paintbrush'),
('Civil Engineering', 'civil-engineering', 'Civil engineering services', 'service', 'hard-hat'),
('MEP Engineering', 'mep-engineering', 'Mechanical, electrical, plumbing engineering', 'service', 'settings'),
('Project Management', 'project-management', 'Construction project management', 'service', 'clipboard-list')
ON CONFLICT (slug) DO NOTHING;
