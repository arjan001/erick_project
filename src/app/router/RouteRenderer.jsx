import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { routes } from './routes.config';

// Loading component for lazy-loaded routes
const RouteLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
  </div>
);

// Wrap lazy component with Suspense
const LazyRouteWrapper = ({ component: Component, layout: Layout, guard: Guard }) => {
  let content = (
    <Suspense fallback={<RouteLoader />}>
      <Component />
    </Suspense>
  );

  if (Layout) {
    content = <Layout>{content}</Layout>;
  }

  if (Guard) {
    return <Guard>{content}</Guard>;
  }

  return content;
};

export function RouteRenderer() {
  return (
    <Routes>
      {routes.map((route) => {
        const LazyComponent = lazy(route.component);
        
        return (
          <Route
            key={route.path}
            path={route.path}
            element={
              <LazyRouteWrapper
                component={LazyComponent}
                layout={route.layout}
                guard={route.guard}
              />
            }
          />
        );
      })}
      
      {/* Catch-all redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}