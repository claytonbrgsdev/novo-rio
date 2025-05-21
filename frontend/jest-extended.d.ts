import '@testing-library/jest-dom';

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toBeVisible(): R;
      toBeNull(): R;
      toHaveAttribute(attr: string, value?: string): R;
      toHaveClass(className: string): R;
      toHaveTextContent(text: string | RegExp): R;
      toHaveBeenCalled(): R;
      toHaveBeenCalledWith(...args: any[]): R;
    }
  }
}

// Necessário para que este arquivo seja tratado como um módulo
export {};
