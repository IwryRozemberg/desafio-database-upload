// import AppError from '../errors/AppError';

import { getCustomRepository } from 'typeorm';

import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateCategoryService from './CreateCategoryService';

interface TransactionRequest {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  categoryTitle: string;
}
class CreateTransactionService {
  public async execute({
    title,
    type,
    categoryTitle,
    value,
  }: TransactionRequest): Promise<Transaction> {
    const createCategoryService = new CreateCategoryService();
    const category = await createCategoryService.execute({
      title: categoryTitle,
    });

    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const transaction = transactionsRepository.create({
      title,
      type,
      value,
      category,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
