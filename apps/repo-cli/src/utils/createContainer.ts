import { container, type DependencyContainer, type InjectionToken, instanceCachingFactory } from 'tsyringe';

const registerFactoryHoc =
    (appContainer: DependencyContainer) =>
    <T>(token: InjectionToken<T>, factory: (container: DependencyContainer) => T) => {
        appContainer.register<T>(token, {
            useFactory: instanceCachingFactory<T>(factory),
        });
    };

export const createContainer = (): {
    container: DependencyContainer;
    registerFactory: ReturnType<typeof registerFactoryHoc>;
} => {
    const localContainer = container.createChildContainer();
    const registerFactory = registerFactoryHoc(localContainer);
    return { registerFactory, container: localContainer };
};
