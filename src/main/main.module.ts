import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { ReviewsModule } from './reviews/reviews.module';
import { BagTypeModule } from './bag-type/bag-type.module';
import { BillingsModule } from './billings/billings.module';
import { ContactModule } from './contact/contact.module';

@Module({
  imports: [AuthModule, ProductsModule, ReviewsModule, BagTypeModule, BillingsModule, ContactModule]
})
export class MainModule {}
