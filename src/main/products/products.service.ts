import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { DbService } from 'src/db/db.service';
import { BulkImgUploadDto, CreateProductDto, UpdateProductDto } from './product.dto';
import { UploadService } from 'src/lib/upload/upload.service';
import { FileInstance, Product } from '@prisma/client';
import { PaginationDto } from 'src/common/pagination.dto';

@Injectable()
export class ProductsService {
    constructor(
        private readonly db: DbService,
        private readonly upload: UploadService,
    ) { }

    private async isExists(id: string) {
        const product = await this.db.product.findUnique({
            where: {
                id
            },
            include: {
                primaryImg: true
            }
        })

        if (!product) throw new HttpException(`Product with id ${id} does not exist`, HttpStatus.NOT_FOUND)

        return product
    }

    private isArrayOrThrow(data: any): string[] {
        if (!Array.isArray(data) && typeof data === "string") return data.split(",")
        if (Array.isArray(data)) return data
        throw new HttpException("Invalid data type for array", HttpStatus.BAD_REQUEST)
    }

    private async deleteAndUploadImg(file: Express.Multer.File, prevFileId?: string) {

        if (prevFileId) {
            await this.upload.deleteFile(prevFileId)
        }
        const newFile = await this.upload.uploadFile({
            file,
        })
        return newFile
    }

    public async createProduct({
        data,
        img
    }: {
        data: CreateProductDto,
        img: Express.Multer.File
    }) {
        const imgInstance = await this.upload.uploadFile({
            file: img
        })
        const product = await this.db.product.create({
            data: {
                name: data.name,
                description: data.description,
                price: typeof data.price === "number" ? data.price : parseInt(data.price),
                quantity: typeof data.quantity === "number" ? data.quantity : parseInt(data.quantity),
                tag: this.isArrayOrThrow(data.tag),
                color: this.isArrayOrThrow(data.color),
                primaryImg: {
                    connect: {
                        id: imgInstance.id
                    }
                },
            },
            include: {
                primaryImg: {
                    select: {
                        fileUrl: true
                    }
                }
            }
        })

        return {
            product,
            success: true,
            message: "Product created successfully"
        }
    }

    public async updateAllProduct({
        product,
        file
    }: {
        product: UpdateProductDto,
        file: Express.Multer.File
    }) {
        const {
            id,
            ...rest
        } = product
        const isExisting = await this.isExists(product.id)
        let fileInstance: FileInstance | undefined
        if (file) {
            fileInstance = await this.deleteAndUploadImg(file, isExisting.primaryImg?.fileId)
        }
        const updatedProduct = await this.db.product.update({
            where: {
                id
            },
            data: {
                ...rest,
                primaryImg: fileInstance ? {
                    connect: {
                        id: fileInstance.id
                    }
                } : undefined
            },
            include: {
                primaryImg: {
                    select: {
                        fileUrl: true
                    }
                }
            }
        })

        return updatedProduct
    }
    public async bulkImageUpload({ product, img }: {
        product: BulkImgUploadDto,
        img: Express.Multer.File[]
    }) {
        const files = await Promise.all(img.map(async (e) => {
            const { bucket, fileUrl, fileId } = await this.upload.uploadFile({ file: e });
            return { bucket, fileUrl, fileId };
        }));

        const updatedProduct = await this.db.product.update({
            where: { id: product.id },
            data: {
                showcaseImage: {
                    create: {
                        file: {
                            createMany: {
                                data: files,
                            },
                        },
                    },
                },
            },
            include:{
                showcaseImage: {
                    select: {
                        file: {
                            select: {
                                fileUrl: true
                            }
                        }
                    }
                }
            }
        });

        return {
            product: updatedProduct,
            success: true,
            message: "Bulk Image upload successfully"
        };
    }

    public async getAllProduct({
        skip,
        take
    }:PaginationDto){
        const products = await this.db.product.findMany({
            include: {
                primaryImg: {
                    select: {
                        fileUrl: true
                    }
                }
            },
            skip: skip? (typeof skip === "string"? parseInt(skip): skip) : 0,
            take: take ? (typeof take === "string"? parseInt(take): take) : 10
        })

        return products
    }

}
