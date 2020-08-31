import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const response = await this.createQueryBuilder()
      .select('sum(value)', 'value')
      .addSelect('type')
      .addGroupBy('type')
      .getRawMany();

    const balance: Balance = response.reduce(
      (acc, value) => {
        if (value.type === 'income') {
          acc.income += parseFloat(value.value);
        } else {
          acc.outcome += parseFloat(value.value);
        }
        return acc;
      },
      {
        income: 0,
        outcome: 0,
      },
    );

    balance.total = balance.income - balance.outcome;

    return balance;
  }
}

export default TransactionsRepository;
