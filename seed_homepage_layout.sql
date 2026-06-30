INSERT INTO public.homepage_layouts (name, version, is_published, layout_json)
VALUES (
    'Default Production Layout',
    1,
    true,
    '{
      "sections": [
        { "type": "hero", "id": "sec-hero", "title": "मुख्य समाचार", "is_visible": true, "display_order": 0 },
        { "type": "editorialpicks", "id": "sec-editorial", "title": "संपादकीय चयन", "is_visible": true, "display_order": 1 },
        { "type": "latestnews", "id": "sec-latest", "title": "ताज़ा खबरें", "is_visible": true, "display_order": 2 },
        { "type": "categoryblock", "id": "sec-category", "title": "विविध", "category": "", "limit": 4, "is_visible": true, "display_order": 3 },
        { "type": "magazine", "id": "sec-magazine", "title": "पत्रिका", "is_visible": true, "display_order": 4 },
        { "type": "videos", "id": "sec-videos", "title": "वीडियो", "is_visible": true, "display_order": 5 }
      ]
    }'::jsonb
);
