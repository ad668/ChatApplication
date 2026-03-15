import { Component, inject } from '@angular/core';
import { Chat } from '../../services/chat';
// import { CdkAriaLive } from "../../../../node_modules/@angular/cdk/types/_a11y-module-chunk";
import { TitleCasePipe } from '@angular/common';
import { MatIcon } from "@angular/material/icon";
import { FormsModule } from '@angular/forms';
import { ChatBox } from "../chat-box/chat-box";

@Component({
  selector: 'app-chat-window',
  imports: [TitleCasePipe, MatIcon, FormsModule, ChatBox],
  templateUrl: './chat-window.html',
  styles: ``,
})
export class ChatWindow {
  chatService=inject(Chat)
  message:string='';

  SendMessage(){
    if(!this.message) return;
    this.chatService.sendMessage(this.message);
    // this.message;
  }
}
