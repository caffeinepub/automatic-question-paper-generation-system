import { createRouter, createRoute, createRootRoute, RouterProvider, Outlet, redirect } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { Toaster } from '@/components/ui/sonner';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import QuestionBank from './pages/QuestionBank';
import AddQuestion from './pages/AddQuestion';
import GeneratePaper from './pages/GeneratePaper';
import PaperPreview from './pages/PaperPreview';
import GeneratedPapers from './pages/GeneratedPapers';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30000,
    },
  },
});

function RootComponent() {
  return (
    <>
      <Outlet />
      <Toaster />
    </>
  );
}

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

const rootRoute = createRootRoute({ component: RootComponent });

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: Login,
});

const layoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'layout',
  component: AuthGuardedLayout,
});

const dashboardRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/',
  component: Dashboard,
});

const questionBankRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/question-bank',
  component: QuestionBank,
});

const addQuestionRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/add-question',
  component: AddQuestion,
});

const generatePaperRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/generate-paper',
  component: GeneratePaper,
});

const paperPreviewRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/paper-preview/$paperId',
  component: PaperPreview,
});

const generatedPapersRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/generated-papers',
  component: GeneratedPapers,
});

const routeTree = rootRoute.addChildren([
  loginRoute,
  layoutRoute.addChildren([
    dashboardRoute,
    questionBankRoute,
    addQuestionRoute,
    generatePaperRoute,
    paperPreviewRoute,
    generatedPapersRoute,
  ]),
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
