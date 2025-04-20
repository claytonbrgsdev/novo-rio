import { QueryClient } from '@tanstack/react-query';

// Provide defaultMutationOptions for react-query v5 in tests
;(QueryClient.prototype as any).defaultMutationOptions = function(options: any) {
  return options;
};
