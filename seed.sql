INSERT INTO "User" (id, name, email, role, "createdAt") 
VALUES ('admin123', 'Admin User', 'admin@example.com', 'admin', NOW()) 
ON CONFLICT (email) DO UPDATE SET role = 'admin';

INSERT INTO "User" (id, name, email, role, "createdAt") 
VALUES ('user123', 'Test User', 'user@example.com', 'user', NOW()) 
ON CONFLICT (email) DO UPDATE SET role = 'user';
