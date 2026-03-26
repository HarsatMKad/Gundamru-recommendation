import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductDto } from './dto/product.dto';
import { Product } from './entities/product.entity';
import { PARAMS } from 'src/common/util/request-param-handler.util';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  create(@Body() ProductDto: ProductDto): Promise<Product> {
    return this.productsService.create(ProductDto);
  }

  @Get()
  findAll(): Promise<Product[]> {
    return this.productsService.findAll();
  }

  @Get(`:${PARAMS.ID}`)
  findOne(@Param(PARAMS.ID, ParseIntPipe) id: string): Promise<Product> {
    return this.productsService.findOne(id);
  }

  @Patch(`:${PARAMS.ID}`)
  update(
    @Param(PARAMS.ID, ParseIntPipe) id: string,
    @Body() ProductDto: ProductDto,
  ): Promise<Product> {
    return this.productsService.update(id, ProductDto);
  }

  @Delete(`:${PARAMS.ID}`)
  remove(@Param(PARAMS.ID, ParseIntPipe) id: string): Promise<void> {
    return this.productsService.remove(id);
  }
}
