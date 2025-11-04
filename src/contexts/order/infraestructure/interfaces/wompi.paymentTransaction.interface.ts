interface PaymentMethodExtra {
  bin: string;
  name: string;
  brand: string;
  card_type: string;
  last_four: string;
  card_holder: string;
  is_three_ds: boolean;
  three_ds_auth_type: string | null;
}

interface PaymentMethod {
  type: string;
  extra: PaymentMethodExtra;
  installments: number;
}

interface TransactionData {
  id: string;
  created_at: string; // ISO 8601 timestamp
  finalized_at: string | null;
  amount_in_cents: number;
  reference: string;
  customer_email: string;
  currency: string;
  payment_method_type: string;
  payment_method: PaymentMethod;
  status: string;
  status_message: string | null;
  billing_data: any; // Puedes definir una interfaz si conoces la estructura
  shipping_address: any;
  redirect_url: string | null;
  payment_source_id: number;
  payment_link_id: string | null;
  customer_data: any;
  bill_id: string | null;
  taxes: any[]; // Puedes definir una interfaz si hay estructura conocida
  tip_in_cents: number | null;
}

export interface PaymentTransactionResponse {
  data: TransactionData;
  meta: Record<string, unknown>;
}
