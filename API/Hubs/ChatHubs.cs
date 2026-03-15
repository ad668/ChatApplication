using System;
using System.Collections.Concurrent;
using API.Data;
using API.DTOs;
using API.Extensions;
using API.Model;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace API.Hubs;

[Authorize]
public class ChatHubs(UserManager<AppUser> userManager,AppDbContext context):Hub
{
    public static readonly ConcurrentDictionary<string,OnlineUserdto>
    onlineUsers=new();

    public override async Task OnConnectedAsync()
    {
        var httpContext=Context.GetHttpContext();
        var receiverID=httpContext?.Request.Query["senderId"].ToString();
        var userName=Context.User!.Identity!.Name!;
        var currentUser=await userManager.FindByNameAsync(userName);
        var connectionId=Context.ConnectionId;

        if(onlineUsers.ContainsKey(userName))
        {
            onlineUsers[userName].ConnectionId=connectionId;
        }
        else
        {
            var user=new OnlineUserdto
            {
                ConnectionId=connectionId,
                UserName=userName,
                ProfilePicture=currentUser.ProfileImage,
                fullName=currentUser!.FullName
            };
            onlineUsers.TryAdd(userName,user);
            
            await Clients.AllExcept(connectionId).SendAsync("Notify",currentUser);
        }

        if(!string.IsNullOrEmpty(receiverID))
        {
            await LoadMessages(receiverID);
        }

        await Clients.All.SendAsync("OnlineUsers",await GetAllUsers());

    }

    public async Task LoadMessages(string recipientId,int pagenumber=1)
    {
        int pageSize=10;
        var username=Context.User!.Identity!.Name;
        var currentUser=await userManager.FindByNameAsync(username);
        if(currentUser is null)
        {
            return;
        }
        List<MessageResponseDto> messages=await context.Messages.Where(x=>x.ReceiverID==currentUser!.Id && x.SenderID==recipientId ||x.SenderID==currentUser!.Id && x.ReceiverID==recipientId).OrderByDescending(x=>x.CreateDate).Skip((pagenumber-1)*pageSize).Take(pageSize).OrderBy(x=>x.CreateDate).Select(x=> new MessageResponseDto
        {
            Id=x.Id,
            Content=x.Content,
            CreateDate=x.CreateDate,
            ReceiverID=x.ReceiverID,
            SenderID=x.SenderID
        }).ToListAsync();

        foreach(var message in messages)
        {
            var msg=await context.Messages.FirstOrDefaultAsync(x=>x.Id==message.Id);

            if (msg!=null && msg.ReceiverID==currentUser.Id)
            {
                msg.IsRead=true;
                await context.SaveChangesAsync();
            }    
        }

        await Clients.User(currentUser.Id).SendAsync("ReceiveMessageList",messages);
    }
    public async Task SendMessage(MessageRequestDto message)
    {
        var senderId=Context.User!.Identity!.Name;
        var recipientId=message.ReceiverID;
        var newMsg= new Message
        {
            Sender=await userManager.FindByNameAsync(senderId!),
            Receiver=await userManager.FindByIdAsync(recipientId),
            IsRead=false,
            CreateDate=DateTime.UtcNow,
            Content=message.Content
        };
        context.Messages.Add(newMsg);
        await context.SaveChangesAsync();

        await Clients.User(recipientId!).SendAsync("ReceiveNewMessage",newMsg);
    }

    public async Task NotifyTyping(string recipientUserName)
    {
        var senderUserName=Context.User!.Identity!.Name;

        if (senderUserName is null)
        {
            return;
        }
        var connectionId=onlineUsers.Values.FirstOrDefault(x=>x.UserName==recipientUserName)?.ConnectionId;

        if(connectionId!=null)
        {
            await Clients.Client(connectionId).SendAsync("NotifyTypingToUser",senderUserName);
        }
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var username=Context.User!.Identity!.Name;
        onlineUsers.TryRemove(username!,out _);
        await Clients.All.SendAsync("OnlineUsers",await GetAllUsers());
    }
    private async Task<IEnumerable<OnlineUserdto>> GetAllUsers()
    {
        var username=Context.User!.GetUserName();
        var onlineuserSet=new HashSet<string>(onlineUsers.Keys);
        var users=await userManager.Users.Select(u=> new OnlineUserdto
        {
            Id=u.Id,
            UserName=u.UserName,
            fullName=u.FullName,
            ProfilePicture=u.ProfileImage,
            IsOnline=onlineuserSet.Contains(u.UserName!),
            UnreadCount=context.Messages.Count(x=>x.ReceiverID==username && x.SenderID==u.Id && !x.IsRead)
        }).OrderByDescending(u=>u.IsOnline).ToListAsync();

        return users;

    }
}
