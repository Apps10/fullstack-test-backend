const PRODUCT_MESSAGES = {
  ProductNotFound: 'Product Not Found',
  ProductWithoutStock: 'Product Without Stock',
  ProductsWithoutStockOrNotExist: 'Some products do not exist or are out of stock',
} as const;

type ProductMessageErrorType = typeof PRODUCT_MESSAGES[keyof typeof PRODUCT_MESSAGES];

export type InventoryError = {
  kind: 'inventory';
  message: ProductMessageErrorType | string;
  statusCode?: number;
};


export const ProductNotFoundError = (messageError?: string): InventoryError=> ({
  kind: 'inventory',
  message: messageError ?? PRODUCT_MESSAGES.ProductNotFound, 
  statusCode: 404,
})



export const ProductWithoutStockError = (messageError?: string): InventoryError=> ({
  kind: 'inventory',
  message: messageError ?? PRODUCT_MESSAGES.ProductWithoutStock, 
  statusCode: 400,
})



export const ProductsWithoutStockOrNotExistError = (messageError?: string): InventoryError=> ({
  kind: 'inventory',
  message: messageError ?? PRODUCT_MESSAGES.ProductsWithoutStockOrNotExist, 
  statusCode: 404,
})

