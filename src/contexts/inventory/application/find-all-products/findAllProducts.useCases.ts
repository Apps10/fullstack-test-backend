import { ok, err } from '../../../shared/models/result';
import { FindAllProductsUseCase } from './find-all-products-use-case';

describe('FindAllProductsUseCase', () => {
  let inventoryRepo: any;
  let usecase: FindAllProductsUseCase;

  beforeEach(() => {
    inventoryRepo = {
      getAllProductsInStock: jest.fn(),
    };

    usecase = new FindAllProductsUseCase(inventoryRepo);
  });

  test('returns products when repository responds ok', async () => {
    const products = [
      { id: 'p-1', name: 'Prod 1', price: 10, stock: 5 },
      { id: 'p-2', name: 'Prod 2', price: 20, stock: 3 },
    ];
    inventoryRepo.getAllProductsInStock.mockResolvedValueOnce(ok(products));

    const res = await usecase.execute({} as any);

    expect(inventoryRepo.getAllProductsInStock).toHaveBeenCalledTimes(1);
    expect(res.isOk).toBe(true);
    expect(res.isOk === true && res.value).toEqual(products);
  });

  test('returns empty array when repository returns ok([])', async () => {
    inventoryRepo.getAllProductsInStock.mockResolvedValueOnce(ok([]));

    const res = await usecase.execute({} as any);

    expect(inventoryRepo.getAllProductsInStock).toHaveBeenCalledTimes(1);
    expect(res.isOk).toBe(true);
    expect(Array.isArray(res.isOk === true && res.value)).toBe(true);
    expect(res.isOk === true && res.value).toHaveLength(0);
  });

  test('propagates repository error when getAllProductsInStock returns err', async () => {
    const repoError = { kind: 'inventory', message: 'db error', statusCode: 500 };
    inventoryRepo.getAllProductsInStock.mockResolvedValueOnce(err(repoError));

    const res = await usecase.execute({} as any);

    expect(inventoryRepo.getAllProductsInStock).toHaveBeenCalledTimes(1);
    expect(res.isOk).toBe(false);
    expect(res.isOk === false && res.error).toEqual(repoError);
  });

  test('handles repository throwing an unexpected exception by propagating a rejection', async () => {
    // Si el repositorio lanza excepción en lugar de devolver err/ok,
    // esperamos que la promesa rechace — la implementación actual no captura excepciones internas,
    // así que esta prueba documenta ese comportamiento.
    inventoryRepo.getAllProductsInStock.mockImplementationOnce(() => {
      throw new Error('unexpected');
    });

    await expect(usecase.execute({} as any)).rejects.toThrow('unexpected');
    expect(inventoryRepo.getAllProductsInStock).toHaveBeenCalledTimes(1);
  });
});
