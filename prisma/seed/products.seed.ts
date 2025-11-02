import { Logger } from '@nestjs/common';

import { PrismaClient } from '../../generated/prisma/client';
import { PrimitiveProduct } from '../../src/contexts/inventory/domain/product';

const prisma = new PrismaClient();
const logger = new Logger(`Products-seeder`);

const products: PrimitiveProduct[] = [
  {
    id: 1,
    name: 'Laptop Gamer',
    description: 'Laptop de alto rendimiento con tarjeta gráfica dedicada.',
    picture:
      'https://www.asus.com/media/Odin/Websites/global/ProductLine/20200824120814.jpg',
    stock: 15,
    price: 1200999,
    weightInGrams: 980,
  },
  {
    id: 2,
    name: 'Mouse Inalámbrico',
    description: 'Mouse ergonómico con conectividad Bluetooth.',
    picture:
      'https://www.quorumsystem.com.co/wp-content/uploads/2024/07/mouse-inalambrico-1000-dpi.jpg',
    stock: 50,
    price: 20999,
    weightInGrams: 60,
  },
  {
    id: 3,
    name: 'Teclado Mecánico',
    description: 'Teclado con switches mecánicos y retroiluminación RGB.',
    picture:
      'https://lexatecnologia.com/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsiZGF0YSI6NjU4NTEsInB1ciI6ImJsb2JfaWQifX0=--5b4f2d102bba9a8a5553c599968f1a9fc5c89d56/eyJfcmFpbHMiOnsiZGF0YSI6eyJmb3JtYXQiOiJwbmciLCJyZXNpemVfdG9fZml0IjpbODAwLDgwMF19LCJwdXIiOiJ2YXJpYXRpb24ifX0=--cef66509c9cdc75663c0eefd9421db1d2ea4fead/5.png',
    stock: 30,
    price: 89990,
    weightInGrams: 200,
  },
  {
    id: 4,
    name: 'Auriculares Over-Ear',
    description: 'Auriculares con cancelación de ruido y sonido Hi-Fi.',
    picture:
      'https://nitrosystems.com.co/wp-content/uploads/2024/08/567567567-scaled.jpg',
    stock: 20,
    price: 150490,
    weightInGrams: 200,
  },
  {
    id: 5,
    name: 'Monitor 4K',
    description: 'Monitor Ultra HD de 27 pulgadas con tecnología IPS.',
    picture:
      'https://monitores.com.co/wp-content/uploads/2022/05/Monitor-Samsung-UHD-HDR-27-Inicio-I-monitores.com_.co_.jpg',
    stock: 10,
    price: 340999,
    weightInGrams: 1700,
  },
  {
    id: 6,
    name: 'Smartphone 5G',
    description: 'Smartphone con pantalla AMOLED y cámara de 108 MP.',
    picture:
      'https://www.gearbest.ma/wp-content/uploads/2023/12/Blackview-A200-Pro-Unlocked-Smartphone-G99-12GB-256GB-Android-13-Phone-6-67-120HZ-AMOLED-Display.jpg_640x640-13.webp',
    stock: 40,
    price: 90000,
    weightInGrams: 670,
  },
  {
    id: 7,
    name: 'Bocina Bluetooth',
    description:
      'Bocina portátil con sonido estéreo y batería de larga duración.',
    picture:
      'https://exitocol.vtexassets.com/arquivos/ids/15300773/parlante-portatil-bocina-1hora-boc060-bluetooth-estereo-fm.jpg?v=638029388318670000',
    stock: 25,
    price: 59990,
    weightInGrams: 1700,
  },
  {
    id: 8,
    name: 'Disco Duro Externo',
    description: 'Disco duro portátil de 2TB con conexión USB 3.0.',
    picture:
      'https://symcomputadores.com/wp-content/uploads/2022/09/Externo-HDD-4TB.png',
    stock: 35,
    price: 79990,
    weightInGrams: 250,
  },
  {
    id: 9,
    name: 'Cámara Web Full HD',
    description: 'Cámara web de alta definición con micrófono incorporado.',
    picture:
      'https://resource.logitech.com/w_692,c_lpad,ar_4:3,q_auto,f_auto,dpr_1.0/d_transparent.gif/content/dam/logitech/en/products/webcams/c922/gallery/c922-gallery-1.png?v=1',
    stock: 60,
    price: 39990,
    weightInGrams: 345,
  },
  {
    id: 10,
    name: 'Smartwatch Deportivo',
    description: 'Reloj inteligente con monitoreo de actividad física y GPS.',
    picture:
      'https://tienvir.co/cdn/shop/files/Smarwacubittnegro.jpg?v=1710192872&width=600',
    stock: 50,
    price: 149990,
    weightInGrams: 100,
  },
  {
    id: 11,
    name: 'Tablet 10 pulgadas',
    description:
      'Tablet Android con pantalla de 10 pulgadas y 64GB de almacenamiento.',
    picture:
      'https://co.tiendasishop.com/cdn/shop/files/IMG-11087963.jpg?v=1723512028&width=823',
    stock: 20,
    price: 199990,
    weightInGrams: 1150,
  },
  {
    id: 12,
    name: 'Silla Ergonómica',
    description: 'Silla de oficina ergonómica con soporte lumbar ajustable.',
    picture:
      'https://www.sillasparaoficina.top/wp-content/uploads/2019/08/ERGOMESH-PREMIUM-PRESIDENTE4.jpg',
    stock: 15,
    price: 219990,
    weightInGrams: 5000,
  },
  {
    id: 13,
    name: 'Proyector Full HD',
    description:
      'Proyector portátil Full HD con conectividad WiFi y Bluetooth.',
    picture:
      'https://image.benq.com/is/image/benqco/01-mh733-front30?$ResponsivePreset$&fmt=png-alpha',
    stock: 10,
    price: 349990,
    weightInGrams: 5000,
  },
  {
    id: 14,
    name: 'Cargador Inalámbrico',
    description: 'Cargador inalámbrico rápido para dispositivos compatibles.',
    picture:
      'https://http2.mlstatic.com/D_NQ_NP_807622-MCO49630563353_042022-O.webp',
    stock: 75,
    price: 19990,
    weightInGrams: 1200,
  },
  {
    id: 15,
    name: 'Ventilador de Torre',
    description:
      'Ventilador de torre silencioso con control remoto y 3 velocidades.',
    picture:
      'https://www.kalley.com.co/medias/7701023638081-001-750Wx750H?context=bWFzdGVyfGltYWdlc3w0OTQ0MnxpbWFnZS9qcGVnfGFXMWhaMlZ6TDJnek5pOW9Zek12TVRBNU9EWTRNRGczTnpBMU9UQXVhbkJufDBhZTI5NzUxYjcyMTczOTZjZWNjZDgwOTlmNWY2Y2YzNDYzMWU4NmU3YTlmNzk1YmY0YzA4OTM1YjY0NWZjMWE',
    stock: 30,
    price: 59990,
    weightInGrams: 2200,
  },
];

async function main() {
  logger.log('check if Already Exist...');

  const findProduct = await prisma.product.findFirst();
  if (findProduct) {
    logger.log('seeder had been execute...');
    return;
  }

  logger.log('Seeding...');

  /// --------- Products ---------------
  for (let i = 0; i <= products.length - 1; i++) {
    const product = products[i];
    logger.log(`product ${product.name} saved...`);
    await prisma.product.create({
      data: products[i],
    });
  }
}

main()
  .catch((e) => [logger.error(e), console.log(e)])
  .finally(async () => {
    await prisma.$disconnect();
  });
