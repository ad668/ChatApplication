import { inject } from '@angular/core';
import { CanActivateFn,Router } from '@angular/router';
import { AuthServices } from '../services/auth-services';

export const loginGuard: CanActivateFn = (route, state) => {
  if(inject(AuthServices).isLoggedIn()){
    return false;
  }
  return true;
  // const auth = inject(AuthServices);
  // const router = inject(Router);

  // if (auth.isLoggedIn()) {
  //   // redirect logged-in users away from login/register
  //   return router.parseUrl('/chat');
  // }

  // return true; 

};
