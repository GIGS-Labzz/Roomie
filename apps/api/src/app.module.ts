import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';

import { AuthModule } from './auth/auth.module';
import { ProfilesModule } from './profiles/profiles.module';
import { ConnectionsModule } from './connections/connections.module';
import { MessagesModule } from './messages/messages.module';
import { PaymentsModule } from './payments/payments.module';
import { AgreementsModule } from './agreements/agreements.module';
import { PostsModule } from './posts/posts.module';
import { HousingModule } from './housing/housing.module';
import { SplitsModule } from './splits/splits.module';
import { NotificationsModule } from './notifications/notifications.module';
import { StorageModule } from './storage/storage.module';
import { AdminModule } from './admin/admin.module';
import { WaitlistModule } from './waitlist/waitlist.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    ProfilesModule,
    ConnectionsModule,
    MessagesModule,
    PaymentsModule,
    AgreementsModule,
    PostsModule,
    HousingModule,
    SplitsModule,
    NotificationsModule,
    StorageModule,
    AdminModule,
    WaitlistModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}

