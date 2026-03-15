import { Component,signal,inject } from '@angular/core';
import{ Router, RouterLink } from '@angular/router';
// import { inject } from '@angular/core/types/primitives-di';
// import { signal } from '@angular/core/types/_chrome_dev_tools_performance-chunk';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { AuthServices } from '../services/auth-services';
// import { I } from '@angular/cdk/keycodes';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiResponse } from '../models/api-response';
// import { Router } from 'express';

@Component({
  selector: 'app-login',
  imports: [MatInputModule, MatIconModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {

  email!:string;
  password!:string;

  private authservice=inject(AuthServices);
  private snackbar=inject(MatSnackBar);
  private router=inject(Router);
  // router=inject(Router);
  hide=signal(false);

  login(){
    this.authservice.login(this.email,this.password).subscribe({
        next:()=>{
          this.authservice.me().subscribe();
          this.snackbar.open('Logged in Successfully','Close');
        },
        error:(err:HttpErrorResponse)=>{
          let error=err.error as ApiResponse<string>;
          this.snackbar.open(error.errors,'Close',{
            duration:3000,
          });
        },
        complete: ()=>{
          this.router.navigate(['/']);
        },
      });
    // }
  }
  togglePassword(event:MouseEvent){
    this.hide.set(!this.hide());
    event.stopPropagation();
  }
}
