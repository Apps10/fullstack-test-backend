export interface CheckOutDto {
  transactionId: string
  emailHolder: string,
  customerId: string,
  creditCard: string
}


export interface DecryptedCreditCard {
  cardName:string,
  cardNumber:string,
  cvv:string,
  expDate:string
}