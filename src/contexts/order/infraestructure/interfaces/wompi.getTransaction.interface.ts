interface ThreeDSAuth {
  current_step: string;
  current_step_status: string;
}

interface PaymentMethodExtra {
  name: string;
  brand: string;
  card_type: string;
  last_four: string;
  is_three_ds: boolean;
  three_ds_auth: ThreeDSAuth;
  three_ds_auth_type: string | null;
  external_identifier: string;
  processor_response_code: string;
}

interface PaymentMethod {
  type: string;
  extra: PaymentMethodExtra;
  installments: number;
}

interface Merchant {
  id: number;
  name: string;
  legal_name: string;
  contact_name: string;
  phone_number: string;
  logo_url: string | null;
  legal_id_type: string;
  email: string;
  legal_id: string;
  public_key: string;
}

interface TransactionData {
  id: string;
  created_at: string;
  finalized_at: string;
  amount_in_cents: number;
  reference: string;
  currency: string;
  payment_method_type: string;
  payment_method: PaymentMethod;
  payment_link_id: string | null;
  redirect_url: string | null;
  status: 'APPROVED' | 'DENIED';
  status_message: string | null;
  merchant: Merchant;
  taxes: any[]; // Define si tienes estructura
  tip_in_cents: number | null;
}

export interface GetTransactionResponse {
  data: TransactionData;
  meta: Record<string, unknown>;
}
