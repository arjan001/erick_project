// Partner Logo Service - Simple localStorage-based storage for partner logos
// This will be replaced with Supabase integration in production

const STORAGE_KEY = 'smartgigs_partner_logos';

const PartnerLogoStore = {
  async list() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  async create(data) {
    const list = await this.list();
    const newItem = {
      id: Date.now().toString(),
      ...data,
      created_at: new Date().toISOString(),
    };
    list.push(newItem);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    return newItem;
  },

  async update(id, data) {
    const list = await this.list();
    const index = list.findIndex(item => item.id === id);
    if (index === -1) throw new Error('Item not found');
    list[index] = { ...list[index], ...data, updated_at: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    return list[index];
  },

  async delete(id) {
    const list = await this.list();
    const filtered = list.filter(item => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  },
};

export async function listPartnerLogos() {
  return await PartnerLogoStore.list();
}

export async function getPartnerLogos() {
  return await listPartnerLogos();
}

export { PartnerLogoStore };
