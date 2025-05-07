# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## To-Do
- [x] Setup React + Vite with HMR and ESLint
- [x] Integrate React Query and Axios for API calls
- [x] Implement `TerrainList`, `RankingBoard` components and hooks (`useInfiniteTerrains`, `usePlayers`)
- [x] Create and fix unit tests for core hooks and components (Vitest, RTL)
- [x] Add `useTerrainActions` hook and its tests
- [x] Write unit tests for `TerrainDetail` component
- [x] Implement Agents list UI in `TerrainDetail`
- [ ] Add styling and improve component UX
- [ ] Configure CI pipeline (Vitest, ESLint)
- [ ] Add end-to-end tests
- [ ] Prepare production build and deployment configuration
