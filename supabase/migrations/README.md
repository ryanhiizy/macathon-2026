Migration filename format:

- `00001_descriptive_name.sql`
- `00002_descriptive_name.sql`

In this repo we use a simple ordered prefix so the first migration reads cleanly.

Example:

- `00001_initial_presence_schema.sql`

That means:

- `00001` is the first repo migration
- `initial_presence_schema` human-readable migration name

The database schema for this app remains `public` unless we explicitly create another schema.

Note:

- Supabase's hosted migration history may still show a timestamped version for migrations applied through MCP tooling.
- The local repo migration filename does not change the actual database schema name.
