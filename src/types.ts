import type { IconifyInfo } from '@iconify/types' with { 'resolution-mode': 'import' };

export interface IconSetOptions {
  sourceDir: string;
  targetFile: string;
  prefix: string;
  expectedSize?: number | {
    width: number;
    height: number;
  };
  iconSetInfo: IconifyInfo;
  skipSizeValidation?: boolean;
  debug?: boolean;
}
