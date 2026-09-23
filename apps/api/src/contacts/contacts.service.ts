import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { QueryContactsDto } from './dto/query-contacts.dto';

@Injectable()
export class ContactsService {
  constructor(private prisma: PrismaService) {}

  async create(createContactDto: CreateContactDto) {
    const contact = await this.prisma.contact.create({
      data: createContactDto,
      include: {
        company: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return { success: true, data: contact };
  }

  async findAll(query: QueryContactsDto) {
    const { page, limit, companyId, search, sortBy, sortOrder } = query;

    const where: any = {};
    if (companyId) where.companyId = companyId;
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [contacts, total] = await Promise.all([
      this.prisma.contact.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          company: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      this.prisma.contact.count({ where }),
    ]);

    return {
      success: true,
      data: {
        contacts,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1,
        },
      },
    };
  }

  async findOne(id: string) {
    const contact = await this.prisma.contact.findUnique({
      where: { id },
      include: {
        company: true,
        deals: {
          include: {
            deal: {
              select: {
                id: true,
                title: true,
                amount: true,
                status: true,
              },
            },
          },
        },
      },
    });

    if (!contact) {
      throw new NotFoundException('Контакт не найден');
    }

    return { success: true, data: contact };
  }

  async update(id: string, updateContactDto: UpdateContactDto) {
    await this.findOne(id);

    const contact = await this.prisma.contact.update({
      where: { id },
      data: updateContactDto,
      include: {
        company: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return { success: true, data: contact };
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.contact.delete({ where: { id } });
    return { success: true, message: 'Контакт удален' };
  }
}
