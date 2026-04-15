const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

class ProfileService {
  async create(profileData) {
    return prisma.profile.create({
      data: profileData
    });
  }

  async findById(id) {
    return prisma.profile.findUnique({
      where: { id }
    });
  }

  async findByName(name) {
    return prisma.profile.findUnique({
      where: { name: name.toLowerCase() }
    });
  }

  async findAll(filters = {}) {
    const where = {};

    if (filters.gender) {
      where.gender = filters.gender.toLowerCase();
    }

    if (filters.country_id) {
      where.countryId = filters.country_id.toUpperCase();
    }

    if (filters.age_group) {
      where.ageGroup = filters.age_group.toLowerCase();
    }

    const profiles = await prisma.profile.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      }
    });

    return profiles;
  }

  async deleteById(id) {
    return prisma.profile.delete({
      where: { id }
    });
  }
}

module.exports = new ProfileService();
