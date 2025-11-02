export interface PrimitiveProduct{
  id?: number,
  name: string,
  description: string,
  picture: string,
  stock: number,
  price: number,
  weightInGrams: number
}

export interface ICheckProductStock extends Pick<PrimitiveProduct, 'id' >{
  quantity: number
}

export class Product {
  public readonly id: number
  public readonly name: string
  public readonly description: string
  public readonly picture: string
  public readonly stock: number
  public readonly price: number
  public readonly weightInGrams: number

  constructor({
    id,
    name,
    description,
    picture,
    price,
    stock,
    weightInGrams
  }: PrimitiveProduct){
    this.id = id
    this.description = description
    this.name = name
    this.picture = picture
    this.price = price
    this.stock = stock
    this.weightInGrams = weightInGrams
  }

  toApiJson(){
    return {
      id : this.id,
      description : this.description,
      name : this.name,
      picture : this.picture,
      price : this.price,
      stock : this.stock,
      weightInGrams: this.weightInGrams
    }
  }
}