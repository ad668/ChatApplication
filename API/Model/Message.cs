using System;

namespace API.Model;

public class Message
{
    public int Id{get;set;}
    public string? SenderID{get;set;}
    public string? ReceiverID{get;set;}
    public string? Content{get;set;}
    public DateTime CreateDate{get;set;}
    public bool IsRead{get;set;}
    public AppUser? Sender{get;set;}
    public AppUser? Receiver{get;set;}
}
