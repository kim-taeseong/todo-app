import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Todo } from './todo.schema';

@Injectable()
export class TodoService {
  constructor(@InjectModel(Todo.name) private todoModel: Model<Todo>) {}

  async create(todo: Partial<Todo>): Promise<Todo> {
    const createdTodo = new this.todoModel(todo);
    return createdTodo.save();
  }

  async findAll(userId: string): Promise<Todo[]> {
    return this.todoModel.find({ user: userId }).exec();
  }

  async update(id: string, todo: Partial<Todo>): Promise<Todo> {
    return this.todoModel.findByIdAndUpdate(id, todo, { new: true }).exec();
  }

  async delete(id: string): Promise<Todo> {
    return this.todoModel.findByIdAndDelete(id).exec();
  }
}
