// Este arquivo ajuda com os imports e setup global para testes
import '@testing-library/jest-dom';

// Para configurações globais de testes, podemos adicionar aqui
// Por exemplo, mock global do fetch, etc.

// Silencia warnings do React 18
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: any[]) => {
    if (
      /Warning: ReactDOM.render is no longer supported in React 18/.test(args[0]) ||
      /Warning: The current testing environment is not configured to support act/.test(args[0])
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});
