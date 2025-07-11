import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { es_ES, provideNzI18n } from 'ng-zorro-antd/i18n';
import { registerLocaleData } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import es from '@angular/common/locales/es';

import { routes } from './app.routes';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { iconsProvider } from './icons-provider';
import { authInterceptor } from './core/interceptors/auth.interceptor';

registerLocaleData(es);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    //provideClientHydration(withEventReplay()),
    provideNzI18n(es_ES),
    importProvidersFrom(FormsModule),
    provideAnimationsAsync(),
    provideHttpClient(
      withFetch(),
      withInterceptors([
        authInterceptor,  // Debe ir primero
        errorInterceptor
      ])
    ),
    iconsProvider
  ]
};