import { type App, type Directive, type DirectiveHook } from 'vue';

const isDev = import.meta.env.DEV;

const mounted: DirectiveHook<Element> = (el) => {
  const { parentNode } = el;
  if (!parentNode) return;
  if (!isDev) {
    parentNode.removeChild(el);
  }
};

const devOnlyDirective: Directive = {
  mounted,
};

export function setupDevOnlyDirective(app: App) {
  app.directive('devOnly', devOnlyDirective);
}

export default devOnlyDirective;
