// Estender o Jest global para testes
import '@testing-library/jest-dom';

declare global {
  namespace jest {
    interface Expect {
      toBeInTheDocument: () => void;
      toBeVisible: () => void;
      toHaveAttribute: (attr: string, value?: string) => void;
      toHaveTextContent: (text: string | RegExp) => void;
      toHaveClass: (className: string) => void;
      toHaveStyle: (style: Record<string, any>) => void;
      toHaveValue: (value: string | string[] | number) => void;
    }
  }
}
