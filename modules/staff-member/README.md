# Staff Member Module

This module adds a dedicated `StaffMember` content type for team-directory sites such as Micro-Team.

Included pieces:

- Prisma model: `StaffMember`
- Public JSON API: `GET /api/staff`
- CRUD API: `POST /api/staff`, `PATCH /api/staff/[id]`, `DELETE /api/staff/[id]`
- Admin UI: `/admin/staff`

The CMS runtime does not yet hot-load modules automatically, so this module is wired into the app through direct imports while still keeping its code isolated under `modules/staff-member`.
