import { Module } from '@nestjs/common';
import { TodoController } from './todo.controller';
import { TodoService } from './todo.service';
import { MongooseModule } from '@nestjs/mongoose';
import { TodoSchema } from './todo.schema';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [TodoController],
  providers: [TodoService],
  imports: [
    MongooseModule.forFeature([{ name: 'Todo', schema: TodoSchema }]),
    AuthModule,
  ],
})
export class TodoModule {}
