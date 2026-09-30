# CRM roles and access

| Role | Leads | Assignment | Activities and tasks |
|---|---|---|---|
| `SUPER_ADMIN` | All | Assign any relationship manager | Manage all visible leads and tasks; change own password |
| `FUND_MANAGER` | All | Assign any relationship manager | Manage all visible leads and tasks; change own password |
| `RELATIONSHIP_MANAGER` | Assigned leads only | Cannot reassign leads | Manage activities and tasks for assigned leads; change own password |
| `COMPLIANCE` | Not enabled in this first release | None | No CRM access yet |
| `CONTENT_MANAGER` | Not enabled in this first release | None | No CRM access yet |
| `INVESTOR` | No staff CRM access | None | No CRM access |

Create separate named accounts for each person from `/admin/team` (super-admin only). Account invitations are limited to fund managers and relationship managers; additional super-admin accounts require an operator to provision them out of band. The invitee receives a one-time link that expires after 72 hours and sets their own password during activation. Invite tokens are stored as SHA-256 hashes, can only be accepted once, and are invalidated when an invite is resent or revoked. Grant `SUPER_ADMIN` sparingly; select the narrowest role that supports the work. A role listed in the schema is not automatically authorised for the first-release CRM.
