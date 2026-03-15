import { inject } from '@angular/core';
import { CanActivateFn,Router } from '@angular/router';
import { AuthServices } from '../services/auth-services';
// import { Router } from 'express';

export const authGuard: CanActivateFn = (route, state) => {
  if(inject(AuthServices).isLoggedIn()){
    return true;
  }
  inject(Router).navigate(["/login"]);
  return false;

  // const auth = inject(AuthServices);
  // const router = inject(Router);

  // if (auth.isLoggedIn()) {
  //   return true; // allow access
  // }

  // // redirect to login if not logged in
  // return router.parseUrl('/login');


};
