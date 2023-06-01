INSERT INTO "organization" ("id", "name") 
VALUES 
    ('e53ae1dd-9109-4790-99c6-b862d7ed217d', 'UFMS');

INSERT INTO "document" ("id", "organization_id") 
VALUES
    ('6d08fda9-3f36-4e1f-9266-aeb946dfee06', 'e53ae1dd-9109-4790-99c6-b862d7ed217d');

INSERT INTO "document_node" ("document_id", "index", "metadata")
VALUES
    ('6d08fda9-3f36-4e1f-9266-aeb946dfee06', 0, '{"kind":"text","value":"# Ouvidoria"}');
