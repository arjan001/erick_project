import { base44 } from '@/shared/api/base44.client';
import { mapProjectFromEntity, mapArtistFromEntity, mapTeamFromEntity } from '@/shared/types/entities';

export const adminApi = {
  projects: {
    list: async () => {
      const rows = await base44.entities.Project.list();
      return rows.map(mapProjectFromEntity);
    },
    approve: async (id) => {
      return base44.entities.Project.update(id, { status: 'verified' });
    },
    reject: async (id) => {
      return base44.entities.Project.update(id, { status: 'rejected' });
    },
    enableBacking: async (id) => {
      return base44.entities.Project.update(id, { verified_only: false });
    }
  },
  artists: {
    list: async (sort = '-created_date') => {
      const rows = await base44.entities.Artist.list(sort);
      return rows.map(mapArtistFromEntity);
    },
    approve: async (id, adminNotes) => {
      return base44.entities.Artist.update(id, {
        status: 'approved',
        admin_notes: adminNotes,
        approved_date: new Date().toISOString()
      });
    },
    reject: async (id, adminNotes) => {
      return base44.entities.Artist.update(id, {
        status: 'rejected',
        admin_notes: adminNotes
      });
    }
  },
  teams: {
    list: async (sort = '-created_date') => {
      const rows = await base44.entities.Team.list(sort);
      return rows.map(mapTeamFromEntity);
    },
    approve: async (id, adminNotes) => {
      return base44.entities.Team.update(id, {
        status: 'approved',
        admin_notes: adminNotes,
        approved_date: new Date().toISOString()
      });
    },
    reject: async (id, adminNotes) => {
      return base44.entities.Team.update(id, {
        status: 'rejected',
        admin_notes: adminNotes
      });
    }
  },
  ticker: {
    list: async () => {
      return base44.entities.TickerEntry.list();
    },
    create: async (data) => {
      return base44.entities.TickerEntry.create(data);
    },
    update: async (id, data) => {
      return base44.entities.TickerEntry.update(id, data);
    },
    delete: async (id) => {
      return base44.entities.TickerEntry.delete(id);
    }
  }
};
