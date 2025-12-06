class UsersManagerMemory {
  constructor() {
    this.users = [];
  }

  async create(data) {
    this.users.push(data);
    return data;
  }

  async read(role) {
    if (role) {
      return this.users.filter((u) => u.role === role);
    }
    return this.users;
  }

  async readOne(id) {
    const one = this.users.find((u) => u.id === id);
    if (!one) throw new Error("Not found");
    return one;
  }

  async update(id, data) {
    const index = this.users.findIndex((u) => u.id === id);
    if (index === -1) throw new Error("Not found");

    this.users[index] = { ...this.users[index], ...data };
    return this.users[index];
  }

  async destroy(id) {
    const index = this.users.findIndex((u) => u.id === id);
    if (index === -1) throw new Error("Not found");

    const deleted = this.users.splice(index, 1);
    return deleted[0];
  }

  async readByEmail(email) {
    return this.users.find((u) => u.email === email) || null;
  }

  async readByUserId(userId) {
    return this.users.filter((u) => u.user_id === userId);
  }

  async paginate({ filter = {}, options = {} }) {
    let all = this.users;
    if (filter.role) {
      all = all.filter((u) => u.role === filter.role);
    }
    const page = options.page || 1;
    const limit = options.limit || 10;
    const start = (page - 1) * limit;
    const end = start + limit;

    return {
      docs: all.slice(start, end),
      totalDocs: all.length,
      limit,
      page,
      totalPages: Math.ceil(all.length / limit),
    };
  }

  async aggregate(pipeline) {
    return this.users;
  }
}

const usersManager = new UsersManagerMemory();
export default usersManager;
