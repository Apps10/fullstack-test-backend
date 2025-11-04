interface PaymentProcessor {
  name: string;
}

interface PaymentMethod {
  name: string;
  payment_processors: PaymentProcessor[];
}

interface PresignedDocument {
  acceptance_token: string;
  permalink: string;
  type: string;
}

interface MerchantData {
  id: number;
  name: string;
  email: string;
  contact_name: string;
  phone_number: string;
  active: boolean;
  logo_url: string | null;
  legal_name: string;
  legal_id_type: string;
  legal_id: string;
  public_key: string;
  accepted_currencies: string[];
  fraud_javascript_key: string | null;
  fraud_groups: any[]; // Puedes definir una interfaz si sabes la estructura
  accepted_payment_methods: string[];
  payment_methods: PaymentMethod[];
  presigned_acceptance: PresignedDocument;
  presigned_personal_data_auth: PresignedDocument;
  click_to_pay_dpa_id: string | null;
  mcc: string | null;
  acquirer_id: string | null;
}

export interface MerchantResponse {
  data: MerchantData;
  meta: Record<string, unknown>;
}
