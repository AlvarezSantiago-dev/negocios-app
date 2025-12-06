import { faker } from "@faker-js/faker";
import dbConnect from "../utils/dbConnectMongoose.js";
import environment from "../utils/env.util.js";
import productsRepository from "../repositories/products.rep.js";

async function createData() {
  try {
    await dbConnect();

    for (let i = 0; i < 40; i++) {
      const product = {
        title: faker.commerce.productName(),
        photo: faker.image.urlPicsumPhotos({ width: 400, height: 400 }),
        category: "done",
        price: faker.commerce.price({ min: 100, max: 200, dec: 0 }),
        stock: faker.number.int({ min: 1, max: 15 }),
        quantity: faker.number.int({ min: 1, max: 10 }),
      };

      await productsRepository.createRepository(product);
      console.log(`✅ Product ${i + 1} created`);
    }

    console.log("🎉 40 products created successfully!");
  } catch (error) {
    console.error("❌ Error creating products:", error);
  }
}

createData();
