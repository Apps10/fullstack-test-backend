import { PrismaService } from '../../shared/services/prisma-client';
import { Injectable } from '../../shared/dependency-injection/injectable';
import { CustomerRepository } from '../domain/customer.repository';
import { Customer, PrimitiveCustomer } from '../domain/customer';
import { err, ok, Result } from '../../shared/models/result';
import { CustomerError } from '../domain/customer.exceptions';
import { Logger } from '@nestjs/common';

@Injectable()
export class CustomerPrismaSchema implements CustomerRepository {
  private readonly logger = new Logger('CustomerPrismaSchema');
  constructor(private readonly prisma: PrismaService) {}

  async upsertByIdOrEmailTx(
    id: string,
    data: PrimitiveCustomer,
    tx?: PrismaService,
  ): Promise<Result<Customer, CustomerError>> {
    const client = tx ?? this.prisma;
    try {
      const existingCustomer = await client.customer.findFirst({
        where: {
          OR: [
            { id },
            { email: data.email },
          ],
        },
      });
      
      let newCustomer;
      if (existingCustomer) {
        newCustomer = await client.customer.update({
          where: { id: existingCustomer.id },
          data,
        });
      } else {
        newCustomer = await client.customer.create({
          data: { ...data, id },
        });
      }

      return ok(new Customer({
        ...newCustomer,
      }));
    } catch (e) {
      this.logger.error(e);
      return err({
        kind: 'customer',
        message: 'Error creating a client',
        statusCode: 400,
      });
    }
  }

  getByEmail(email: string): Promise<Result<Customer | null, CustomerError>> {
    return Promise.resolve(ok(null));
  }

  getById(user: string): Promise<Result<Customer | null, CustomerError>> {
    return Promise.resolve(ok(null));
  }

  // async create(user: User): Promise<void> {
  //
  // }

  // async getByEmail(email: string): Promise<User | null> {
  //   const user = await this.prisma.user.findUnique({ where: { email } });
  //   return user ? new User(user) : null;
  // }

  // async getById(userId: string): Promise<User | null> {
  //   const user = await this.prisma.user.findUnique({ where: { id: userId } });
  //   return user ? new User(user) : null;
  // }
}
