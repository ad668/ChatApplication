import { Component ,inject,signal} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
// import { inject } from '@angular/core/types/core';
import { AuthServices } from '../services/auth-services';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { error } from 'console';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiResponse } from '../models/api-response';

// import { Router } from 'express';
// import { signal } from '@angular/core/types/_chrome_dev_tools_performance-chunk';

@Component({
  selector: 'app-register',
  imports: [MatFormFieldModule,FormsModule,MatInputModule,MatButtonModule,MatIconModule,RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  email!:string;
  password!:string;
  username!:string;
  fullname!:string;
  profilePicture:string="https://randomuser.me/api/portraits/lego/5.jpg";
  profileImage:File | null=null;

  authService=inject(AuthServices);
  snackBar=inject(MatSnackBar);
  hide=signal(false);
  router=inject(Router);

  togglePassword(event:MouseEvent){
    this.hide.set(!this.hide());
    event.stopPropagation();
  }

  onFileSelected(event:any){
    const file:File=event.target.files[0];
    if(file){
    this.profileImage=file;

    const reader=new FileReader();
    reader.onload=(e)=>{
      this.profilePicture=e.target!.result as string;
      console.log(e.target?.result);  //testing
    };
    reader.readAsDataURL(file);
    console.log(this.profilePicture);   //Testing
  }
  }

  register(){
    let forData=new FormData();
    forData.append('email',this.email);
    forData.append('password',this.password);
    forData.append('fullname',this.fullname);
    forData.append('username',this.username);
    forData.append('profileImage',this.profileImage!);
    this.authService.register(forData).subscribe({
      next:()=>{
        this.snackBar.open("User Registered Successfully.","Close");
      },
      error:(error:HttpErrorResponse)=>{
        let err=error.error as ApiResponse<string>;
        this.snackBar.open(err.errors,"Close");
      },
      complete:()=>{
        this.router.navigate(['/'])
      }
    });
  }
}
