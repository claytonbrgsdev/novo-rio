// Extensões dos tipos do Jest para TypeScript
import '@testing-library/jest-dom';

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toBeNull(): R;
      toHaveBeenCalled(): R;
      toHaveBeenCalledWith(...args: any[]): R;
    }
  }
}

// Extensão para expect
declare module 'expect' {
  interface AsymmetricMatchers {
    stringContaining(value: string): any;
    toHaveBeenCalledWith(...args: any[]): any;
  }
  
  interface Matchers<R> {
    toBeInTheDocument(): R;
    toBeNull(): R;
    toHaveBeenCalled(): R;
    toHaveBeenCalledWith(...args: any[]): R;
  }
}

// Para evitar erro de exportação vazia
export {};
