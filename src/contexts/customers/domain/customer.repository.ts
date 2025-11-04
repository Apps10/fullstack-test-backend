import { Result } from '../../shared/models/result';
import { Customer, PrimitiveCustomer } from './customer';
import { CustomerError } from './customer.exceptions';

export abstract class CustomerRepository {
  abstract upsertByIdOrEmailTx(
    id: string,
    user: PrimitiveCustomer,
    tx?,
  ): Promise<Result<Customer, CustomerError>>;
  abstract getByEmail(
    email: string,
  ): Promise<Result<Customer | null, CustomerError>>;
  abstract getById(
    user: string,
  ): Promise<Result<Customer | null, CustomerError>>;
}
