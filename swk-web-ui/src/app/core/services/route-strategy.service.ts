import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, DetachedRouteHandle, RouteReuseStrategy } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class RouteStrategyService implements RouteReuseStrategy {
  // 缓存的页面
  public static pages: Map<string, DetachedRouteHandle> = new Map();
  // 从缓存中删除某一个页面
  public static deleteRouteSnapshot(path: string): void {
    if (path.startsWith('/')) {
      const name = path.slice(1).replace(/\//g, '_');
      if (RouteStrategyService.pages.has(name)) {
        RouteStrategyService.pages.delete(name);
      }
    } else {
      const name = path.replace(/\//g, '_');
      if (RouteStrategyService.pages.has(name)) {
        RouteStrategyService.pages.delete(name);
      }
    }
  }
  // 清除路由缓存
  public static clear(): void {
    setTimeout(() => {
      RouteStrategyService.pages.clear();
    }, 200);
  }

  /**
   * 判断当前路由是否需要缓存
   * 这个方法返回false时则路由发生变化并且其余方法会被调用
   * @param ActivatedRouteSnapshot future
   * @param ActivatedRouteSnapshot curr
   * @returns boolean
   */
  public shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
    return future.routeConfig === curr.routeConfig && JSON.stringify(future.params) === JSON.stringify(curr.params);
  }
  /**
   * 当离开当前路由时这个方法会被调用
   * 如果返回 true 则 store 方法会被调用
   * @param ActivatedRouteSnapshot route
   * @returns boolean
   */
  public shouldDetach(route: ActivatedRouteSnapshot): boolean {
    if (route.data['reuse']) {
      return true;
    }
    return false;
  }
  /**
   * 将路由写入缓存
   * 在这里具体实现如何缓存 RouteHandle
   * 提供了我们离开的路由和 RouteHandle
   * @param ActivatedRouteSnapshot route
   * @param DetachedRouteHandle detachedTree
   */
  public store(route: ActivatedRouteSnapshot, detachedTree: DetachedRouteHandle): void {
    RouteStrategyService.pages.set(this.getPath(route), detachedTree);
  }
  /**
   * 路由被导航 如果此方法返回 true 则触发 retrieve 方法
   * 如果返回 false 这个组件将会被重新创建
   * @param ActivatedRouteSnapshot route
   * @returns boolean
   */
  public shouldAttach(route: ActivatedRouteSnapshot): boolean {
    return !!RouteStrategyService.pages.has(this.getPath(route));
  }
  /**
   * 从缓存读取cached route
   * 提供当前路由的参数（刚打开的路由），并且返回一个缓存的 RouteHandle
   * 可以使用这个方法手动获取任何已被缓存的 RouteHandle
   * @param ActivatedRouteSnapshot route
   * @returns (DetachedRouteHandle | null)
   */
  public retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle | null {
    return RouteStrategyService.pages.get(this.getPath(route)) || null;
  }
  /**
   * 从路由中获取path的key
   * 提供当前路由的参数（刚打开的路由），并且返回一个缓存的 RouteHandle
   * 可以使用这个方法手动获取任何已被缓存的 RouteHandle
   * @param ActivatedRouteSnapshot route
   * @returns string path
   */
  private getPath(route: ActivatedRouteSnapshot): string {
    return this.getFullRouteUrlPaths(route).filter(Boolean).join('/').replace(/\//g, '_');
  }

  private getFullRouteUrlPaths(route: ActivatedRouteSnapshot): string[] {
    const paths = this.getRouteUrlPaths(route);
    return route.parent ? [...this.getFullRouteUrlPaths(route.parent), ...paths] : paths;
  }

  private getRouteUrlPaths(route: ActivatedRouteSnapshot): string[] {
    return route.url.map(urlSegment => urlSegment.path);
  }
}
