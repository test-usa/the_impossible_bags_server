import { ApiProperty } from '@nestjs/swagger';
import { createZodDto } from 'nestjs-zod';
import { CreateProductSchema, UpdateProductSchema } from 'src/interfaces/product.interface';
import { z } from 'zod';

export class CreateProductDto extends createZodDto(CreateProductSchema) {
  @ApiProperty({ description: 'Product name', example: 'Modern Chair' })
  name: string;

  @ApiProperty({
    description: 'Product description',
    example: 'A stylish and comfortable modern chair',
    required: false,
  })
  description: string;

  @ApiProperty({ description: 'Product price', example: 199.99, })
  price: number;

  @ApiProperty({ description: 'Available quantity', example: 50,  })
  quantity: number;

  @ApiProperty({ description: 'Product tags', example: ['furniture', 'modern', 'chair'] })
  tag: string[];

  @ApiProperty({ description: 'Color variants', example: ['red', 'green', 'blue'] })
  color: string[];

  @ApiProperty({ 
    type: 'string', 
    format: 'binary', 
    description: 'Profile picture file upload' 
  })
  primaryImg: Express.Multer.File;  
}

export class UpdateProductDto extends createZodDto(UpdateProductSchema) {
    @ApiProperty({
      example: '550e8400-e29b-41d4-a716-446655440000',
      description: 'Unique identifier for the product',
    })
    id: string;
  
    @ApiProperty({
      example: 'Gaming Laptop',
      description: 'Updated name of the product',
      required: false,
    })
    name?: string;
  
    @ApiProperty({
      example: 'A powerful gaming laptop with the latest GPU.',
      description: 'Updated description of the product',
      required: false,
    })
    description?: string;
  
    @ApiProperty({
      example: 1200,
      description: 'Updated price of the product',
      required: false,
    })
    price?: number;
  
    @ApiProperty({
      example: 5,
      description: 'Updated stock quantity',
      required: false,
    })
    quantity?: number;
  
    @ApiProperty({
      example: 'https://example.com/new-image.jpg',
      description: 'Updated primary product image URL',
      required: false,
    })
    primaryImg?: string;
  
    @ApiProperty({
      example: ['Electronics', 'Gaming'],
      description: 'Updated tags associated with the product',
      required: false,
    })
    tag?: string[];
  
    @ApiProperty({
      type: 'string',
      format: 'binary',
      description: 'New product image file upload',
      required: false,
    })
    img?: Express.Multer.File;
  }

  export class BulkImgUploadDto extends createZodDto(z.object({
    id: z.string().uuid(),
    img: z.array(z.object({
      fieldname: z.string(),
      originalname: z.string(),
      encoding: z.string(),
      mimetype: z.string(),
      buffer: z.instanceof(Buffer), // Ensures file content is a Buffer
      size: z.number().max(5 * 1024 * 1024, "File size must be under 5MB"), // File size limit (optional)
    }))
  })){
    @ApiProperty({
      example: "550e8400-e29b-41d4-a716-446655440000", // Corrected example
      description: "A UUID representing the unique identifier",
    })
    id: string

    @ApiProperty({
      type: 'string',
      format: 'binary',
      description: 'New product image file upload',
      isArray: true
    })
    img: Express.Multer.File[];
  }
