import { Project, Artist, Team, TickerEntry } from '@/lib/supabaseEntities';
import { mapProjectFromEntity, mapArtistFromEntity, mapTeamFromEntity } from '@/shared/types/entities';

export const adminApi = {
  projects: {
    list: async () => {
      const rows = await Project.list();
      return rows.map(mapProjectFromEntity);
    },
    approve: async (id) => {
      return Project.update(id, { status: 'verified' });
    },
    reject: async (id) => {
      return Project.update(id, { status: 'rejected' });
    },
    enableBacking: async (id) => {
      return Project.update(id, { verified_only: false });
    }
  },
  artists: {
    list: async (sort = '-created_date') => {
      const rows = await Artist.list(sort);
      return rows.map(mapArtistFromEntity);
    },
    approve: async (id, adminNotes) => {
      return Artist.update(id, {
        status: 'approved',
        admin_notes: adminNotes,
        approved_date: new Date().toISOString()
      });
    },
    reject: async (id, adminNotes) => {
      return Artist.update(id, {
        status: 'rejected',
        admin_notes: adminNotes
      });
    }
  },
  teams: {
    list: async (sort = '-created_date') => {
      const rows = await Team.list(sort);
      return rows.map(mapTeamFromEntity);
    },
    approve: async (id, adminNotes) => {
      return Team.update(id, {
        status: 'approved',
        admin_notes: adminNotes,
        approved_date: new Date().toISOString()
      });
    },
    reject: async (id, adminNotes) => {
      return Team.update(id, {
        status: 'rejected',
        admin_notes: adminNotes
      });
    },
    suspend: async (id, adminNotes) => {
      return Team.update(id, {
        status: 'suspended',
        admin_notes: adminNotes
      });
    },
    unsuspend: async (id) => {
      return Team.update(id, { status: 'approved' });
    },
    remove: async (id) => {
      return Team.delete(id);
    }
  },
  ticker: {
    list: async () => {
      return TickerEntry.list();
    },
    create: async (data) => {
      return TickerEntry.create(data);
    },
    update: async (id, data) => {
      return TickerEntry.update(id, data);
    },
    delete: async (id) => {
      return TickerEntry.delete(id);
    }
  }
};