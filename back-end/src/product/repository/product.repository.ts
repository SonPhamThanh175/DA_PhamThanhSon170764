import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateProductDto } from '../dto/createProduct.dto';
import { Product } from '../schema/product.shema';
import { ObjectId } from 'mongodb';

@Injectable()
export class ProductRepository {
  constructor(
    @InjectModel(Product.name)
    private productModel: Model<Product>,
  ) {}

  async getAll() {
    return await this.productModel.find();
  }

  async findAllAndSort(sortOrder: string) {
    console.log('sortOrder in repo: ' + sortOrder);
    if (sortOrder === 'asc') {
      return await this.productModel.find().sort({ salePrice: 'asc' });
    }
    return await this.productModel.find().sort({ salePrice: 'desc' });
  }

  async getProductByTypeId(typeId: string) {
    return await this.productModel.find({ typeId: typeId });
  }

  async getProductsByCategoryId(categoryId: string) {
    return await this.productModel.aggregate([
      {
        $lookup: {
          from: 'types',
          localField: 'categoryIdString',
          foreignField: 'categoyrId',
          as: 'type',
        },
      },
    ]);
  }

  async create(createProductDto: CreateProductDto) {
    const createdProduct = new this.productModel(createProductDto);
    return createdProduct.save();
  }
}
