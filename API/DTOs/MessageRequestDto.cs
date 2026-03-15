using System;

namespace API.DTOs;

public class MessageRequestDto
{
    public int Id{get;set;}
    public string? SenderID{get;set;}
    public string? ReceiverID{get;set;}
    public string? Content{get;set;}
    public bool IsRead{get;set;}
    public DateTime CreateDate{get;set;}
}
