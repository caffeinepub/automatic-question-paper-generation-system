import { createRouter, RouterProvider, createRoute, createRootRoute, redirect } from '@tanstack/react-router';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AddQuestion from './pages/AddQuestion';
import QuestionBank from './pages/QuestionBank';
import GeneratePaper from './pages/GeneratePaper';
import PaperPreview from './pages/PaperPreview';
import GeneratedPapers from './pages/GeneratedPapers';
import Layout from './components/Layout';

function RootComponent() {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();
  
  if (!isAuthenticated) {
    return <Login />;
  }
  
  return <Layout />;
}

// Create root route
const rootRoute = createRootRoute({
  component: RootComponent
});

// Create all routes
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

const addQuestionRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/add-question',
  component: AddQuestion,
});

const questionBankRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/question-bank',
  component: QuestionBank,
});

const generatePaperRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/generate-paper',
  component: GeneratePaper,
});

const paperPreviewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/paper-preview/$id',
  component: PaperPreview,
});

const generatedPapersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/generated-papers',
  component: GeneratedPapers,
});

// Create route tree
const routeTree = rootRoute.addChildren([
  loginRoute,
  dashboardRoute,
  addQuestionRoute,
  questionBankRoute,
  generatePaperRoute,
  paperPreviewRoute,
  generatedPapersRoute
]);

// Create router instance outside component
const router = createRouter({ routeTree });

// Register router for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

function App() {
  const { isInitializing } = useInternetIdentity();

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return <RouterProvider router={router} />;
}

export default App;
