import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock Monaco Editor
vi.mock('@monaco-editor/react', () => ({
  default: vi.fn(({ value, onChange }) => {
    return (
      <textarea
        data-testid="monaco-editor"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
      />
    );
  }),
}));

// Mock React Flow
vi.mock('reactflow', () => ({
  ReactFlow: vi.fn(({ children }) => <div data-testid="react-flow">{children}</div>),
  Background: vi.fn(() => <div data-testid="react-flow-background" />),
  Controls: vi.fn(() => <div data-testid="react-flow-controls" />),
  MiniMap: vi.fn(() => <div data-testid="react-flow-minimap" />),
  useNodesState: vi.fn(() => [[], vi.fn(), vi.fn()]),
  useEdgesState: vi.fn(() => [[], vi.fn(), vi.fn()]),
  addEdge: vi.fn(),
  useReactFlow: vi.fn(() => ({
    getNodes: vi.fn(() => []),
    getEdges: vi.fn(() => []),
    setNodes: vi.fn(),
    setEdges: vi.fn(),
    fitView: vi.fn(),
  })),
}));

// Mock Framer Motion
vi.mock('framer-motion', () => ({
  motion: {
    div: vi.fn(({ children, ...props }) => <div {...props}>{children}</div>),
    span: vi.fn(({ children, ...props }) => <span {...props}>{children}</span>),
    button: vi.fn(({ children, ...props }) => <button {...props}>{children}</button>),
  },
  AnimatePresence: vi.fn(({ children }) => children),
}));

// Mock React Router
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn(() => vi.fn()),
    useLocation: vi.fn(() => ({
      pathname: '/',
      search: '',
      hash: '',
      state: null,
    })),
    useParams: vi.fn(() => ({})),
    useSearchParams: vi.fn(() => [new URLSearchParams(), vi.fn()]),
  };
});

// Mock window.location
delete (window as any).location;
window.location = {
  ...window.location,
  href: 'http://localhost:3000',
  origin: 'http://localhost:3000',
  pathname: '/',
  search: '',
  hash: '',
  assign: vi.fn(),
  replace: vi.fn(),
  reload: vi.fn(),
};

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
});

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: vi.fn(),
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
};

// Clean up after each test
afterEach(() => {
  vi.clearAllMocks();
  localStorageMock.clear();
  sessionStorageMock.clear();
});