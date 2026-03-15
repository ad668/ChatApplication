import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { ApiResponse } from '../models/api-response';
import { response } from 'express';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root',
})
export class AuthServices {
  private baseurl="http://localhost:5062/api/account";

  private token="token";
 
  private httpclient=inject(HttpClient);

  private safeSetItem(key: string, value: string) {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.setItem(key, value);
    }
  }

  private safeGetItem(key: string): string | null {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      return localStorage.getItem(key);
    }
    return null;
  }


  register(data:FormData):Observable<ApiResponse<string>>{
    return this.httpclient
    .post<ApiResponse<string>>(`${this.baseurl}/register`,data)
    .pipe(
      tap((response: ApiResponse<string>) => {
        localStorage.setItem(this.token,response.data);
      })
    );
  }

  login(email:string,password:string):Observable<ApiResponse<string>>{
    return this.httpclient
    .post<ApiResponse<string>>(`${this.baseurl}/login`,{
      email,
      password
    })
    .pipe(tap((response:ApiResponse<string>)=>{
        if (response.isSuccess){
          localStorage.setItem(this.token,response.data);
        }
        return response;
      }))
  }

  me():Observable<ApiResponse<User>>{
    return this.httpclient.get<ApiResponse<User>>(`${this.baseurl}/me`,{
      headers:{
        "Authorization":`Bearer ${this.getaccesstoken}`,
      },
    })
    .pipe(tap((response)=>{
      if(response.isSuccess){
        const normalized = this.normalizeUser(response.data);
        localStorage.setItem("user",JSON.stringify(normalized));
      }
    }))

  }

  private normalizeUser(user: User): User {
    // Backend returns ProfileImage, but client uses profilePicture.
    // Ensure both are set so templates work regardless of which one is used.
    const normalized = { ...user } as any;

    if (!normalized.profilePicture && normalized.profileImage) {
      normalized.profilePicture = normalized.profileImage;
    }

    if (!normalized.profileImage && normalized.profilePicture) {
      normalized.profileImage = normalized.profilePicture;
    }

    return normalized as User;
  }
  get getaccesstoken():string|null{
    return localStorage.getItem(this.token) || '';
  }

  // isLoggedIn():boolean{
  //   return !!localStorage.getItem(this.token);
  // }
  // isLoggedIn(): boolean {
  //   if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
  //     return !!localStorage.getItem('authToken');
  //   }
  // return false; // fallback for SSR / non-browser 
  // }
  isLoggedIn(): boolean {
    return !!this.safeGetItem(this.token);
  }

  logout(){
    localStorage.removeItem(this.token);
    localStorage.removeItem('user');
  }

  get CurrentLoggedUser(): User | null {
    const stored = this.safeGetItem('user');
    if (!stored) return null;

    try {
      return JSON.parse(stored) as User;
    } catch {
      return null;
    }
  }
  
}
