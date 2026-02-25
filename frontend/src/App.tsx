import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider, createRouter, createRoute, createRootRoute, Outlet, redirect } from '@tanstack/react-router';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import QuestionBank from './pages/QuestionBank';
import AddQuestion from './pages/AddQuestion';
import GeneratePaper from './pages/GeneratePaper';
import GeneratedPapers from './pages/GeneratedPapers';
import PaperPreview from './pages/PaperPreview';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30000,
    },
  },
});

function AuthGuardedLayout() {
  const { identity } = useInternetIdentity();
  if (!identity) {
    return <Login />;
  }
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

const rootRoute = createRootRoute({
  component: AuthGuardedLayout,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: Login,
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Dashboard,
});

const questionBankRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/question-bank',
  component: QuestionBank,
});

const addQuestionRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/add-question',
  component: AddQuestion,
});

const generatePaperRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/generate-paper',
  component: GeneratePaper,
});

const generatedPapersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/generated-papers',
  component: GeneratedPapers,
});

const paperPreviewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/paper-preview',
  component: PaperPreview,
});

const routeTree = rootRoute.addChildren([
  loginRoute,
  dashboardRoute,
  questionBankRoute,
  addQuestionRoute,
  generatePaperRoute,
  generatedPapersRoute,
  paperPreviewRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}
