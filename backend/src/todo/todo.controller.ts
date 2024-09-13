import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { TodoService } from './todo.service';
import { Todo } from './todo.schema';
import { JwtAuthGuard } from '../auth/auth.guard';

@Controller('todos')
@UseGuards(JwtAuthGuard)
export class TodoController {
  constructor(private readonly todoService: TodoService) {}

  @Post()
  create(@Request() req, @Body() todo: Partial<Todo>) {
    return this.todoService.create({ ...todo, user: req.user.sub });
  }

  @Get()
  findAll(@Request() req) {
    return this.todoService.findAll(req.user.sub);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() todo: Partial<Todo>) {
    return this.todoService.update(id, todo);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.todoService.delete(id);
  }
}
