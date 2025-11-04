interface CardTokenData {
  id: string;
  created_at: string; // ISO 8601 timestamp
  brand: string;
  name: string;
  last_four: string;
  bin: string;
  exp_year: string;
  exp_month: string;
  card_holder: string;
  created_with_cvc: boolean;
  expires_at: string; // ISO 8601 timestamp
  validity_ends_at: string; // ISO 8601 timestamp
}

export interface CardTokenResponse {
  status: "CREATED";
  data: CardTokenData;
}
