import { Component, inject, OnInit } from '@angular/core';
import { MatButtonModule } from "@angular/material/button";
import { MatIcon } from "@angular/material/icon";
import { MatMenuModule } from "@angular/material/menu";
import { AuthServices } from '../services/auth-services';
import {Chat} from '../services/chat';
import { Router } from '@angular/router';
import { TitleCasePipe } from '@angular/common';
import { User } from '../models/user';
import { TypingIndicator } from '../components/typing-indicator/typing-indicator';


@Component({
  selector: 'app-chat-sidebar',
  imports: [MatButtonModule, MatIcon,MatMenuModule,TitleCasePipe,TypingIndicator],
  templateUrl: './chat-sidebar.html',
  styles: ``,
})
export class ChatSidebar implements OnInit{
  
  authService=inject(AuthServices)
  chatService=inject(Chat);
  router=inject(Router);

  logout(){
    this.authService.logout();
    this.router.navigate(['/login']);
    this.chatService.disConnectConnection();
  }

  ngOnInit(): void {
    this.chatService.startConnection(this.authService.getaccesstoken!);
  }

  OpenChatWindor(user:User){
    this.chatService.currentOpenedChat.set(user);
    this.chatService.loadMessage(1);
  }
}
