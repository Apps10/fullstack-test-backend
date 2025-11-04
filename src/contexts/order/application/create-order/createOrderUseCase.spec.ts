import { ok, err } from '../../../shared/models/result';
import { OrderStatus } from '../../domain/orderStatus.enum';
import { TransactionStatus } from '../../../transactions/domain/transaction';
import { CreateOrderUseCase } from './create-order-use-case';

jest.mock('uuid', () => ({ v4: jest.fn(() => 'uuid-test') }));

describe('CreateOrderUseCase', () => {
  let inventoryRepo: any;
  let orderRepo: any;
  let customerRepo: any;
  let transactionRepo: any;
  let usecase: CreateOrderUseCase;

  const productA = { id: 'p-a', price: 10.0 };
  const productB = { id: 'p-b', price: 20.5 };

  beforeEach(() => {
    inventoryRepo = {
      findProductsById: jest.fn(),
      checkAvailability: jest.fn(),
      reserveStockTx: jest.fn(),
    };

    orderRepo = {
      findByIdIfIsProccesed: jest.fn(),
      runInTransaction: jest.fn(async (cb: any) => {
        // default: run callback and return its result
        return cb({});
      }),
      createOrder: jest.fn(),
    };

    customerRepo = {
      upsertByIdOrEmailTx: jest.fn(),
    };

    transactionRepo = {
      createTransactionTx: jest.fn(),
    };

    usecase = new CreateOrderUseCase(
      inventoryRepo,
      orderRepo,
      customerRepo,
      transactionRepo,
    );
  });

  test('returns error when orderItems is empty or undefined', async () => {
    const res1 = await usecase.execute({ orderItems: [] as any, delivery: { name: 'A', email: 'a@b', address: "", phone: ""} });
    expect(res1.isOk).toBe(false);
    expect(res1.isOk === false && res1.error).toBeDefined();

    const res2 = await usecase.execute({ orderItems: undefined as any, delivery: { name: 'A', email: 'a@b', address: "", phone: ""} });
    expect(res2.isOk).toBe(false);
    expect(res2.isOk === false && res2.error).toBeDefined();
  });

  test('returns error when delivery info is missing', async () => {
    const items = [{ productId: 'p-a', quantity: 1 }];
    const res = await usecase.execute({ orderItems: items as any, delivery: undefined as any });
    expect(res.isOk).toBe(false);
    expect(res.isOk === false && res.error).toBeDefined();
    expect((res.isOk === false && res.error as any).message).toMatch(/delivery info is required/i);
  });

  test('invalid quantity (non-integer or <=0) returns error', async () => {
    const items1 = [{ productId: 'p-a', quantity: 0 }];
    const items2 = [{ productId: 'p-a', quantity: 1.5 }];
    const items3 = [{ productId: 'p-a', quantity: -1 }];

    const res1 = await usecase.execute({ orderItems: items1 as any, delivery: { name: 'X', address: "", phone: "", email: ""} });
    expect(res1.isOk).toBe(false);

    const res2 = await usecase.execute({ orderItems: items2 as any, delivery: { name: 'X', address: "", phone: "", email: "" } });
    expect(res2.isOk).toBe(false);

    const res3 = await usecase.execute({ orderItems: items3 as any, delivery: { name: 'X', address: "", phone: "", email: "" } });
    expect(res3.isOk).toBe(false);
  });

  test('returns OrderAlreadyProcessedError when findByIdIfIsProccesed returns existing processed order', async () => {
    const items = [{ productId: 'p-a', quantity: 1 }];
    orderRepo.findByIdIfIsProccesed.mockResolvedValueOnce(ok({ some: 'value' }));
    const res = await usecase.execute({ orderItems: items as any, delivery: { name: 'X',  address: "", phone: "", email: "" }, orderId: 'o-1' });
    expect(res.isOk).toBe(false);
    expect(res.isOk === false && res.error).toBeDefined();
  });

  test('propagates inventory.findProductsById error', async () => {
    const items = [{ productId: 'p-a', quantity: 1 }];
    orderRepo.findByIdIfIsProccesed.mockResolvedValueOnce(ok(null));
    inventoryRepo.findProductsById.mockResolvedValueOnce(err({ message: 'inv err' }));

    const res = await usecase.execute({ orderItems: items as any, delivery: { name: 'X', address: "", phone: "", email: "" }, orderId: 'o-1' });
    expect(res.isOk).toBe(false);
    expect(res.isOk === false && res.error).toEqual({ message: 'inv err' });
  });

  test('propagates inventory.checkAvailability error', async () => {
    const items = [{ productId: 'p-a', quantity: 2 }];
    orderRepo.findByIdIfIsProccesed.mockResolvedValueOnce(ok(null));
    inventoryRepo.findProductsById.mockResolvedValueOnce(ok([productA]));
    inventoryRepo.checkAvailability.mockResolvedValueOnce(err({ message: 'not enough stock' }));

    const res = await usecase.execute({ orderItems: items as any, delivery: { name: 'X', address: "", phone: "", email: "" } });
    expect(res.isOk).toBe(false);
    expect(res.isOk === false && res.error).toEqual({ message: 'not enough stock' });
  });

  test('successful flow creates order, transaction, reserves stock and returns ok with rounded totals', async () => {
    // orderItems: 2 x productA (10.0) and 1 x productB (20.5) => baseFee = 2*10 + 1*20.5 = 40.5
    // IVA 19% -> taxFee = round(40.5 * 0.19) = round(7.695) = 8
    // totalAmount = round((40.5 + 8) * 100)/100 = round(48.5*100)/100 = 48.5
    const items = [
      { productId: 'p-a', quantity: 2 },
      { productId: 'p-b', quantity: 1 },
    ];

    orderRepo.findByIdIfIsProccesed.mockResolvedValueOnce(ok(null));
    inventoryRepo.findProductsById.mockResolvedValueOnce(ok([productA, productB]));
    inventoryRepo.checkAvailability.mockResolvedValueOnce(ok(true));

    // simulate tx results
    const createdOrder = {
      orderId: 'order-123',
      customerId: 'cust-1',
      status: OrderStatus.PENDING,
      totalAmount: 48.5,
      orderItem: [
        { productId: 'p-a', quantity: 2, unitPrice: 10.0, lineTotal: 20.0 },
        { productId: 'p-b', quantity: 1, unitPrice: 20.5, lineTotal: 20.5 },
      ],
      baseFee: 40.5,
      taxFee: 8,
    };

    const txObj = {
      id: 'tx-1',
      orderId: createdOrder.orderId,
      totalAmount: createdOrder.totalAmount,
      paymentStatus: TransactionStatus.PENDING,
      payerName: 'Buyer',
      baseFee: createdOrder.baseFee,
      taxFee: createdOrder.taxFee,
    };

    // configure callbacks inside runInTransaction: createOrder returns ok(createdOrder), createTransactionTx ok(txObj), upsert ok customer, reserveStockTx ok
    customerRepo.upsertByIdOrEmailTx.mockResolvedValueOnce(ok({ id: 'cust-1' }));
    orderRepo.createOrder.mockResolvedValueOnce(ok(createdOrder));
    transactionRepo.createTransactionTx.mockResolvedValueOnce(ok(txObj));
    inventoryRepo.reserveStockTx.mockResolvedValueOnce(ok(true));

    const res = await usecase.execute({
      orderItems: items as any,
      delivery: { name: 'Buyer', email: 'b@x.com', address: "", phone: ""  },
      orderId: 'order-123',
      customerId: 'cust-1',
    });

    expect(res.isOk).toBe(true);
    expect(res.isOk === true && res.value).toBeDefined();
    expect(res.isOk === true && res.value.orderId).toBe('order-123');
    expect(res.isOk === true && res.value.customerId).toBe('cust-1');
    expect(res.isOk === true && res.value.transaction).toBeDefined();

    // Verify that repos were called with expected shapes
    expect(inventoryRepo.findProductsById).toHaveBeenCalledWith(['p-a', 'p-b']);
    expect(inventoryRepo.checkAvailability).toHaveBeenCalled();
    expect(orderRepo.createOrder).toHaveBeenCalled();
    expect(transactionRepo.createTransactionTx).toHaveBeenCalled();
    expect(inventoryRepo.reserveStockTx).toHaveBeenCalledWith(
      expect.arrayContaining([
        { id: 'p-a', quantity: 2 },
        { id: 'p-b', quantity: 1 },
      ]),
      expect.any(Object),
    );
  });

  test('failure inside runInTransaction (e.g., createOrder returns err) results in generic order error', async () => {
    const items = [{ productId: 'p-a', quantity: 1 }];

    orderRepo.findByIdIfIsProccesed.mockResolvedValueOnce(ok(null));
    inventoryRepo.findProductsById.mockResolvedValueOnce(ok([productA]));
    inventoryRepo.checkAvailability.mockResolvedValueOnce(ok(true));

    // Simulate upsert ok, but createOrder fails
    customerRepo.upsertByIdOrEmailTx.mockResolvedValueOnce(ok({ id: 'cust-1' }));
    orderRepo.createOrder.mockResolvedValueOnce(err({ message: 'db create failed' }));

    const res = await usecase.execute({
      orderItems: items as any,
      delivery: { name: 'Buyer', email: 'b@x.com', address: "", phone: ""  },
    });

    expect(res.isOk).toBe(false);
    expect(res.isOk === false && res.error ).toBeDefined();
    expect((res.isOk === false && res.error as any).message).toMatch(/Order failed, try later/i);
  });

  test('reserveStockTx failing causes rollback and returns generic order error', async () => {
    const items = [{ productId: 'p-a', quantity: 1 }];

    orderRepo.findByIdIfIsProccesed.mockResolvedValueOnce(ok(null));
    inventoryRepo.findProductsById.mockResolvedValueOnce(ok([productA]));
    inventoryRepo.checkAvailability.mockResolvedValueOnce(ok(true));

    customerRepo.upsertByIdOrEmailTx.mockResolvedValueOnce(ok({ id: 'cust-1' }));
    orderRepo.createOrder.mockResolvedValueOnce(ok({
      orderId: 'order-1', baseFee: 10, taxFee: 2, totalAmount: 12, orderItem: [], customerId: 'cust-1'
    }));
    transactionRepo.createTransactionTx.mockResolvedValueOnce(ok({ id: 'tx-1' }));

    inventoryRepo.reserveStockTx.mockResolvedValueOnce(err({ message: 'reserve failed' }));

    const res = await usecase.execute({
      orderItems: items as any,
      delivery: { name: 'Buyer', email: 'b@x.com', address: "", phone: "" },
    });

    expect(res.isOk).toBe(false);
    expect((res.isOk === false && res.error as any).message).toMatch(/Order failed, try later/i);
  });
});
