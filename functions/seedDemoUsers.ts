import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const demoUsers = [
      { email: 'artist@artist.com', full_name: 'Alex Chen', role: 'artist', password: 'artist@artist.com' },
      { email: 'team@team.com', full_name: 'Studio Team', role: 'team', password: 'team@team.com' },
      { email: 'project@project.com', full_name: 'Jane Smith', role: 'project_owner', password: 'project@project.com' },
      { email: 'backer@backer.com', full_name: 'Investment Group', role: 'backer', password: 'backer@backer.com' }
    ];

    const results = [];

    for (const userData of demoUsers) {
      try {
        // Check if user already exists
        const existing = await base44.asServiceRole.entities.User.filter({ email: userData.email });
        if (existing && existing.length > 0) {
          results.push({ email: userData.email, status: 'exists' });
          continue;
        }

        // Create user via inviteUser
        await base44.asServiceRole.users.inviteUser(userData.email, userData.role);
        results.push({ email: userData.email, status: 'invited' });
      } catch (err) {
        results.push({ email: userData.email, status: 'error', message: err.message });
      }
    }

    return Response.json({ results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});