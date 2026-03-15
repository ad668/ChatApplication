import { AfterViewChecked, Component, ElementRef, inject, ViewChild, viewChild } from '@angular/core';
import { Chat } from '../../services/chat';
import {MatProgressSpinner} from "@angular/material/progress-spinner" 
import { AuthServices } from '../../services/auth-services';
import { DatePipe } from '@angular/common';
import { MatIcon, MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-chat-box',
  imports: [MatProgressSpinner,DatePipe,MatIconModule],
  templateUrl: './chat-box.html',
  styleUrl: './chat-box.css',
})
export class ChatBox implements AfterViewChecked{
  
  @ViewChild('chatBox',{read:ElementRef}) public chatBox?:ElementRef;

  chatService=inject(Chat);
  authService=inject(AuthServices);

  private pagenumber=2;

  loadMoreMessage(){
    this.pagenumber++;
    this.chatService.loadMessage(this.pagenumber);
    this.scrollTop();
    // Do not auto-scroll when loading older messages.
    // This keeps the current view stable and allows users to read older messages.
  }

  ngAfterViewChecked(): void {
    // throw new Error('Method not implemented.');
    if(this.chatService.autoScrollEnabled())
    {
        this.scrollToBotton();
    }
  }

  scrollToBotton(){
    this.chatService.autoScrollEnabled.set(true);
    this.chatBox!.nativeElement.scrollTo({
      top:this.chatBox!.nativeElement.scrollHeight,
      behavior:'smooth',
    });
  }

  scrollTop(){
    this.chatService.autoScrollEnabled.set(false);
    this.chatBox!.nativeElement.scrollTo({
      top:0,
      behavior:'smooth',
    });
  }
}
