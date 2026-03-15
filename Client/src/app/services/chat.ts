import { inject, Injectable, signal } from '@angular/core';
import { User } from '../models/user';
import { AuthServices } from './auth-services';
import{HubConnection, HubConnectionBuilder,HubConnectionState} from '@microsoft/signalr';
import { Message } from '../models/message';
import { Console } from 'console';
// import { sign } from 'crypto';
// import { error } from 'console';
// import { sign } from 'crypto';

@Injectable({
  providedIn: 'root',
})
export class Chat {

  private authServices=inject(AuthServices);
  private hubUrl='http://localhost:5062/hubs/chat';
  onlineUsers=signal<User[]>([]);

  // CurrentOpenChat
  currentOpenedChat=signal<User|null>(null);
  chatMessages=signal<Message[]>([]);
  isloading=signal<boolean>(true);

  autoScrollEnabled=signal<boolean>(true);

  private hubConnection?:HubConnection;

  startConnection(token:string,senderId?:string){
    this.hubConnection=new HubConnectionBuilder()
      .withUrl(`${this.hubUrl}?senderId=${senderId || ''}`,{
        accessTokenFactory:()=>token
      }).withAutomaticReconnect()
      .build();

      this.hubConnection.start()
      .then(()=>{
        console.log("Connection Started")
      })
      .catch((error)=>{
        console.log("Connection Failed");
      });

      this.hubConnection!.on("Notify",(user:User)=>{
        Notification.requestPermission().then((result)=>{
          if(result=="granted")
          {
            new Notification('Active now 🟠',{
            body:user.fullName+' is online now',
            icon:user.profileImage,
          });
          }
        });
      });

      this.hubConnection!.on("NotifyTypingToUser",(senderUserName)=>{
        this.onlineUsers.update((users)=>
          users.map((user)=>{
            if(user.userName===senderUserName)
            {
              user.isTyping=true;
            }
            return user;
          })
        );
        setTimeout(()=>{
        this.onlineUsers.update((users)=>
        users.map((user)=>{
          if(user.userName===senderUserName)
            {
              user.isTyping=false;
            }
            return user;
        })
      );
      },2000);
      });

      this.hubConnection!.on('OnlineUsers',(user:User[])=>{
        console.log(user);

        this.onlineUsers.update(()=>
          user.filter(user=>user.userName !==this.authServices.CurrentLoggedUser!.userName)
        );
      });
    
      this.hubConnection!.on("ReceiveMessageList",(message)=>{
        // Replace current list with the messages returned from the server (history load).
        this.isloading.update(()=>true);
        this.chatMessages.set(Array.isArray(message) ? message : []);
        this.isloading.update(()=>false);
      });

      // this.hubConnection!.on("ReceiveNewMessage",(message)=>{
      //   const currentChat = this.currentOpenedChat();
      //   if (!currentChat) return;

      //   // Only show new messages that belong to the open chat.
      //   if (message.senderID === currentChat.id || message.receiverID === currentChat.id) {
      //     this.chatMessages.update(existing => [...existing, message]);
      //   }
      // });
      this.hubConnection!.on("ReceiveNewMessage",(message:Message)=>{
        document.title='(1) New Message';

        this.chatMessages.update((messages)=>[...messages,message]);
      })
  }
  disConnectConnection(){
    if(this.hubConnection?.state===HubConnectionState.Connected)
    {
      this.hubConnection?.stop().catch(error=>console.log(error));
    }
  }
  
  status(userName:string):string{
    const currentChatUser=this.currentOpenedChat();
    if(!currentChatUser)
    {
      return 'offline';
    }
    const onlineUser=this.onlineUsers().find(
      (user)=>user.userName===userName
    )
    return onlineUser?.isTyping?'Typing...':this.isUserOnline();
  }
  isUserOnline(): string {
    const currentChat = this.currentOpenedChat();
    const onlineUser = this.onlineUsers().find(
      (user) => user.userName === currentChat?.userName
    );

    // Ensure we always return a string (never undefined)
    if (onlineUser?.isOnline) {
      return 'online';
    }

    return currentChat?.userName ?? '';
  }

  loadMessage(pagenumber:number){
    // this.isloading.update(()=>true);
    this.isloading.set(true);
    this.hubConnection?.invoke("LoadMessages",this.currentOpenedChat()?.id,pagenumber)
    .then()
    .catch((err)=>{
      console.error('LoadMessages failed', err);
    })
    .finally(()=>{
      this.isloading.update(()=>false);
    })
  }

  // sendMessage(){
  //   const chat = this.currentOpenedChat();
  //   const me = this.authServices.CurrentLoggedUser;
  //   if (!chat?.id || !me?.id) {
  //     return;
  //   }

  //   Optimistically render the message in the UI for the sender.
  //   const outgoing: Message = {
  //     id: Date.now(),
  //     senderID: me.id,
  //     receiverID: chat.id,
  //     content,
  //     createDate: new Date().toISOString(),
  //     isRead: true,
  //   };

  //   this.chatMessages.update(existing => [...existing, outgoing]);

  //   this.hubConnection?.invoke('SendMessage', {
  //     receiverID: chat.id,
  //     content,
  //   }).catch(err => console.error('SendMessage failed', err));
  // }
  sendMessage(message:string){
    this.chatMessages.update((messages)=>[
      ...messages,
      {
        content:message,
        senderID:this.authServices.CurrentLoggedUser!.id,
        receiverID:this.currentOpenedChat()?.id!,
        createDate:new Date().toString(),
        isRead:false,
        id:0
      }
    ])
    this.hubConnection?.invoke('SendMessage',{
      receiverID:this.currentOpenedChat()?.id,
      content:message
    }).then((id)=>{
      console.log("message send to",id);
    }).catch((error)=>{
      console.log(error);
    })
  }

  NotifyTyping(){
    this.hubConnection!.invoke('NotifyTyping',this.currentOpenedChat()?.userName)
    .then((x)=>{console.log("notify for",x)}).catch((error)=>{
      console.log(error);
    })
  }

}

