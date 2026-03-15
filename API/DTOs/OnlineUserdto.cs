using System;

namespace API.DTOs;

public class OnlineUserdto
{
    public string? Id{get;set;}
    public string? ConnectionId{get;set;}
    public string? UserName{get;set;}
    public string? fullName{get;set;}
    public  string? ProfilePicture{get;set;}
    public bool IsOnline{get;set;}
    public int UnreadCount{get;set;}
}
