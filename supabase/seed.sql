insert into public.segment_mappings (segment, cnaes, keywords, notes)
values
  ('Agencias de marketing', array['7311400', '7319002'], array['marketing', 'trafego', 'social media'], 'Base inicial para demonstracao operacional.'),
  ('Contabilidades', array['6920601'], array['contabilidade', 'contador', 'fiscal'], 'Base inicial para demonstracao operacional.'),
  ('Energia solar', array['4321500', '3511501'], array['solar', 'fotovoltaica', 'energia'], 'Base inicial para demonstracao operacional.')
on conflict do nothing;
