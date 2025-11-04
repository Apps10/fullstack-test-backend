import { ok, err } from '../../../shared/models/result';
import { FindTransactionByIdUseCase } from './findTransactionById.useCase';

describe('FindTransactionByIdUseCase', () => {
  let transactionRepo: any;
  let usecase: FindTransactionByIdUseCase;

  beforeEach(() => {
    transactionRepo = {
      findById: jest.fn(),
    };

    usecase = new FindTransactionByIdUseCase(transactionRepo);
  });

  test('returns transaction when repository responds ok', async () => {
    const tx = {
      id: 'tx-1',
      orderId: 'order-1',
      totalAmount: 100,
      paymentStatus: 'SUCCESS',
    };

    transactionRepo.findById.mockResolvedValueOnce(ok(tx));

    const res = await usecase.execute('tx-1');

    expect(transactionRepo.findById).toHaveBeenCalledWith('tx-1');
    expect(res.isOk).toBe(true);
    expect(res.isOk === true && res.value).toEqual(tx);
  });

  test('propagates repository error when findById returns err', async () => {
    const repoError = { kind: 'transaction', message: 'not found', statusCode: 404 };
    transactionRepo.findById.mockResolvedValueOnce(err(repoError));

    const res = await usecase.execute('tx-unknown');

    expect(transactionRepo.findById).toHaveBeenCalledWith('tx-unknown');
    expect(res.isOk).toBe(false);
    expect(res.isOk === false && res.error).toEqual(repoError);
  });

  test('repository throwing unexpected exception causes the promise to reject', async () => {
    transactionRepo.findById.mockImplementationOnce(() => {
      throw new Error('unexpected failure');
    });

    await expect(usecase.execute('tx-error')).rejects.toThrow('unexpected failure');
    expect(transactionRepo.findById).toHaveBeenCalledWith('tx-error');
  });
});
