import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import { TranslateService } from 'chomsky';

if (environment.production) {
  enableProdMode();
}

const USER_LOCALE: string = 'en-US';

document.addEventListener('DOMContentLoaded', () => {

  let chomskySubscription: any = TranslateService.use(USER_LOCALE).subscribe(() => {
    chomskySubscription.unsubscribe();
    platformBrowserDynamic().bootstrapModule(AppModule)
      .catch((err: any) => console.log(err)); // tslint:disable-line
  });
});
