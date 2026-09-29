# CRM roles and access

| Role | Leads | Assignment | Activities and tasks |
|---|---|---|---|
| `SUPER_ADMIN` | All | Assign any relationship manager | Manage all visible leads and tasks; change own password |
| `FUND_MANAGER` | All | Assign any relationship manager | Manage all visible leads and tasks; change own password |
| `RELATIONSHIP_MANAGER` | Assigned leads only | Cannot reassign leads | Manage activities and tasks for assigned leads; change own password |
| `COMPLIANCE` | Not enabled in this first release | None | No CRM access yet |
| `CONTENT_MANAGER` | Not enabled in this first release | None | No CRM access yet |
| `INVESTOR` | No staff CRM access | None | No CRM access |

Create separate named accounts for each person from `/admin/team` (super-admin only). Account creation is limited to fund managers and relationship managers; additional super-admin accounts require an operator to provision them out of band. The browser generates a temporary password and displays it once. Share it privately; the new user must replace it before entering the CRM. Grant `SUPER_ADMIN` sparingly; select the narrowest role that supports the work. A role listed in the schema is not automatically authorised for the first-release CRM.
