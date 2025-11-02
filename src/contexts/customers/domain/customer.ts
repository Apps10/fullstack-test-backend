export interface CustomerToApiJSON extends PrimitiveCustomer {}
export interface CustomerToJSON extends PrimitiveCustomer {}

export interface PrimitiveCustomer  {
  id: string
  name: string
  address: string
  email: string
  phone: string
}

export class Customer {
  public readonly id: string
  public readonly name: string
  public readonly address: string
  public readonly email: string
  public readonly phone: string
  
  constructor({
    id,
    name,
    address,
    email,
  }: PrimitiveCustomer){
    this.id = id
    this.name = name
    this.address = address
    this.email = email
  }


  toJson(): CustomerToJSON {
    return {
      id: this.id,
      address: this.address,
      email: this.email,
      name: this.name,
      phone: this.phone
    }
  }

  toApiJson(): CustomerToApiJSON {
    return {
      id: this.id,
      address: this.address,
      email: this.email,
      name: this.name,
      phone: this.phone
    }
  }
}