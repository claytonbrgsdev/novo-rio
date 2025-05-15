import '@testing-library/jest-dom';

interface CustomMatchers<R = unknown> {
  toBeInTheDocument(): R;
  toBeNull(): R;
  toHaveBeenCalled(): R;
  toHaveBeenCalledWith(...args: any[]): R;
  // Add other matchers as needed
}

declare global {
  namespace jest {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface Matchers<R> extends CustomMatchers<R> {}
  }
}

// Estendendo o expect global do Jest
declare global {
  namespace jest {
    interface Expect extends CustomMatchers {
      stringContaining(value: string): any;
    }
  }
  
  // Adicionando os métodos ao expect global
  interface ExpectStatic {
    stringContaining(value: string): any;
  }
}

// Necessário para que o arquivo seja tratado como um módulo e não apenas como uma declaração ambient
export {};
