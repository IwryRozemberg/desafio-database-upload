import path from 'path';
import fs from 'fs';
import csvParse from 'csv-parse';

import Transaction from '../models/Transaction';
import AppError from '../errors/AppError';

import uploadCsvConfig from '../config/uploadCsv';
import CreateTransactionService from './CreateTransactionService';

interface CsvColumns {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class ImportTransactionsService {
  async execute(filename: string): Promise<Transaction[]> {
    const transactionsCsv: CsvColumns[] = await this.getCsvData(filename);

    const createTransactionService = new CreateTransactionService();
    const transactions = Promise.all(
      transactionsCsv.map(async tsx => {
        const transaction = await createTransactionService.execute({
          title: tsx.title,
          type: tsx.type,
          categoryTitle: tsx.category,
          value: tsx.value,
        });
        return transaction;
      }),
    );

    return transactions;
  }

  private async getCsvData(filename: string): Promise<CsvColumns[]> {
    const file = path.join(uploadCsvConfig.defaultPath, filename);
    await fs.promises.stat(file).catch(() => {
      throw new AppError('Arquivo de importação não encontrado');
    });

    const transactionsCsv: CsvColumns[] = [];

    const end = new Promise((resolve, reject) => {
      fs.createReadStream(file)
        .on('error', reject)
        .pipe(
          csvParse({
            from_line: 2,
            trim: true,
            columns: ['title', 'type', 'value', 'category'],
            // delimiter: ';',
            // skip_empty_lines: true,
            cast: (value, context) => {
              if (context.index === 2) {
                return parseFloat(
                  value.replace('.', '').replace(',', '.').replace(' ', ''),
                );
              }
              return value;
            },
          }),
        )
        .on('data', async (chuck: CsvColumns) => {
          transactionsCsv.push(chuck);
        })
        .on('end', async () => {
          resolve(await fs.promises.unlink(file));
        });
    });

    return (async (): Promise<CsvColumns[]> => {
      await end;
      return transactionsCsv;
    })();
  }
}

export default ImportTransactionsService;
