import fs from 'fs/promises';
import path from 'path';
import mammoth from 'mammoth';
import { RULE_BOOK_DOC_FILENAME } from '@/lib/rule-book';

/**
 * Converts the rule book .docx from /public to HTML on the server (no Microsoft iframe).
 */
export async function getRuleBookHtml(): Promise<{ html: string; error?: string }> {
  try {
    const fullPath = path.join(process.cwd(), 'public', RULE_BOOK_DOC_FILENAME);
    const buffer = await fs.readFile(fullPath);
    const result = await mammoth.convertToHtml({ buffer });
    return { html: result.value };
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Could not load rule book.';
    return { html: '', error: message };
  }
}
